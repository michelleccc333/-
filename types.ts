
export enum TreeState {
  CHAOS = 'CHAOS',
  FORMED = 'FORMED'
}

export interface OrnamentData {
  id: number;
  chaosPosition: [number, number, number];
  targetPosition: [number, number, number];
  color: string;
  weight: number; // For physics-like lerp speed
  size: number;
}

export interface PolaroidData {
  id: number;
  chaosPosition: [number, number, number];
  targetPosition: [number, number, number];
  rotation: [number, number, number];
  imageUrl: string;
}
