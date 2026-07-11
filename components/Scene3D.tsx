"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

/*
 * Grille d'ondes — même style que defenseTech : grande houle lente,
 * points lumineux (double couche) + maillage de lignes fines.
 */
const SEPARATION = 130;
const AMOUNTX = 48;
const AMOUNTY = 26;

const waveY = (ix: number, iy: number, count: number) =>
  Math.sin((ix + count) * 0.28) * 55 + Math.sin((iy + count) * 0.48) * 45;

function WaveGrid() {
  const lineGeo = useRef<THREE.BufferGeometry>(null);
  const count = useRef(0);

  const { pointGeometry, linePositions } = useMemo(() => {
    const positions: number[] = [];
    for (let ix = 0; ix < AMOUNTX; ix++)
      for (let iy = 0; iy < AMOUNTY; iy++)
        positions.push(
          ix * SEPARATION - (AMOUNTX * SEPARATION) / 2,
          0,
          iy * SEPARATION - (AMOUNTY * SEPARATION) / 2
        );

    const linePositions: number[] = [];
    for (let ix = 0; ix < AMOUNTX; ix++) {
      for (let iy = 0; iy < AMOUNTY; iy++) {
        const x = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2;
        const z = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2;
        if (ix < AMOUNTX - 1)
          linePositions.push(x, 0, z, (ix + 1) * SEPARATION - (AMOUNTX * SEPARATION) / 2, 0, z);
        if (iy < AMOUNTY - 1)
          linePositions.push(x, 0, z, x, 0, (iy + 1) * SEPARATION - (AMOUNTY * SEPARATION) / 2);
      }
    }
    const pointGeometry = new THREE.BufferGeometry();
    pointGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );
    return {
      pointGeometry,
      linePositions: new Float32Array(linePositions),
    };
  }, []);

  useFrame(() => {
    const pGeo = pointGeometry;
    const lGeo = lineGeo.current;
    if (!pGeo || !lGeo) return;
    const c = count.current;

    const arr = pGeo.attributes.position.array as Float32Array;
    let i = 0;
    for (let ix = 0; ix < AMOUNTX; ix++)
      for (let iy = 0; iy < AMOUNTY; iy++) {
        arr[i * 3 + 1] = waveY(ix, iy, c);
        i++;
      }
    pGeo.attributes.position.needsUpdate = true;

    const la = lGeo.attributes.position.array as Float32Array;
    let li = 0;
    for (let ix = 0; ix < AMOUNTX; ix++) {
      for (let iy = 0; iy < AMOUNTY; iy++) {
        const y = waveY(ix, iy, c);
        if (ix < AMOUNTX - 1) {
          la[li + 1] = y;
          la[li + 4] = waveY(ix + 1, iy, c);
          li += 6;
        }
        if (iy < AMOUNTY - 1) {
          la[li + 1] = y;
          la[li + 4] = waveY(ix, iy + 1, c);
          li += 6;
        }
      }
    }
    lGeo.attributes.position.needsUpdate = true;

    count.current += 0.065;
  });

  return (
    <>
      <points geometry={pointGeometry}>
        <pointsMaterial size={9} color="#9d8cff" transparent opacity={1} sizeAttenuation />
      </points>
      <points geometry={pointGeometry}>
        <pointsMaterial size={4.5} color="#f0edfb" transparent opacity={0.45} sizeAttenuation />
      </points>
      <lineSegments>
        <bufferGeometry ref={lineGeo}>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#5a4bb8" transparent opacity={0.28} />
      </lineSegments>
    </>
  );
}

export default function Scene3D() {
  return (
    <div className="absolute inset-0" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 300, 1150], fov: 60, near: 1, far: 10000 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <WaveGrid />
      </Canvas>
    </div>
  );
}
