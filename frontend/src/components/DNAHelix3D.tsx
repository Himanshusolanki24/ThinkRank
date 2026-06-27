/**
 * DNAHelix3D — ultra-detailed glass DNA double helix, built as a live 3D element.
 *
 * Glassy translucent / iridescent beads + illuminated rods, a dense neon particle
 * field, energy pulses travelling through the strands, cinematic rim/key/fill
 * lighting, bloom, depth-of-field and a vignette. Biotech "genome scanner" vibe.
 */
import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, DepthOfField } from "@react-three/postprocessing";
import * as THREE from "three";

// Smooth neon gradient — blended along the strands (not alternating)
const PAL = ["#35C8FF", "#62F8FF", "#8A5CFF", "#B14DFF", "#6A4CFF"];

const colorAt = (t: number) => {
  const c = Math.max(0, Math.min(1, t));
  const seg = c * (PAL.length - 1);
  const i = Math.min(PAL.length - 2, Math.floor(seg));
  return new THREE.Color(PAL[i]).lerp(new THREE.Color(PAL[i + 1]), seg - i);
};

// Helix geometry (module scope so animation + build share it)
const TURNS = 5.0;
const R = 1.06;
const HEIGHT = 9.4;
const angleOf = (f: number, strand: number) => f * TURNS * Math.PI * 2 + strand * Math.PI;
const yOf = (f: number) => HEIGHT / 2 - f * HEIGHT;
const pathPoint = (f: number, strand: number, out: THREE.Vector3) =>
  out.set(Math.cos(angleOf(f, strand)) * R, yOf(f), Math.sin(angleOf(f, strand)) * R);

const UP = new THREE.Vector3(0, 1, 0);
const SPARK_COUNT = 6;

const makeDotTexture = () => {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.35, "rgba(255,255,255,0.65)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.needsUpdate = true;
  return t;
};

