
import React, { useRef, useEffect, useState } from 'react';
import { TreeState } from '../types';

interface GestureControllerProps {
  active: boolean;
  onGesture: (state: TreeState) => void;
  onPositionUpdate: (x: number, y: number) => void;
}

const GestureController: React.FC<GestureControllerProps> = ({ active, onGesture, onPositionUpdate }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [debugMsg, setDebugMsg] = useState('Initializing...');

  useEffect(() => {
    if (!active) {
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
      return;
    }

    let stream: MediaStream | null = null;
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setDebugMsg('Camera Active');
        }
      } catch (err) {
        setDebugMsg('Camera Failed');
        console.error(err);
      }
    };

    startCamera();

    // Logic for mock gesture detection since full MediaPipe is heavy for single-file demo
    // We analyze the image luminosity or simplified blobs as a proxy, 
    // but in a production app we'd load @mediapipe/hands here.
    const interval = setInterval(() => {
      if (!videoRef.current || !canvasRef.current) return;
      
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(videoRef.current, 0, 0, 160, 120);
      const imageData = ctx.getImageData(0, 0, 160, 120);
      
      // Basic movement tracking (finding the brightest/most moving point as proxy for hand)
      let sumX = 0, sumY = 0, count = 0;
      for (let i = 0; i < imageData.data.length; i += 4) {
        const r = imageData.data[i];
        if (r > 200) { // Simple thresholding
          const pIdx = i / 4;
          sumX += pIdx % 160;
          sumY += Math.floor(pIdx / 160);
          count++;
        }
      }

      if (count > 50) {
        const avgX = (sumX / count) / 160;
        const avgY = (sumY / count) / 120;
        onPositionUpdate(avgX, avgY);
        
        // Simple "gesture": If blob is large, assume OPEN (Chaos), if small assume CLOSED (Tree)
        if (count > 800) {
          onGesture(TreeState.CHAOS);
          setDebugMsg('Gesture: UNLEASH (OPEN)');
        } else if (count > 50 && count < 400) {
          onGesture(TreeState.FORMED);
          setDebugMsg('Gesture: FORM (CLOSED)');
        }
      }
    }, 100);

    return () => {
      clearInterval(interval);
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, [active, onGesture, onPositionUpdate]);

  if (!active) return null;

  return (
    <div className="relative border-2 border-[#D4AF37]/50 rounded-lg overflow-hidden bg-black w-40 h-30 shadow-2xl">
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted 
        className="w-full h-full object-cover grayscale opacity-50"
      />
      <canvas ref={canvasRef} width={160} height={120} className="hidden" />
      <div className="absolute inset-0 flex flex-col items-center justify-end p-1 bg-gradient-to-t from-black/80 to-transparent">
        <span className="text-[8px] font-mono text-[#D4AF37] uppercase animate-pulse">{debugMsg}</span>
      </div>
    </div>
  );
};

export default GestureController;
