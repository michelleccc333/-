
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COUNTS, TREE_CONFIG, COLORS } from '../constants';
import { TreeState, OrnamentData } from '../types';

interface OrnamentsProps {
  state: TreeState;
}

const Ornaments: React.FC<OrnamentsProps> = ({ state }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const lightMeshRef = useRef<THREE.InstancedMesh>(null);

  const data = useMemo(() => {
    const ornaments: OrnamentData[] = [];
    const colors = [COLORS.GOLD, COLORS.RUBY, COLORS.EMERALD, COLORS.SNOW];

    for (let i = 0; i < COUNTS.ORNAMENTS; i++) {
      const y = Math.random() * (TREE_CONFIG.HEIGHT - 1) + 0.5;
      const progress = y / TREE_CONFIG.HEIGHT;
      const radiusAtY = (1 - progress) * TREE_CONFIG.RADIUS * 0.95;
      const theta = Math.random() * Math.PI * 2;
      
      const targetPos: [number, number, number] = [
        Math.cos(theta) * radiusAtY,
        y,
        Math.sin(theta) * radiusAtY
      ];

      const chaosPos: [number, number, number] = [
        (Math.random() - 0.5) * TREE_CONFIG.CHAOS_RADIUS * 2,
        (Math.random() - 0.5) * TREE_CONFIG.CHAOS_RADIUS * 2,
        (Math.random() - 0.5) * TREE_CONFIG.CHAOS_RADIUS * 2
      ];

      ornaments.push({
        id: i,
        targetPosition: targetPos,
        chaosPosition: chaosPos,
        color: colors[i % colors.length],
        weight: Math.random() * 0.05 + 0.02,
        size: Math.random() * 0.2 + 0.15
      });
    }
    return ornaments;
  }, []);

  const lightsData = useMemo(() => {
    const lights: OrnamentData[] = [];
    for (let i = 0; i < COUNTS.LIGHTS; i++) {
      const y = Math.random() * TREE_CONFIG.HEIGHT;
      const progress = y / TREE_CONFIG.HEIGHT;
      const radiusAtY = (1 - progress) * TREE_CONFIG.RADIUS * 0.8;
      const theta = Math.random() * Math.PI * 2;
      
      lights.push({
        id: i,
        targetPosition: [Math.cos(theta) * radiusAtY, y, Math.sin(theta) * radiusAtY],
        chaosPosition: [(Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40],
        color: COLORS.GOLD,
        weight: 0.1, // Lights move faster
        size: 0.05
      });
    }
    return lights;
  }, []);

  const tempObject = new THREE.Object3D();
  const currentPositions = useRef(data.map(d => new THREE.Vector3(...d.chaosPosition)));
  const currentLightPositions = useRef(lightsData.map(d => new THREE.Vector3(...d.chaosPosition)));

  useFrame(() => {
    if (meshRef.current) {
      data.forEach((d, i) => {
        const target = state === TreeState.FORMED ? d.targetPosition : d.chaosPosition;
        const targetVec = new THREE.Vector3(...target);
        
        currentPositions.current[i].lerp(targetVec, d.weight);
        
        tempObject.position.copy(currentPositions.current[i]);
        tempObject.scale.setScalar(d.size);
        tempObject.updateMatrix();
        meshRef.current!.setMatrixAt(i, tempObject.matrix);
        meshRef.current!.setColorAt(i, new THREE.Color(d.color));
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
      if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    }

    if (lightMeshRef.current) {
      lightsData.forEach((d, i) => {
        const target = state === TreeState.FORMED ? d.targetPosition : d.chaosPosition;
        currentLightPositions.current[i].lerp(new THREE.Vector3(...target), d.weight);
        
        tempObject.position.copy(currentLightPositions.current[i]);
        tempObject.scale.setScalar(d.size * (0.8 + Math.sin(Date.now() * 0.01 + i) * 0.5));
        tempObject.updateMatrix();
        lightMeshRef.current!.setMatrixAt(i, tempObject.matrix);
      });
      lightMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <>
      <instancedMesh ref={meshRef} args={[undefined, undefined, COUNTS.ORNAMENTS]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial metalness={1} roughness={0.1} />
      </instancedMesh>

      <instancedMesh ref={lightMeshRef} args={[undefined, undefined, COUNTS.LIGHTS]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color={COLORS.GOLD} transparent opacity={0.8} />
      </instancedMesh>
    </>
  );
};

export default Ornaments;
