
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import Foliage from './Foliage';
import Ornaments from './Ornaments';
import Polaroids from './Polaroids';
import { TreeState } from '../types';
import { COLORS } from '../constants';

interface ExperienceProps {
  state: TreeState;
  cameraOffset: { x: number; y: number };
}

const Experience: React.FC<ExperienceProps> = ({ state, cameraOffset }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((clock) => {
    if (groupRef.current) {
      // Gentle floating animation
      groupRef.current.position.y = Math.sin(clock.clock.elapsedTime * 0.5) * 0.2;
      
      // Dynamic camera/look influence
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, cameraOffset.x * 0.05, 0.1);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, cameraOffset.y * 0.05, 0.1);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Lights */}
      <ambientLight intensity={0.4} />
      <spotLight position={[10, 20, 10]} angle={0.15} penumbra={1} intensity={1.5} color={COLORS.GOLD} castShadow />
      <pointLight position={[-10, 5, -10]} intensity={1} color={COLORS.EMERALD} />

      <Foliage state={state} />
      <Ornaments state={state} />
      <Polaroids state={state} />

      {/* Luxury Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial 
          color="#050505" 
          roughness={0.05} 
          metalness={0.8}
        />
      </mesh>
    </group>
  );
};

export default Experience;
