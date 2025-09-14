import { Vector3 } from "three";
import * as THREE from "three";
import { useRef, useEffect } from "react";

type PinProps = {
  position: Vector3;
  color?: string;
  onClick?: () => void;
  onMove?: (pos: Vector3) => void;
};

export function Pin({ position, onClick }: PinProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (meshRef.current) {
      // 地球の中心から外向きに向かせる
      meshRef.current.lookAt(
        position.x * 2,
        position.y * 2,
        position.z * 2
      );
    }
  }, [position]);

  return (
    <mesh ref={meshRef} position={position} onClick={onClick} scale={[0.15, 0.15, 0.15]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        map={new THREE.TextureLoader().load("/flower.PNG", texture => {
          texture.center.set(0.5, 0.5);
          texture.rotation = Math.PI / 4;
          texture.needsUpdate = true;
          return texture;
        })}
        transparent
      />
    </mesh>
  );
}