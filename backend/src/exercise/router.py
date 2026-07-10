from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from src.exercise.controller import BicepCurlController
import json

router = APIRouter(tags=["Exercise"])

# The {month_id} path parameter automatically captures whatever the frontend sends
@router.websocket("/ws/exercise/{month_id}")
async def websocket_endpoint(websocket: WebSocket, month_id: str):
    await websocket.accept()
    print(f"Initializing AI Workspace Engine for session: {month_id}")
    controller = BicepCurlController()
    
    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            frame_data = payload.get("image")
            
            if frame_data:
                count, feedback, keypoints, angle = controller.process_frame(frame_data)
                
                await websocket.send_json({
                    "count": count,
                    "feedback": f"[{month_id.upper()}] {feedback}",
                    "keypoints": keypoints,
                    "angle": angle,
                })
    except WebSocketDisconnect:
        print(f"Session disconnected: {month_id}")