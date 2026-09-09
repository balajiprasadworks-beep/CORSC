"use client";

/* =========================================================================
   The 3D heart scene — Three.js objects only, no DOM, no GSAP.

   Camera and heart-group are handed up to the caller via onReady as plain
   Three.js objects (not React state) so the cinematic timeline in
   cinematic-login.jsx can tween them directly with GSAP; React re-renders
   never need to be in that loop. Once the intro timeline finishes it flips
   idle.current.active, and this component's own useFrame takes over the
   subtle post-intro breathing, rotation and mouse parallax — continuing
   from wherever the timeline left off rather than resetting anything.

   Camera framing is computed from the geometry's own measured bounding
   sphere rather than hand-picked numbers, so a change to the heart shape
   can't silently throw the opening close-up out of frame.
   ========================================================================= */

import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { buildCoronaryCurves, buildHeartGeometry } from "@/lib/three/build-heart-geometry";

export interface HeartSceneApi {
  camera: THREE.PerspectiveCamera;
  heartGroup: THREE.Group;
  /** Distances the intro timeline dollies between, derived from the heart's actual measured size. */
  framing: { startDistance: number; endDistance: number; startFov: number; endFov: number };
}

export interface IdleState {
  active: boolean;
  mouseX: number;
  mouseY: number;
}

function fitDistance(radius: number, fovDeg: number, fillFraction: number) {
  const halfAngle = THREE.MathUtils.degToRad(fovDeg) / 2;
  return radius / (fillFraction * Math.tan(halfAngle));
}

function HeartMesh({
  heartGroupRef,
  built,
}: {
  heartGroupRef: MutableRefObject<THREE.Group | null>;
  built: ReturnType<typeof useHeartBuild>;
}) {
  useEffect(() => {
    const { geometry, coronaryGeometries, vessels } = built;
    return () => {
      geometry.dispose();
      coronaryGeometries.forEach((g) => g.dispose());
      vessels.forEach((v) => v.geometry.dispose());
    };
  }, [built]);

  return (
    <group ref={heartGroupRef}>
      <mesh geometry={built.geometry}>
        <meshPhysicalMaterial
          color="#f2ded2"
          roughness={0.32}
          metalness={0}
          transmission={0.42}
          thickness={1.1}
          ior={1.4}
          clearcoat={0.4}
          clearcoatRoughness={0.28}
          attenuationColor="#e8a98c"
          attenuationDistance={1.1}
        />
      </mesh>

      {built.vessels.map((vessel, i) => (
        <mesh key={i} geometry={vessel.geometry} position={vessel.position} rotation={vessel.rotation}>
          <meshPhysicalMaterial color="#f0d8ca" roughness={0.34} transmission={0.3} thickness={0.5} ior={1.4} clearcoat={0.3} />
        </mesh>
      ))}

      {built.coronaryGeometries.map((geo, i) => (
        <mesh key={i} geometry={geo}>
          <meshStandardMaterial color="#d9532f" roughness={0.3} emissive="#c1401f" emissiveIntensity={0.4} />
        </mesh>
      ))}
    </group>
  );
}

function useHeartBuild() {
  return useMemo(() => {
    const { geometry, outline } = buildHeartGeometry();
    geometry.computeBoundingSphere();
    const boundingRadius = geometry.boundingSphere?.radius ?? 1.4;

    const curves = buildCoronaryCurves(outline);
    const coronaryGeometries = curves.map((curve) => new THREE.TubeGeometry(curve, 36, 0.036, 8, false));

    // Great vessels emerge from the top cleft, roughly a third of the way
    // down from the top of the bounding sphere.
    const topY = boundingRadius * 0.72;
    const vessels: Array<{
      geometry: THREE.CylinderGeometry;
      position: [number, number, number];
      rotation: [number, number, number];
    }> = [
      {
        geometry: new THREE.CylinderGeometry(0.13, 0.16, 0.56, 18, 1, true),
        position: [0.14, topY + 0.18, 0.05],
        rotation: [0, 0, -0.34],
      },
      {
        geometry: new THREE.CylinderGeometry(0.1, 0.13, 0.44, 16, 1, true),
        position: [-0.22, topY + 0.12, 0.18],
        rotation: [0.2, 0, 0.24],
      },
      {
        geometry: new THREE.CylinderGeometry(0.08, 0.1, 0.34, 14, 1, true),
        position: [-0.4, topY, -0.05],
        rotation: [0.05, 0, 0.52],
      },
    ];

    return { geometry, outline, coronaryGeometries, vessels, boundingRadius };
  }, []);
}

