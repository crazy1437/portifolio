import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { Scooter, Box, FloatingFood } from "./primitives";

/* A chunky stylized city block: colored buildings on a plate, road with dashes,
   and a scooter that rides a loop around the block. */

const BUILDING_COLORS = ["#ff5c1f", "#ffd23f", "#2fa843", "#f43f6e", "#f5a623", "#8fe04a"];

function Building({
  x,
  z,
  w,
  d,
  h,
  color,
}: {
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
  color: string;
}) {
  const windows = useMemo(() => {
    const rows = Math.max(1, Math.floor(h / 0.55) - 1);
    const cols = Math.max(1, Math.floor(w / 0.5));
    const list: { px: number; py: number; pz: number; ry: number }[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const py = 0.45 + r * 0.55;
        if (py > h - 0.25) continue;
        list.push({ px: x - w / 2 + 0.3 + c * 0.5, py, pz: z + d / 2 + 0.01, ry: 0 });
      }
    }
    return list;
  }, [x, z, w, h]);

  return (
    <group>
      <Box position={[x, h / 2, z]} size={[w, h, d]} color={color} radius={0.04} />
      {windows.map((w2, i) => (
        <mesh key={i} position={[w2.px, w2.py, w2.pz]}>
          <planeGeometry args={[0.22, 0.26]} />
          <meshStandardMaterial color="#fff3c4" emissive="#ffd23f" emissiveIntensity={0.55} />
        </mesh>
      ))}
    </group>
  );
}

function City() {
  const buildings = useMemo(() => {
    const list: { x: number; z: number; w: number; d: number; h: number; color: string }[] = [];
    const ring = [
      [-6.2, -6.2], [-4.6, -6.4], [-2.8, -6.1], [-0.8, -6.4], [1.2, -6.1], [3.2, -6.3], [5.2, -6.1], [6.4, -6.3],
      [-6.4, 6.2], [-4.4, 6.4], [-2.2, 6.1], [0.2, 6.3], [2.6, 6.4], [5, 6.2],
      [-6.3, -3.8], [-6.1, -1.4], [-6.2, 1.2], [-6.4, 3.6],
      [6.3, -3.9], [6.1, -1.2], [6.2, 1.4], [6.3, 3.8],
    ];
    ring.forEach(([x, z], i) => {
      const h = 0.8 + ((i * 7) % 5) * 0.5;
      list.push({
        x: x + ((i % 3) - 1) * 0.12,
        z: z + ((i % 2) - 0.5) * 0.2,
        w: 0.9 + ((i * 13) % 3) * 0.25,
        d: 0.9 + ((i * 5) % 3) * 0.2,
        h,
        color: BUILDING_COLORS[i % BUILDING_COLORS.length],
      });
    });
    return list;
  }, []);

  return (
    <group>
      {/* ground plate */}
      <Box position={[0, -0.15, 0]} size={[15, 0.3, 15]} color="#7ce577" radius={0.08} />
      {/* roads (cross) */}
      <Box position={[0, 0.01, 0]} size={[15, 0.06, 2.2]} color="#5a3f2c" radius={0.02} />
      <Box position={[0, 0.01, 0]} size={[2.2, 0.06, 15]} color="#5a3f2c" radius={0.02} />
      {/* road dashes */}
      {[-6, -4, -2, 0, 2, 4, 6].map((p) => (
        <Box key={`hx${p}`} position={[p, 0.05, 0]} size={[0.7, 0.02, 0.14]} color="#f2ead5" />
      ))}
      {[-6, -4, -2, 0, 2, 4, 6].map((p) => (
        <Box key={`hz${p}`} position={[0, 0.05, p]} size={[0.14, 0.02, 0.7]} color="#f2ead5" />
      ))}
      {buildings.map((b, i) => (
        <Building key={i} {...b} />
      ))}
      {/* street lamps */}
      {[-5, 5].map((x) =>
        [-5, 5].map((z) => (
          <group key={`lamp-${x}-${z}`} position={[x * 1.35, 0, z * 1.35]}>
            <Box position={[0, 0.7, 0]} size={[0.08, 1.4, 0.08]} color="#241a12" />
            <mesh position={[0, 1.45, 0]}>
              <sphereGeometry args={[0.12, 12, 12]} />
              <meshStandardMaterial color="#ffd23f" emissive="#ffd23f" emissiveIntensity={1.2} />
            </mesh>
          </group>
        ))
      )}
    </group>
  );
}

