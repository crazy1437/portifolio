import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { Scooter, Box } from "./primitives";

/* Mini city with a curved route. The scooter rides along a Catmull-Rom curve;
   progress (0..1) comes from the order state so the 3D matches the real ETA. */

function makeCurve() {
  return new THREE.CatmullRomCurve3(
    [
      new THREE.Vector3(-5, 0, -3.2),
      new THREE.Vector3(-2.2, 0, -3.4),
      new THREE.Vector3(0.4, 0, -2.2),
      new THREE.Vector3(2.6, 0, -0.4),
      new THREE.Vector3(3.6, 0, 2.2),
      new THREE.Vector3(2.2, 0, 3.4),
      new THREE.Vector3(-0.6, 0, 3.2),
      new THREE.Vector3(-3.4, 0, 2.6),
      new THREE.Vector3(-5, 0, 0.6),
      new THREE.Vector3(-5, 0, -3.2),
    ],
    true,
    "catmullrom",
    0.5
  );
}

function RouteLine({ curve, progress }: { curve: THREE.CatmullRomCurve3; progress: number }) {
  const done = useMemo(() => curve.getPoints(80).slice(0, Math.max(2, Math.floor(80 * progress) + 1)), [curve, progress]);
  const todo = useMemo(() => curve.getPoints(80).slice(Math.max(1, Math.floor(80 * progress))), [curve, progress]);
  return (
    <group position={[0, 0.05, 0]}>
      <Line points={todo} color="#f2ead5" lineWidth={5} dashed={false} opacity={0.9} />
      <Line points={done} color="#ff5c1f" lineWidth={7} dashed={false} opacity={1} />
    </group>
  );
}

// small wrapper to avoid drei Line prop type friction
import { Line } from "@react-three/drei";
function Line_(props: { points: THREE.Vector3[]; color: string; lineWidth: number; dashed: boolean; opacity: number }) {
  return <Line points={props.points} color={props.color} lineWidth={props.lineWidth} dashed={props.dashed} transparent opacity={props.opacity} />;
}
const LineAlias = Line_;

function TrackerScooter({ curve, progress, color }: { curve: THREE.CatmullRomCurve3; progress: number; color: string }) {
  const group = useRef<THREE.Group>(null);
  const pos = useMemo(() => new THREE.Vector3(), []);
  const tangent = useMemo(() => new THREE.Vector3(), []);
  useFrame(() => {
    if (!group.current) return;
    curve.getPointAt(Math.min(0.9999, progress), pos);
    curve.getTangentAt(Math.min(0.9999, progress), tangent);
    group.current.position.set(pos.x, 0.02, pos.z);
    const angle = Math.atan2(tangent.x, tangent.z);
    group.current.rotation.y = angle + Math.PI / 2;
    group.current.rotation.z = -0.05;
  });
  return (
    <group ref={group}>
      <Scooter color={color} wheelSpin={3} />
    </group>
  );
}

function DestinationPin({ curve }: { curve: THREE.CatmullRomCurve3 }) {
  const p = useMemo(() => curve.getPointAt(0.9999), [curve]);
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = 1.1 + Math.sin(state.clock.elapsedTime * 3) * 0.15;
      ref.current.rotation.y = state.clock.elapsedTime * 1.5;
    }
  });
  return (
    <group position={[p.x, 0, p.z]}>
      <group ref={ref}>
        <mesh>
          <coneGeometry args={[0.22, 0.5, 16]} />
          <meshStandardMaterial color="#f43f6e" emissive="#f43f6e" emissiveIntensity={0.4} />
        </mesh>
        <mesh position={[0, 0.3, 0]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#ffd23f" emissive="#ffd23f" emissiveIntensity={0.8} />
        </mesh>
      </group>
    </group>
  );
}

function Scene({ progress, accent }: { progress: number; accent: string }) {
  const curve = useMemo(makeCurve, []);
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 9, 4]} intensity={1.4} castShadow />
      <directionalLight position={[-5, 5, -5]} intensity={0.4} color="#ffd23f" />
      {/* ground */}
      <Box position={[0, -0.15, 0]} size={[12.5, 0.3, 9.5]} color="#7ce577" radius={0.08} />
      {/* little city blocks around the route */}
      {[
        [-4.6, -4.6, 1.4, 2.2, "#ff5c1f"],
        [-2.4, -4.9, 1.2, 1.4, "#ffd23f"],
        [1.4, -4.6, 1.6, 2.6, "#2fa843"],
        [4.4, -4.2, 1.2, 1.8, "#f43f6e"],
        [4.8, 3.6, 1.4, 2.0, "#f5a623"],
        [0.2, 4.8, 1.6, 1.6, "#8fe04a"],
        [-3.2, 4.6, 1.2, 2.4, "#ff5c1f"],
        [-5.2, 2.6, 1.0, 1.6, "#ffd23f"],
      ].map(([x, z, w, h, c], i) => (
        <Box key={i} position={[x as number, (h as number) / 2, z as number]} size={[w as number, h as number, w as number]} color={c as string} radius={0.05} />
      ))}
      <RouteLine curve={curve} progress={progress} />
      <TrackerScooter curve={curve} progress={progress} color={accent} />
      <DestinationPin curve={curve} />
      <Sparkles count={40} scale={[11, 4, 8]} position={[0, 2, 0]} size={2.5} speed={0.4} color="#ffd23f" />
    </>
  );
}

export default function TrackingScene({ progress, accent = "#ff5c1f" }: { progress: number; accent?: string }) {
  return (
    <div className="animate-[fade-in_0.8s_ease-out_both] absolute inset-0">
      <Canvas
        shadows
        dpr={[1, 1.75]}
        camera={{ position: [7.5, 6.5, 7.5], fov: 40 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Scene progress={progress} accent={accent} />
      </Canvas>
    </div>
  );
}
