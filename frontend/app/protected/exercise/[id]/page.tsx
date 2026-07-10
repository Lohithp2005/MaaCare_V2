"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Webcam from "react-webcam";
import { EXERCISE_DATA } from "../data";

type PosePoint = {
  x: number;
  y: number;
  visibility: number;
};

type ExerciseMessage = {
  count?: number;
  feedback?: string;
  keypoints?: PosePoint[];
  angle?: number | null;
};

const OVERLAY_WIDTH = 640;
const OVERLAY_HEIGHT = 480;

export default function ExerciseDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const frameInFlightRef = useRef(false);
  const smoothedKeypointsRef = useRef<PosePoint[]>([]);

  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [metrics, setMetrics] = useState({
    count: 0,
    feedback: "Turn on camera to start guided tracking.",
    angle: null as number | null,
    keypoints: [] as PosePoint[],
  });

  const exerciseConfig = useMemo(() => {
    if (!id) return null;
    return EXERCISE_DATA[id] ?? null;
  }, [id]);

  useEffect(() => {
    if (!id || !isCameraOn) {
      wsRef.current?.close();
      wsRef.current = null;
      setIsConnected(false);
      return;
    }

    const ws = new WebSocket(`ws://localhost:8000/ws/exercise/${id}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      frameInFlightRef.current = false;
      setMetrics((prev) => ({
        ...prev,
        feedback: "Camera connected. Start moving to track body keypoints.",
      }));
    };

    ws.onmessage = (event) => {
      const data: ExerciseMessage = JSON.parse(event.data);
      frameInFlightRef.current = false;

      const incomingKeypoints = data.keypoints ?? [];
      const prevPoints = smoothedKeypointsRef.current;
      const alpha = 0.35;

      const smoothedKeypoints =
        prevPoints.length === incomingKeypoints.length
          ? incomingKeypoints.map((point, index) => {
              const prev = prevPoints[index];
              return {
                x: prev.x * (1 - alpha) + point.x * alpha,
                y: prev.y * (1 - alpha) + point.y * alpha,
                visibility: point.visibility,
              };
            })
          : incomingKeypoints;

      smoothedKeypointsRef.current = smoothedKeypoints;

      setMetrics((prev) => ({
        count: data.count ?? prev.count,
        feedback: data.feedback ?? prev.feedback,
        keypoints: smoothedKeypoints,
        angle: typeof data.angle === "number" ? data.angle : null,
      }));
    };

    ws.onclose = () => {
      setIsConnected(false);
      frameInFlightRef.current = false;
      smoothedKeypointsRef.current = [];
    };

    ws.onerror = () => {
      frameInFlightRef.current = false;
      setMetrics((prev) => ({
        ...prev,
        feedback: "Connection issue. Check backend and retry.",
      }));
    };

    return () => {
      ws.close();
      wsRef.current = null;
      setIsConnected(false);
      smoothedKeypointsRef.current = [];
    };
  }, [id, isCameraOn]);

  useEffect(() => {
    if (!isCameraOn || !isConnected) return;

    const intervalId = setInterval(() => {
      if (!webcamRef.current || wsRef.current?.readyState !== WebSocket.OPEN) return;
      if (frameInFlightRef.current) return;

      const image = webcamRef.current.getScreenshot();
      if (image) {
        frameInFlightRef.current = true;
        wsRef.current.send(JSON.stringify({ image }));
      }
    }, 66);

    return () => clearInterval(intervalId);
  }, [isCameraOn, isConnected]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!isCameraOn || metrics.keypoints.length === 0) return;

    ctx.fillStyle = "rgba(34, 197, 94, 0.9)";

    for (const point of metrics.keypoints) {
      // Mirror x-axis to match mirrored webcam preview.
      const x = (1 - point.x) * canvas.width;
      const y = point.y * canvas.height;

      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fill();
    }
  }, [metrics.keypoints, isCameraOn]);

  if (!id) {
    return <div className="p-6">Loading workspace...</div>;
  }

  return (
    <div className="p-6 w-full mx-auto font-sans min-h-screen bg-slate-50">
      <h1 className="text-3xl font-bold mb-2 text-slate-800 capitalize">
        Exercise: {id.replace(/[-_]/g, " ")}
      </h1>
      <p className="text-sm text-slate-600 mb-6">
        Turn on camera to view Mediapipe body keypoints and receive live exercise guidance.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 w-full flex flex-col gap-4">
          <div className="relative w-full aspect-video bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
            {isCameraOn ? (
              <>
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  screenshotQuality={0.6}
                  className="w-full h-full object-cover scale-x-[-1]"
                  videoConstraints={{ width: 480, height: 360, facingMode: "user" }}
                />
                <canvas
                  ref={canvasRef}
                  width={OVERLAY_WIDTH}
                  height={OVERLAY_HEIGHT}
                  className="absolute inset-0 w-full h-full pointer-events-none"
                />
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 font-semibold">
                Camera is off
              </div>
            )}

            <div className="absolute top-3 left-3 bg-slate-900/75 text-white text-xs px-3 py-1.5 rounded-lg">
              {isConnected ? "Tracking active" : "Not connected"}
            </div>
          </div>

          <button
            onClick={() => setIsCameraOn((prev) => !prev)}
            className={`w-full py-3.5 px-4 rounded-xl font-bold tracking-wide shadow-sm transition-colors text-white ${
              isCameraOn ? "bg-red-500 hover:bg-red-600" : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {isCameraOn ? "Turn Camera OFF" : "Turn Camera ON"}
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">Live Coach</h2>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <p className="text-xs uppercase text-slate-400">Reps</p>
              <p className="text-3xl font-black text-emerald-600">{metrics.count}</p>
            </div>
      
          </div>

          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
            <p className="text-xs uppercase font-semibold text-emerald-700">Guidance</p>
            <p className="text-sm text-slate-700 mt-1">{metrics.feedback}</p>
          </div>

          <p className="text-sm text-slate-600">
            Elbow angle: <span className="font-semibold text-slate-800">{metrics.angle === null ? "-" : `${metrics.angle.toFixed(1)}°`}</span>
          </p>

          {exerciseConfig?.instructions?.length ? (
            <div>
              <p className="text-xs uppercase text-slate-500 font-semibold mb-2">Exercise steps</p>
              <ul className="text-sm text-slate-700 space-y-1">
                {exerciseConfig.instructions.map((instruction, index) => (
                  <li key={instruction}>{index + 1}. {instruction}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}