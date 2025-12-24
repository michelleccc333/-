
import React, { useState, Suspense, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { Loader, OrbitControls, Environment, Float } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import { TreeState } from './types';
import Experience from './components/Experience';
import GestureController from './components/GestureController';
import { COLORS } from './constants';

const App: React.FC = () => {
  const [treeState, setTreeState] = useState<TreeState>(TreeState.FORMED);
  const [cameraOffset, setCameraOffset] = useState({ x: 0, y: 0 });
  const [isCameraActive, setIsCameraActive] = useState(false);

  const toggleState = useCallback((state: TreeState) => {
    setTreeState(state);
  }, []);

  const handleCameraUpdate = useCallback((x: number, y: number) => {
    // Smooth camera offset based on hand position
    setCameraOffset({ x: (x - 0.5) * 10, y: (0.5 - y) * 5 });
  }, []);

  return (
    <div className="w-full h-screen bg-[#010a08] relative">
      {/* UI Overlay */}
      <div className="absolute top-8 left-8 z-10 pointer-events-none">
        <h1 className="text-4xl font-serif font-bold tracking-widest uppercase mb-1 drop-shadow-lg" style={{ color: COLORS.GOLD }}>
          The Grand Luxury
        </h1>
        <p className="text-emerald-200 text-xs tracking-[0.3em] font-light">EST. 2024 • INTERACTIVE CHRISTMAS TREE</p>
      </div>

      <div className="absolute bottom-8 right-8 z-10 flex flex-col items-end space-y-4">
        <div className="bg-black/40 border border-[#D4AF37]/30 backdrop-blur-md p-4 rounded-lg">
          <p className="text-[#D4AF37] text-xs font-bold mb-2 uppercase tracking-widest">Control Terminal</p>
          <div className="flex gap-2">
            <button 
              onClick={() => toggleState(TreeState.FORMED)}
              className={`px-4 py-2 text-xs font-bold border transition-all ${treeState === TreeState.FORMED ? 'bg-[#D4AF37] text-black border-[#D4AF37]' : 'bg-transparent text-[#D4AF37] border-[#D4AF37]/50 hover:bg-[#D4AF37]/10'}`}
            >
              FORMED
            </button>
            <button 
              onClick={() => toggleState(TreeState.CHAOS)}
              className={`px-4 py-2 text-xs font-bold border transition-all ${treeState === TreeState.CHAOS ? 'bg-[#D4AF37] text-black border-[#D4AF37]' : 'bg-transparent text-[#D4AF37] border-[#D4AF37]/50 hover:bg-[#D4AF37]/10'}`}
            >
              CHAOS
            </button>
          </div>
        </div>
        
        <div className="bg-black/40 border border-[#D4AF37]/30 backdrop-blur-md p-4 rounded-lg pointer-events-auto">
          <p className="text-[#D4AF37] text-xs font-bold mb-2 uppercase tracking-widest">Gesture Engine</p>
          <button 
            onClick={() => setIsCameraActive(!isCameraActive)}
            className="w-full px-4 py-2 text-xs font-bold bg-[#043927] text-[#D4AF37] border border-[#D4AF37]/50 hover:bg-[#065439] transition-all"
          >
            {isCameraActive ? 'STOP CAMERA' : 'START CAMERA'}
          </button>
          <div className="mt-2 text-[10px] text-emerald-400/70 font-mono leading-tight">
            🖐️ OPEN: UNLEASH CHAOS<br/>
            ✊ CLOSED: FORM TREE<br/>
            ↔️ MOVE: CAMERA TRACKING
          </div>
        </div>
      </div>

      <div className="absolute top-1/2 left-4 -translate-y-1/2 z-10 opacity-20 hover:opacity-100 transition-opacity">
        <GestureController 
          active={isCameraActive} 
          onGesture={toggleState} 
          onPositionUpdate={handleCameraUpdate} 
        />
      </div>

      {/* 3D Scene */}
      <Canvas
        camera={{ position: [0, 4, 20], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: false, stencil: false, depth: true }}
      >
        <color attach="background" args={['#010a08']} />
        <fog attach="fog" args={['#010a08', 15, 40]} />
        
        <Suspense fallback={null}>
          <Experience state={treeState} cameraOffset={cameraOffset} />
          <Environment preset="lobby" />
          
          <EffectComposer multisampling={0}>
            <Bloom threshold={0.8} intensity={1.2} luminanceThreshold={0.8} radius={0.4} />
            <Noise opacity={0.05} />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
          </EffectComposer>
        </Suspense>

        <OrbitControls 
          enablePan={false} 
          maxPolarAngle={Math.PI / 1.8} 
          minDistance={10} 
          maxDistance={30}
          autoRotate={treeState === TreeState.FORMED}
          autoRotateSpeed={0.5}
        />
      </Canvas>

      <Loader />
    </div>
  );
};

export default App;