function SceneContent({
  onReady,
  idle,
  reducedMotion,
}: {
  onReady: (api: HeartSceneApi) => void;
  idle: MutableRefObject<IdleState>;
  reducedMotion: boolean;
}) {
  const { camera } = useThree();
  const heartGroupRef = useRef<THREE.Group>(null);
  const readyFired = useRef(false);
  const clock = useRef(0);
  const built = useHeartBuild();

  /* eslint-disable react-hooks/immutability -- this effect's whole job is to
     hand the live Three.js camera/group out to GSAP (via onReady) and set
     its initial in-place transform. That's R3F's own idiom, not a React
     value: Three.js has no non-mutating substitute for `camera.fov = x`,
     and GSAP needs a real, tweenable object reference, not a copy. */
  useEffect(() => {
    if (readyFired.current || !heartGroupRef.current) return;
    readyFired.current = true;

    const startFov = 36;
    const endFov = 42;
    const framing = {
      startDistance: fitDistance(built.boundingRadius, startFov, 0.72),
      endDistance: fitDistance(built.boundingRadius, endFov, 0.24),
      startFov,
      endFov,
    };

    const cam = camera as THREE.PerspectiveCamera;
    cam.position.set(0, built.boundingRadius * 0.04, framing.startDistance);
    cam.fov = framing.startFov;
    cam.near = 0.1;
    cam.far = framing.endDistance * 4;
    cam.updateProjectionMatrix();
    cam.lookAt(0, 0, 0);

    onReady({ camera: cam, heartGroup: heartGroupRef.current, framing });
  }, [camera, onReady, built.boundingRadius]);
  /* eslint-enable react-hooks/immutability */

  useFrame((_, delta) => {
    if (!idle.current.active || reducedMotion || !heartGroupRef.current) return;
    clock.current += delta;
    const group = heartGroupRef.current;

    group.rotation.y += delta * 0.035;
    const pulse = 1 + Math.sin(clock.current * 1.15) * 0.012;
    group.scale.setScalar(pulse);

    const targetTiltX = idle.current.mouseY * 0.06;
    const targetTiltZ = idle.current.mouseX * 0.03;
    const damp = Math.min(delta * 2.2, 1);
    group.rotation.x += (targetTiltX - group.rotation.x) * damp;
    group.rotation.z += (targetTiltZ - group.rotation.z) * damp;
  });

  return (
    <>
      <ambientLight intensity={0.42} color="#eef2f6" />
      <hemisphereLight args={["#dfe8f2", "#2a2f3a", 0.5]} />
      <directionalLight position={[2.4, 3, 2.6]} intensity={1.55} color="#fff4e8" />
      <directionalLight position={[-3, 0.6, -1.5]} intensity={0.5} color="#a9c3e0" />
      <pointLight position={[0, 0.2, 1.4]} intensity={0.4} color="#ffb199" distance={4} />
      <HeartMesh heartGroupRef={heartGroupRef} built={built} />
    </>
  );
}

export default function HeartScene({
  onReady,
  idle,
  reducedMotion,
}: {
  onReady: (api: HeartSceneApi) => void;
  idle: MutableRefObject<IdleState>;
  reducedMotion: boolean;
}) {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ fov: 36, near: 0.1, far: 20 }}
      style={{ width: "100%", height: "100%" }}
    >
      <SceneContent onReady={onReady} idle={idle} reducedMotion={reducedMotion} />
    </Canvas>
  );
}
