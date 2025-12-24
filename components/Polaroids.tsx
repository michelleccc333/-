
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COUNTS, TREE_CONFIG, COLORS } from '../constants';
import { TreeState, PolaroidData } from '../types';

interface PolaroidsProps {
  state: TreeState;
}

const Polaroid: React.FC<{ data: PolaroidData; treeState: TreeState }> = ({ data, treeState }) => {
  const meshRef = useRef<THREE.Group>(null);
  const currentPos = useRef(new THREE.Vector3(...data.chaosPosition));
  const currentRot = useRef(new THREE.Euler(...data.rotation));

  useFrame((state) => {
    if (meshRef.current) {
      const targetPos = new THREE.Vector3(...(treeState === TreeState.FORMED ? data.targetPosition : data.chaosPosition));
      const targetRot = new THREE.Euler(...(treeState === TreeState.FORMED ? data.rotation : [Math.random() * Math.PI, Math.random() * Math.PI, 0]));

      currentPos.current.lerp(targetPos, 0.03);
      meshRef.current.position.copy(currentPos.current);
      
      // Add subtle float
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime + data.id) * 0.1;
      
      meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetRot.x, 0.03);
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetRot.y, 0.03);
      meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, targetRot.z, 0.03);
    }
  });

  return (
    <group ref={meshRef}>
      {/* Polaroid Frame */}
      <mesh>
        <planeGeometry args={[1, 1.2]} />
        <meshStandardMaterial color="white" roughness={0.5} />
      </mesh>
      {/* Photo area */}
      <mesh position={[0, 0.1, 0.01]}>
        <planeGeometry args={[0.85, 0.85]} />
        <meshStandardMaterial 
          map={new THREE.TextureLoader().load(data.imageUrl)} 
          roughness={0.2}
        />
      </mesh>
      {/* Gold clip/hook */}
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[0.05, 0.2, 0.02]} />
        <meshStandardMaterial color={COLORS.GOLD} metalness={1} roughness={0.1} />
      </mesh>
    </group>
  );
};

const Polaroids: React.FC<PolaroidsProps> = ({ state }) => {
  const polaroids = useMemo(() => {
    const items: PolaroidData[] = [];
    for (let i = 0; i < COUNTS.POLAROIDS; i++) {
      const y = Math.random() * (TREE_CONFIG.HEIGHT - 2) + 1;
      const progress = y / TREE_CONFIG.HEIGHT;
      const radiusAtY = (1 - progress) * TREE_CONFIG.RADIUS * 1.05;
      const theta = (i / COUNTS.POLAROIDS) * Math.PI * 2;

      items.push({
        id: i,
        targetPosition: [Math.cos(theta) * radiusAtY, y, Math.sin(theta) * radiusAtY],
        chaosPosition: [(Math.random() - 0.5) * 35, (Math.random() - 0.5) * 35, (Math.random() - 0.5) * 35],
        rotation: [0, -theta + Math.PI / 2, (Math.random() - 0.5) * 0.5],
        imageUrl: `https://picsum.photos/seed/${i + 100}/200/200`
      });
    }
    return items;
  }, []);

  return (
    <group>
      {polaroids.map((p) => (
        <Polaroid key={p.id} data={p} treeState={state} />
      ))}
    </group>
  );
};

export default Polaroids;
