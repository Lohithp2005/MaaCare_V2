import cv2
import numpy as np
import mediapipe as mp
import base64
from collections import deque
import time

class BicepCurlController:
    def __init__(self):
        self.mp_pose = mp.solutions.pose
        self.pose = self.mp_pose.Pose(
            model_complexity=1,
            smooth_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.6,
        )
        self.counter = 0
        self.angle_history = deque(maxlen=5)
        self.ready_for_rep = False
        self.top_hold_frames = 0
        self.last_rep_time = 0.0

        # Hysteresis thresholds for robust bicep-curl counting.
        self.bottom_threshold = 150.0
        self.top_threshold = 55.0
        self.min_rep_interval_sec = 0.9
        self.required_top_hold_frames = 2
        
    def calculate_angle(self, a, b, c):
        a = np.array(a) # Shoulder
        b = np.array(b) # Elbow
        c = np.array(c) # Wrist
        
        radians = np.arctan2(c[1]-b[1], c[0]-b[0]) - np.arctan2(a[1]-b[1], a[0]-b[0])
        angle = np.abs(radians*180.0/np.pi)
        
        if angle > 180.0:
            angle = 360-angle
            
        return angle

    def process_frame(self, data_url: str):
        encoded_data = data_url.split(',')[1]
        nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            return self.counter, "Invalid frame from camera", [], None

        # Keep moderate resolution for better keypoint stability while still fast enough for realtime.
        frame = cv2.resize(frame, (400, 300), interpolation=cv2.INTER_AREA)

        image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        image.flags.writeable = False
        results = self.pose.process(image)
        
        feedback = "No person detected"
        keypoints = []
        angle = None
        
        if results.pose_landmarks:
            landmarks = results.pose_landmarks.landmark

            # Keep only visible landmarks so the frontend can render a clean overlay.
            for landmark in landmarks:
                if landmark.visibility > 0.4:
                    keypoints.append({"x": landmark.x, "y": landmark.y, "visibility": landmark.visibility})
            
            left_shoulder = landmarks[self.mp_pose.PoseLandmark.LEFT_SHOULDER.value]
            left_elbow = landmarks[self.mp_pose.PoseLandmark.LEFT_ELBOW.value]
            left_wrist = landmarks[self.mp_pose.PoseLandmark.LEFT_WRIST.value]

            right_shoulder = landmarks[self.mp_pose.PoseLandmark.RIGHT_SHOULDER.value]
            right_elbow = landmarks[self.mp_pose.PoseLandmark.RIGHT_ELBOW.value]
            right_wrist = landmarks[self.mp_pose.PoseLandmark.RIGHT_WRIST.value]

            left_score = left_shoulder.visibility + left_elbow.visibility + left_wrist.visibility
            right_score = right_shoulder.visibility + right_elbow.visibility + right_wrist.visibility

            # Track whichever arm is more visible to reduce noisy angle estimation.
            if right_score > left_score:
                shoulder = [right_shoulder.x, right_shoulder.y]
                elbow = [right_elbow.x, right_elbow.y]
                wrist = [right_wrist.x, right_wrist.y]
                tracked_visibility = right_score / 3.0
            else:
                shoulder = [left_shoulder.x, left_shoulder.y]
                elbow = [left_elbow.x, left_elbow.y]
                wrist = [left_wrist.x, left_wrist.y]
                tracked_visibility = left_score / 3.0
            
            if tracked_visibility < 0.55:
                self.top_hold_frames = 0
                feedback = "Move closer and keep your arm fully visible."
                return self.counter, feedback, keypoints, angle

            raw_angle = self.calculate_angle(shoulder, elbow, wrist)
            self.angle_history.append(raw_angle)
            angle = float(np.mean(self.angle_history))

            # Arm is fully extended; system is armed for one future rep.
            if angle >= self.bottom_threshold:
                self.ready_for_rep = True
                self.top_hold_frames = 0
                feedback = "Good extension. Curl up now."
            elif angle <= self.top_threshold:
                self.top_hold_frames += 1

                # Count only after full extension + short top hold + cooldown.
                now = time.time()
                if (
                    self.ready_for_rep
                    and self.top_hold_frames >= self.required_top_hold_frames
                    and (now - self.last_rep_time) >= self.min_rep_interval_sec
                ):
                    self.counter += 1
                    self.ready_for_rep = False
                    self.top_hold_frames = 0
                    self.last_rep_time = now
                    feedback = "Rep counted. Lower with control and extend fully."
                else:
                    feedback = "Hold briefly at the top."
            else:
                self.top_hold_frames = 0
                if self.ready_for_rep:
                    feedback = "Keep curling to complete the rep."
                else:
                    feedback = "Lower your arm fully before the next rep."

        return self.counter, feedback, keypoints, angle