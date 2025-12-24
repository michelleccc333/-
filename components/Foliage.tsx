
import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COUNTS, TREE_CONFIG, COLORS } from '../constants';
import { TreeState } from '../types';

interface FoliageProps {
  state: TreeState;
}

const Foliage: React.FC<FoliageProps> = ({ state }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const [positions, chaosPositions] = useMemo(() => {
    const pos = new Float32Array(COUNTS.FOLIAGE * 3);
    const chaos = new Float32Array(COUNTS.FOLIAGE * 3);

    for (let i = 0; i < COUNTS.FOLIAGE; i++) {
      // Tree position (Conical)
      const y = Math.random() * TREE_CONFIG.HEIGHT;
      const progress = y / TREE_CONFIG.HEIGHT;
      const radiusAtY = (1 - progress) * TREE_CONFIG.RADIUS;
      const theta = Math.random() * Math.PI * 2;
      
      pos[i * 3 + 0] = Math.cos(theta) * radiusAtY;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = Math.sin(theta) * radiusAtY;

      // Chaos position (Spherical)
      const cTheta = Math.random() * Math.PI * 2;
      const cPhi = Math.acos(2 * Math.random() - 1);
      const cDist = (Math.random() * 0.7 + 0.3) * TREE_CONFIG.CHAOS_RADIUS;

      chaos[i * 3 + 0] = cDist * Math.sin(cPhi) * Math.cos(cTheta);
      chaos[i * 3 + 1] = cDist * Math.sin(cPhi) * Math.sin(cTheta);
      chaos[i * 3 + 2] = cDist * Math.cos(cPhi);
    }
    return [pos, chaos];
  }, []);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uProgress: { value: 1.0 }, // 1 is formed, 0 is chaos
    uColorA: { value: new THREE.Color(COLORS.EMERALD) },
    uColorB: { value: new THREE.Color(COLORS.GOLD) },
  }), []);

  useFrame((clock) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.clock.elapsedTime;
      const target = state === TreeState.FORMED ? 1.0 : 0.0;
      materialRef.current.uniforms.uProgress.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uProgress.value,
        target,
        0.05
      );
    }
  });

  const vertexShader = `
    uniform float uTime;
    uniform float uProgress;
    attribute vec3 chaosPosition;
    varying float vDistance;
    varying float vProgress;

    void main() {
      vProgress = uProgress;
      vec3 targetPos = position;
      vec3 chaosPos = chaosPosition;
      
      // Add some swirl to chaos
      float swirl = uTime * 0.5;
      mat2 rot = mat2(cos(swirl), -sin(swirl), sin(swirl), cos(swirl));
      chaosPos.xz *= rot;

      vec3 finalPos = mix(chaosPos, targetPos, uProgress);
      
      // Gentle pulse
      finalPos.y += sin(uTime + finalPos.x * 0.5) * 0.1 * (1.0 - uProgress);
      
      vDistance = length(finalPos);
      vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
      gl_PointSize = (20.0 / -mvPosition.z) * (0.8 + 0.5 * sin(uTime + float(gl_InstanceID)));
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  const fragmentShader = `
    uniform vec3 uColorA;
    uniform vec3 uColorB;
    uniform float uTime;
    varying float vDistance;
    varying float vProgress;

    void main() {
      float dist = length(gl_PointCoord - vec2(0.5));
      if (dist > 0.5) discard;
      
      float alpha = smoothstep(0.5, 0.4, dist);
      vec3 color = mix(uColorA, uColorB, sin(vDistance * 0.2 + uTime) * 0.5 + 0.5);
      
      // Glow effect
      color += uColorB * pow(1.0 - dist * 2.0, 2.0) * 0.5;
      
      gl_FragColor = vec4(color, alpha * (0.4 + 0.6 * vProgress));
    }
  `;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={COUNTS.FOLIAGE}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-chaosPosition"
          count={COUNTS.FOLIAGE}
          array={chaosPositions}
          itemSize={3}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default Foliage;
