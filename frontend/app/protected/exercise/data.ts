// app/exercises/data.ts

export interface ExerciseConfig {
    id: string;
    title: string;
    monthNumber: number;
    description: string;
    videoUrl: string;
    // This tells your OpenCV model exactly what landmarks or gesture to track
    expectedGesture: "face_mesh" | "hand_pose" | "posture_alignment" | "squat_depth";
    instructions: string[];
}

export const EXERCISE_DATA: Record<string, ExerciseConfig> = {
    "month-1": {
        id: "month-1",
        title: "Month 1: Basic Posture & Alignment",
        monthNumber: 1,
        description: "Focus on establishing a solid foundation. This exercise checks your spine alignment and neck angle using your camera.",
        videoUrl: "/videos/month1-demo.mp4", // Replace with your actual video paths or public links
        expectedGesture: "posture_alignment",
        instructions: [
            "Sit straight or stand facing the camera completely parallel.",
            "Ensure your entire upper body is visible in the frame.",
            "Hold the calibrated pose for 10 seconds to complete the check."
        ]
    },
    "month-2": {
        id: "month-2",
        title: "Month 2: Hand Mobility & Tracking",
        monthNumber: 2,
        description: "Track finger agility and hand open/close range of motion using fine-grain computer vision mesh nodes.",
        videoUrl: "/videos/month2-demo.mp4",
        expectedGesture: "hand_pose",
        instructions: [
            "Raise your dominant hand up to chest level.",
            "Slowly open your palm fully, then close it into a tight fist.",
            "Repeat the open-and-close cycle smoothly following the video coach."
        ]
    },
    "month-3": {
        id: "month-3",
        title: "Month 3: Facial Tracking & Reflexes",
        monthNumber: 3,
        description: "Analyze micro-expressions, blink rate, and symmetry tracking using rapid landmark point arrays.",
        videoUrl: "/videos/month3-demo.mp4",
        expectedGesture: "face_mesh",
        instructions: [
            "Remove glasses if possible and check that your lighting is bright.",
            "Keep your face inside the green bounding box on your screen.",
            "Follow the target points with your eyes without moving your head."
        ]
    }
};