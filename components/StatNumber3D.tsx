"use client";

import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Center } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { FontLoader, type Font } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";

const ACID = "#9d8cff";
const WHITE = "#ffffff";

function buildGeometry(font: Font, char: string) {
  const geo = new TextGeometry(char, {
    font,
    size: 1.35,
    depth: 0.5,
    curveSegments: 5,
    bevelEnabled: false,
  });
  geo.computeBoundingBox();
  return geo;
}

/* Un segment (nombre ou slash) : remplissage plein + filaire + points, bien lumineux */
function Part({
  geometry,
  x,
  color,
}: {
  geometry: THREE.BufferGeometry;
  x: number;
  color: string;
}) {
  return (
    <group position={[x, 0, 0]}>
      <mesh geometry={geometry}>
        <meshBasicMaterial color={color} transparent opacity={0.65} />
      </mesh>
      <mesh geometry={geometry}>
        <meshBasicMaterial color={color} wireframe transparent opacity={0.9} />
      </mesh>
      <points geometry={geometry}>
        <pointsMaterial size={0.05} color={WHITE} transparent opacity={1} sizeAttenuation />
      </points>
    </group>
  );
}

/*
 * Chiffres 3D dans le langage du hero : remplissage + maillage filaire +
 * points lumineux, rotation douce continue. Le "/" ressort en blanc.
 */
function Digits({ label }: { label: string }) {
  const group = useRef<THREE.Group>(null);
  const font = useLoader(FontLoader, "/fonts/helvetiker_bold.typeface.json");

  const parts = useMemo(() => {
    const chars = label.split(/(\/)/).filter(Boolean);
    let cursor = 0;
    const gap = 0.12;
    return chars.map((chunk) => {
      const geo = buildGeometry(font, chunk);
      const width = geo.boundingBox
        ? geo.boundingBox.max.x - geo.boundingBox.min.x
        : 1;
      const x = cursor;
      cursor += width + gap;
      return {
        geo,
        x,
        color: chunk === "/" ? WHITE : ACID,
      };
    });
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
          {parts.map((p, i) => (
            <Part key={i} geometry={p.geo} x={p.x} color={p.color} />
          ))}
        </group>
      </Center>
    </group>
  );
}

/* Ne monte le Canvas que sur écran large : multiplier les contextes WebGL fait planter les petits GPU */
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return isDesktop;
}

export default function StatNumber3D({ label }: { label: string }) {
  const isDesktop = useIsDesktop();
  return (
    <div className="h-32 sm:h-36" role="img" aria-label={label}>
      {isDesktop ? (
        <Canvas
          camera={{ position: [0, 0, 5.2], fov: 42 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
        >
          <ambientLight intensity={1} />
          <Suspense fallback={null}>
            <Digits label={label} />
          </Suspense>
        </Canvas>
      ) : (
        <div className="h-full flex items-center">
          <span
            className="font-display text-5xl tabular-nums"
            style={{
              fontWeight: 800,
              color: "#f0edfb",
              textShadow: "0 0 32px rgba(157,140,255,0.6)",
            }}
          >
            {label.split("/").map((part, i, arr) => (
              <span key={i}>
                <span style={{ color: ACID }}>{part}</span>
                {i < arr.length - 1 && <span className="text-cream"> / </span>}
              </span>
            ))}
          </span>
        </div>
      )}
    </div>
  );
}