function RidingScooter({ color }: { color: string }) {
  const group = useRef<THREE.Group>(null);
  const loop = useRef(0);
  useFrame((_, delta) => {
    loop.current += delta * 0.22;
    const t = loop.current;
    // rounded-rectangle loop around the city blocks
    const span = 5.1;
    const speed = t % (span * 8);
    let x: number, z: number, rot: number;
    if (speed < span * 2) {
      const k = speed / (span * 2);
      x = -span + k * span * 2;
      z = -span;
      rot = Math.PI / 2;
    } else if (speed < span * 4) {
      const k = (speed - span * 2) / (span * 2);
      x = span;
      z = -span + k * span * 2;
      rot = 0;
    } else if (speed < span * 6) {
      const k = (speed - span * 4) / (span * 2);
      x = span - k * span * 2;
      z = span;
      rot = -Math.PI / 2;
    } else {
      const k = (speed - span * 6) / (span * 2);
      x = -span;
      z = span - k * span * 2;
      rot = Math.PI;
    }
    if (group.current) {
      group.current.position.x = x;
      group.current.position.z = z;
      group.current.rotation.y = rot;
      // lean into the corners
      const corner = Math.min(1, Math.abs(Math.sin(t * 2.4)));
      group.current.rotation.z = -0.06 * corner;
    }
  });
  return (
    <group ref={group} position={[-5.1, 0.05, -5.1]}>
      <Scooter color={color} wheelSpin={2.2} />
    </group>
  );
}

function Scene({ scooterColor }: { scooterColor: string }) {
  return (
    <>
      <ambientLight intensity={0.75} />
      <directionalLight position={[6, 10, 4]} intensity={1.5} castShadow />
      <directionalLight position={[-6, 6, -6]} intensity={0.4} color="#ffd23f" />
      <City />
      <RidingScooter color={scooterColor} />
      <Float speed={2.2} rotationIntensity={0.6} floatIntensity={1.6}>
        <FloatingFood kind="burger" position={[-4.4, 2.6, 1.4]} scale={1.2} />
      </Float>
      <Float speed={1.8} rotationIntensity={0.7} floatIntensity={2}>
        <FloatingFood kind="sushi" position={[4.6, 3, -1.2]} scale={1.1} />
      </Float>
      <Float speed={2.6} rotationIntensity={0.5} floatIntensity={1.4}>
        <FloatingFood kind="taco" position={[0.4, 3.6, 3.4]} scale={1.15} />
      </Float>
      <Float speed={2} rotationIntensity={0.8} floatIntensity={1.8}>
        <FloatingFood kind="donut" position={[-1.8, 4.2, -3.6]} scale={1} />
      </Float>
      <Float speed={1.6} rotationIntensity={0.6} floatIntensity={1.5}>
        <FloatingFood kind="drink" position={[3.4, 2.2, 3.8]} scale={1.1} />
      </Float>
      <Sparkles count={60} scale={[12, 6, 12]} position={[0, 3, 0]} size={3} speed={0.5} color="#ffd23f" />
    </>
  );
}

export default function HeroScene({ scooterColor = "#ff5c1f" }: { scooterColor?: string }) {
  return (
    <div className="animate-[fade-in_0.8s_ease-out_both] absolute inset-0">
      <Canvas
        shadows
        dpr={[1, 1.75]}
        camera={{ position: [9.5, 7.5, 9.5], fov: 38 }}
        gl={{ antialias: true, alpha: true }}
      >        <Scene scooterColor={scooterColor} />
      </Canvas>
    </div>
  );
}
