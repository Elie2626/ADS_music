"use client";

import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Center } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";

/*
 * Chiffres 3D dans le langage du hero : maillage filaire + points
 * lumineux acides, rotation douce continue.
 */
function Digits({ label }: { label: string }) {
  const group = useRef<THREE.Group>(null);
  const font = useLoader(FontLoader, "/fonts/helvetiker_bold.typeface.json");

  const geometry = useMemo(() => {
    const geo = new TextGeometry(label, {
      font,
      size: 1.35,
      depth: 0.5,
      curveSegments: 5,
      bevelEnabled: false,
    });
    geo.center();
    return geo;
  }, [font, label]);

  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.elapsedTime;
    group.current.rotation.y = Math.sin(t * 0.6) * 0.4;
    group.current.rotation.x = Math.sin(t * 0.4) * 0.12 - 0.05;
  });

  return (
    <group ref={group}>
      <Center>
        <group>
          {/* maillage filaire, comme les lignes de la houle */}
          <mesh geometry={geometry}>
            <meshBasicMaterial
              color="#5a4bb8"
              wireframe
              transparent
              opacity={0.35}
            />
          </mesh>
          {/* points lumineux sur les sommets, comme les dots du hero */}
          <points geometry={geometry}>
            <pointsMaterial
              size={0.045}
              color="#9d8cff"
              transparent
              opacity={0.95}
              sizeAttenuation
            />
          </points>
        </group>
      </Center>
    </group>
  );
}

export default function StatNumber3D({ label }: { label: string }) {
  return (
    <div className="h-32 sm:h-36" role="img" aria-label={label}>
      <Canvas
        camera={{ position: [0, 0, 5.2], fov: 42 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <Digits label={label} />
        </Suspense>
      </Canvas>
    </div>
  );
}
