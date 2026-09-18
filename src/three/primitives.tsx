import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";

/* ---------------- shared helpers ---------------- */

export function Box({
  position,
  size,
  color,
  rotation,
  radius = 0.02,
}: {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  rotation?: [number, number, number];
  radius?: number;
}) {
  return (
    <RoundedBox position={position} rotation={rotation} args={size} radius={radius} smoothness={3}>
      <meshStandardMaterial color={color} roughness={0.55} metalness={0.05} />
    </RoundedBox>
  );
}

export function Wheel({
  position,
  radius = 0.16,
  width = 0.1,
  spinRef,
}: {
  position: [number, number, number];
  radius?: number;
  width?: number;
  spinRef?: React.MutableRefObject<number>;
}) {
  const ref = useRef<THREE.Group>(null);
  const spokes = useMemo(() => [0, 1, 2], []);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.x -= delta * 9;
  });
  return (
    <group position={position} rotation={[0, 0, Math.PI / 2]}>
      <group ref={ref}>
        <mesh castShadow>
          <cylinderGeometry args={[radius, radius, width, 24]} />
          <meshStandardMaterial color="#241a12" roughness={0.9} />
        </mesh>
        <mesh>
          <cylinderGeometry args={[radius * 0.55, radius * 0.55, width * 1.05, 16]} />
          <meshStandardMaterial color="#f2ead5" roughness={0.5} />
        </mesh>
        {spokes.map((i) => (
          <mesh key={i} rotation={[0, 0, (i * Math.PI) / 3]}>
            <boxGeometry args={[width * 0.4, radius * 1.7, width * 0.4]} />
            <meshStandardMaterial color="#e9dcbe" roughness={0.6} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/* ---------------- the little scooter ---------------- */

export function Scooter({ color = "#ff5c1f", wheelSpin = 1 }: { color?: string; wheelSpin?: number }) {
  const body = useRef<THREE.Group>(null);
  const bob = useRef<THREE.Group>(null);
  const t = useRef(0);

  useFrame((state, delta) => {
    t.current += delta * wheelSpin;
    const time = state.clock.elapsedTime;
    if (body.current) {
      body.current.rotation.z = Math.sin(time * 7) * 0.015 * wheelSpin;
    }
    if (bob.current) {
      bob.current.position.y = Math.sin(time * 9) * 0.012 * wheelSpin;
    }
  });

  return (
    <group ref={bob}>
      <group ref={body}>
        {/* deck / body */}
        <Box position={[0, 0.34, 0]} size={[1.5, 0.16, 0.5]} color={color} radius={0.06} />
        {/* front shield */}
        <Box position={[0.62, 0.62, 0]} size={[0.18, 0.62, 0.44]} color={color} radius={0.06} />
        {/* handle bar */}
        <Box position={[0.72, 1.0, 0]} size={[0.1, 0.1, 0.78]} color="#241a12" radius={0.03} />
        {/* headlight */}
        <mesh position={[0.74, 0.78, 0]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial color="#ffd23f" emissive="#ffd23f" emissiveIntensity={1.6} />
        </mesh>
        <pointLight position={[0.9, 0.8, 0]} intensity={2.4} distance={3.2} color="#ffe9a3" />
        {/* seat + rider base */}
        <Box position={[-0.42, 0.62, 0]} size={[0.5, 0.1, 0.4]} color="#241a12" radius={0.04} />
        <Box position={[-0.55, 0.5, 0]} size={[0.16, 0.34, 0.34]} color="#3d2b1e" radius={0.05} />
        {/* delivery box on the back */}
        <group position={[-0.72, 0.98, 0]}>
          <Box position={[0, 0, 0]} size={[0.5, 0.5, 0.5]} color="#fffdf7" radius={0.05} />
          <Box position={[0, 0.26, 0]} size={[0.52, 0.06, 0.52]} color={color} radius={0.02} />
          <mesh position={[0, 0, 0.26]}>
            <circleGeometry args={[0.14, 24]} />
            <meshStandardMaterial color="#ffd23f" emissive="#ffb03f" emissiveIntensity={0.35} />
          </mesh>
        </group>
        {/* exhaust puff */}
        <ExhaustPuffs />
        {/* wheels */}
        <Wheel position={[0.66, 0.18, 0]} />
        <Wheel position={[-0.66, 0.18, 0]} />
        {/* rider */}
        <Rider position={[-0.34, 0.7, 0]} />
      </group>
    </group>
  );
}

function ExhaustPuffs() {
  const puffs = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!puffs.current) return;
    puffs.current.children.forEach((child, i) => {
      const t = (state.clock.elapsedTime * 0.9 + i * 0.33) % 1;
      child.position.x = -0.95 - t * 0.9;
      child.position.y = 0.35 + t * 0.25;
      const s = 0.05 + t * 0.14;
      child.scale.setScalar(s);
      const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
      mat.opacity = 0.5 * (1 - t);
    });
  });
  return (
    <group ref={puffs} position={[-0.6, 0.3, 0]}>
      {[0, 1, 2].map((i) => (
        <mesh key={i}>
          <sphereGeometry args={[1, 10, 10]} />
          <meshStandardMaterial color="#f2ead5" transparent opacity={0.3} roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

export function Rider({ position }: { position: [number, number, number] }) {
  const lean = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (lean.current) {
      lean.current.rotation.z = 0.12 + Math.sin(state.clock.elapsedTime * 6) * 0.02;
      lean.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 6) * 0.01;
    }
  });
  return (
    <group ref={lean} position={position}>
      {/* torso */}
      <Box position={[0, 0.28, 0]} size={[0.26, 0.42, 0.3]} color="#2fa843" radius={0.08} />
      {/* helmet */}
      <mesh position={[0, 0.58, 0]}>
        <sphereGeometry args={[0.14, 20, 20]} />
        <meshStandardMaterial color="#ffd23f" roughness={0.3} metalness={0.1} />
      </mesh>
      <Box position={[0, 0.56, 0.12]} size={[0.16, 0.07, 0.06]} color="#241a12" radius={0.02} />
      {/* arms reaching to handlebar */}
      <Box position={[0.32, 0.3, 0.14]} size={[0.5, 0.08, 0.08]} color="#2fa843" radius={0.03} rotation={[0, 0, -0.5]} />
      <Box position={[0.32, 0.3, -0.14]} size={[0.5, 0.08, 0.08]} color="#2fa843" radius={0.03} rotation={[0, 0, -0.5]} />
      {/* legs */}
      <Box position={[0.02, 0.05, 0.12]} size={[0.09, 0.3, 0.09]} color="#241a12" radius={0.03} />
      <Box position={[0.02, 0.05, -0.12]} size={[0.09, 0.3, 0.09]} color="#241a12" radius={0.03} />
    </group>
  );
}

/* ---------------- floating juicy foods ---------------- */

const FOOD_COLORS: Record<string, string> = {
  burger: "#e8a24a",
  pizza: "#ffd23f",
  sushi: "#7ce577",
  taco: "#ffcf5c",
  noodles: "#ffcf5c",
  donut: "#ff5c8a",
  drink: "#ff8a5c",
  fries: "#ffd23f",
};

export function FloatingFood({ kind, ...props }: { kind: string } & { position?: [number, number, number]; scale?: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.6;
    ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 1.4) * 0.12;
  });
  const color = FOOD_COLORS[kind] ?? "#ffd23f";
  return (
    <group ref={ref} {...props}>
      {kind === "burger" && (
        <>
          <RoundedBox args={[0.6, 0.16, 0.6]} radius={0.07} position={[0, -0.1, 0]}>
            <meshStandardMaterial color="#5a3f2c" roughness={0.8} />
          </RoundedBox>
          <RoundedBox args={[0.56, 0.1, 0.56]} radius={0.04} position={[0, 0.03, 0]}>
            <meshStandardMaterial color="#7ce577" roughness={0.7} />
          </RoundedBox>
          <RoundedBox args={[0.5, 0.09, 0.5]} radius={0.045} position={[0, 0.13, 0]}>
            <meshStandardMaterial color="#e04a12" roughness={0.6} />
          </RoundedBox>
          <RoundedBox args={[0.62, 0.22, 0.62]} radius={0.11} position={[0, 0.3, 0]}>
            <meshStandardMaterial color={color} roughness={0.55} />
          </RoundedBox>
        </>
      )}
      {kind === "taco" && (
        <>
          <RoundedBox args={[0.7, 0.3, 0.55]} radius={0.14} position={[0, 0, 0]} rotation={[0, 0, 0.2]}>
            <meshStandardMaterial color={color} roughness={0.6} />
          </RoundedBox>
          <RoundedBox args={[0.5, 0.12, 0.35]} radius={0.05} position={[0, 0.12, 0]}>
            <meshStandardMaterial color="#7ce577" roughness={0.7} />
          </RoundedBox>
        </>
      )}
      {(kind === "sushi" || kind === "noodles") && (
        <>
          <mesh>
            <cylinderGeometry args={[0.42, 0.36, 0.3, 28]} />
            <meshStandardMaterial color="#f5f0e0" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.16, 0]}>
            <torusGeometry args={[0.3, 0.09, 12, 28]} />
            <meshStandardMaterial color={kind === "sushi" ? "#ff8a5c" : "#e8a24a"} roughness={0.5} />
          </mesh>
        </>
      )}
      {kind === "donut" && (
        <mesh>
          <torusGeometry args={[0.32, 0.15, 16, 32]} />
          <meshStandardMaterial color={color} roughness={0.45} />
        </mesh>
      )}
      {kind === "drink" && (
        <>
          <mesh>
            <cylinderGeometry args={[0.22, 0.26, 0.62, 20]} />
            <meshStandardMaterial color="#ff5c1f" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.4, 0]} rotation={[0, 0, 0.3]}>
            <cylinderGeometry args={[0.03, 0.03, 0.5, 8]} />
            <meshStandardMaterial color="#241a12" />
          </mesh>
        </>
      )}
      {kind === "fries" && (
        <>
          <RoundedBox args={[0.5, 0.4, 0.3]} radius={0.04}>
            <meshStandardMaterial color="#e04a12" roughness={0.6} />
          </RoundedBox>
          {[0, 1, 2, 3, 4].map((i) => (
            <Box
              key={i}
              position={[-0.14 + i * 0.07, 0.3 + (i % 2) * 0.06, 0]}
              size={[0.06, 0.3, 0.06]}
              color="#ffd23f"
              rotation={[0, 0, (i - 2) * 0.08]}
            />
          ))}
        </>
      )}
    </group>
  );
}