const Helix = () => {
  const group = useRef<THREE.Group>(null);
  const sparks = useRef<THREE.Mesh[]>([]);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const dotTexture = useMemo(makeDotTexture, []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (group.current) {
      group.current.rotation.y += delta * 0.3; // slow elegant spin
      group.current.rotation.x = 0.1 + Math.sin(t * 0.25) * 0.04; // slight perspective + wobble
      group.current.rotation.z = 0.03; // near-vertical, like the reference
      group.current.position.y = Math.sin(t * 0.5) * 0.1; // subtle float
    }
    // energy pulses travelling through the genome
    for (let i = 0; i < sparks.current.length; i++) {
      const m = sparks.current[i];
      if (!m) continue;
      const f = (t * 0.13 + i / SPARK_COUNT) % 1;
      pathPoint(f, i % 2, tmp);
      m.position.copy(tmp);
      const s = 0.6 + 0.4 * Math.sin(t * 6 + i);
      m.scale.setScalar(s);
    }
  });

  const { spheres, rods, pointsGeo } = useMemo(() => {
    const BEADS = 46; // dense "string of pearls" backbone
    const RUNG_EVERY = 2; // a rod every other bead (avoids clutter)
    const spheres: { pos: THREE.Vector3; color: THREE.Color; r: number; key: string }[] = [];
    const rods: { pos: THREE.Vector3; quat: THREE.Quaternion; len: number; key: string }[] = [];
    const a = new THREE.Vector3();
    const b = new THREE.Vector3();

    for (let i = 0; i < BEADS; i++) {
      const f = i / (BEADS - 1);
      pathPoint(f, 0, a);
      pathPoint(f, 1, b);
      const pA = a.clone();
      const pB = b.clone();
      spheres.push({ pos: pA, color: colorAt(f), r: 0.17, key: `a${i}` });
      spheres.push({ pos: pB, color: colorAt(f), r: 0.17, key: `b${i}` });

      if (i % RUNG_EVERY === 0) {
        const mid = pA.clone().add(pB).multiplyScalar(0.5);
        const dir = pB.clone().sub(pA);
        const len = dir.length();
        const quat = new THREE.Quaternion().setFromUnitVectors(UP, dir.clone().normalize());
        rods.push({ pos: mid, quat, len, key: `r${i}` });
      }
    }

    // dense glowing particle field along strands + drifting halo
    const positions: number[] = [];
    const colors: number[] = [];
    const SEG = 460;
    for (let s = 0; s < 2; s++) {
      for (let k = 0; k < SEG; k++) {
        const f = k / (SEG - 1);
        const ang = angleOf(f, s);
        const jr = R + (Math.random() - 0.5) * 0.16;
        positions.push(Math.cos(ang) * jr, yOf(f) + (Math.random() - 0.5) * 0.07, Math.sin(ang) * jr);
        const col = colorAt(f);
        colors.push(col.r, col.g, col.b);
      }
    }
    for (let k = 0; k < 240; k++) {
      const ang = Math.random() * Math.PI * 2;
      const rr = R + 0.2 + Math.random() * 1.7;
      positions.push(Math.cos(ang) * rr, HEIGHT / 2 - Math.random() * HEIGHT, Math.sin(ang) * rr);
      const col = colorAt(Math.random());
      colors.push(col.r, col.g, col.b);
    }
    const pointsGeo = new THREE.BufferGeometry();
    pointsGeo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    pointsGeo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

    return { spheres, rods, pointsGeo };
  }, []);

  return (
    <group ref={group}>
      {/* illuminated rods */}
      {rods.map((r) => (
        <mesh key={r.key} position={r.pos} quaternion={r.quat}>
          <cylinderGeometry args={[0.026, 0.026, r.len, 12]} />
          <meshStandardMaterial color="#ffffff" emissive="#9bb8ff" emissiveIntensity={1.1} roughness={0.2} metalness={0.1} />
        </mesh>
      ))}

      {/* glassy / iridescent translucent beads */}
      {spheres.map((s) => (
        <mesh key={s.key} position={s.pos}>
          <sphereGeometry args={[s.r, 32, 32]} />
          <meshPhysicalMaterial
            color={s.color}
            emissive={s.color}
            emissiveIntensity={0.28}
            roughness={0.04}
            metalness={0}
            transmission={0.82}
            thickness={1.5}
            ior={1.5}
            clearcoat={1}
            clearcoatRoughness={0.04}
            iridescence={0.35}
            iridescenceIOR={1.6}
            attenuationColor={"#8A5CFF"}
            attenuationDistance={2.4}
            envMapIntensity={1.9}
            transparent
            opacity={0.96}
          />
        </mesh>
      ))}

      {/* travelling energy pulses */}
      {Array.from({ length: SPARK_COUNT }).map((_, i) => (
        <mesh key={`spark-${i}`} ref={(el) => { if (el) sparks.current[i] = el; }}>
          <sphereGeometry args={[0.085, 16, 16]} />
          <meshBasicMaterial color="#dffbff" toneMapped={false} />
        </mesh>
      ))}

      {/* glowing particle cloud */}
      <points geometry={pointsGeo}>
        <pointsMaterial
          map={dotTexture}
          vertexColors
          size={0.085}
          sizeAttenuation
          transparent
          opacity={0.95}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
};

const DNAHelix3D = () => {
  return (
    <Canvas
      camera={{ position: [0.4, 0.2, 11], fov: 28 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.45} />
      {/* purple key */}
      <pointLight position={[-4, 3, 5]} intensity={85} color="#8A5CFF" />
      {/* cyan fill */}
      <pointLight position={[5, -2, 4]} intensity={70} color="#62F8FF" />
      {/* blue rim (behind) */}
      <pointLight position={[0, 2, -6]} intensity={90} color="#35C8FF" />
      {/* soft white spec */}
      <pointLight position={[0, 0, 8]} intensity={45} color="#ffffff" />

      <Helix />

      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.4} color="#62F8FF" position={[-3, 2, 2]} scale={[4, 7, 1]} />
        <Lightformer form="rect" intensity={2.4} color="#B14DFF" position={[3, -2, 2]} scale={[4, 7, 1]} />
        <Lightformer form="circle" intensity={2.6} color="#ffffff" position={[0, 3, 3]} scale={[3, 3, 1]} />
        <Lightformer form="rect" intensity={1.8} color="#35C8FF" position={[0, -3, -3]} scale={[6, 4, 1]} />
      </Environment>

      <EffectComposer disableNormalPass>
        <Bloom intensity={1.7} luminanceThreshold={0.05} luminanceSmoothing={0.45} mipmapBlur radius={0.95} />
        <DepthOfField target={[0, 0, 0]} focalLength={0.045} bokehScale={3} height={480} />
        <Vignette eskil={false} offset={0.26} darkness={0.74} />
      </EffectComposer>
    </Canvas>
  );
};

export default DNAHelix3D;
