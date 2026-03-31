import { Suspense, useRef, useEffect, useMemo } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import type { MotionValue } from "framer-motion";
import { useTransform } from "framer-motion";
import * as THREE from "three";
import { ParallaxPlanes } from "./ParallaxPlanes";

const VIDEO_URL = "/high2.mp4";
const HERO_CAMERA_FOV = 15;
const PHONE_BASE_SCALE = 1.32;
const VIDEO_START_PROGRESS = 0.30;

// ── PHONE HORIZONTAL OFFSET ──────────────────────────────────
// Set PHONE_END_X to 0 to revert to centered (original).
const PHONE_END_X = 0.06;

type Props = { scrollYProgress: MotionValue<number> };

function useMotionRef(mv: MotionValue<number>) {
  const ref = useRef(mv.get());
  useEffect(() => mv.on("change", (v) => (ref.current = v)), [mv]);
  return ref;
}

function useVideoTex(src: string) {
  return useMemo(() => {
    const vid = document.createElement("video");
    vid.src = src;
    vid.crossOrigin = "anonymous";
    vid.loop = true;
    vid.muted = true;
    vid.playsInline = true;
    vid.preload = "auto";
    const tex = new THREE.VideoTexture(vid);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.flipY = false;
    return { texture: tex, video: vid };
  }, [src]);
}

function PhoneModel({ scrollYProgress }: Props) {
  /* Exact Theatre.js keyframes → useTransform (from theatre-phone-state.json) */
  const posX = useMotionRef(
    useTransform(scrollYProgress, [0, 0.20, 0.30, 0.667], [0, 0, PHONE_END_X, PHONE_END_X]),
  );
  const posY = useMotionRef(
    useTransform(scrollYProgress, [0, 0.244, 0.667], [0.035, 0, 0]),
  );
  const posZ = useMotionRef(
    useTransform(scrollYProgress, [0, 0.667, 1], [0.819, -0.433, -0.433]),
  );
  const rotX = useMotionRef(
    useTransform(scrollYProgress, [0, 0.389, 0.667, 1], [-0.358, 0, -0.083, -0.083]),
  );
  const rotY = useMotionRef(
    useTransform(scrollYProgress, [0, 0.382, 0.667], [-0.216, 0.408, 0.408]),
  );
  const vidOpacity = useMotionRef(
    useTransform(scrollYProgress, [0.09, 0.148, 0.667], [0, 1, 1]),
  );

  const objectRef = useRef<THREE.Object3D>(null);
  const emissiveMatRef = useRef<THREE.MeshPhysicalMaterial | null>(null);
  const hasStartedVideoRef = useRef(false);

  const { scene, nodes } = useGLTF("/models/phone.glb") as unknown as {
    scene: THREE.Object3D;
    nodes: Record<string, THREE.Mesh>;
  };
  const { texture: videoTex, video: videoEl } = useVideoTex(VIDEO_URL);
  const hdrTex = useLoader(RGBELoader, "/models/phone-lighting-reflection.hdr");

  const { scene: rootScene } = useThree();

  useEffect(() => {
    hdrTex.mapping = THREE.EquirectangularReflectionMapping;
    rootScene.environment = hdrTex;
  }, [hdrTex, rootScene]);

  useEffect(() => {
    scene.scale.setScalar(PHONE_BASE_SCALE);
    scene.position.set(0, 0, -0.25);
  }, [scene]);

  useEffect(() => {
    videoTex.flipY = false;
    videoTex.colorSpace = THREE.SRGBColorSpace;
  }, [videoTex]);

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (value) => {
      if (value >= VIDEO_START_PROGRESS) {
        if (!hasStartedVideoRef.current) {
          videoEl.currentTime = 0;
          videoEl.play().catch(() => {});
          hasStartedVideoRef.current = true;
        }
        return;
      }

      if (hasStartedVideoRef.current) {
        videoEl.pause();
        videoEl.currentTime = 0;
        hasStartedVideoRef.current = false;
      }
    });

    return () => {
      unsubscribe();
      videoEl.pause();
    };
  }, [scrollYProgress, videoEl]);

  useEffect(() => {
    const surface = nodes.polySurface4;
    if (!surface) return;

    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#000000"),
      metalness: 0,
      roughness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0,
      toneMapped: false,
      side: THREE.DoubleSide,
      envMapIntensity: 1,
      transparent: false,
    });

    mat.emissiveMap = videoTex;
    mat.emissive = new THREE.Color(0xffffff);
    mat.emissiveIntensity = 0;

    surface.material = mat;
    emissiveMatRef.current = mat;
    mat.needsUpdate = true;

    return () => mat.dispose();
  }, [nodes, videoTex]);

  useFrame(() => {
    const obj = objectRef.current;
    if (!obj) return;

    obj.position.set(posX.current, posY.current, posZ.current);
    obj.rotation.set(rotX.current, rotY.current, 0);
    obj.scale.setScalar(PHONE_BASE_SCALE);

    const mat = emissiveMatRef.current;
    if (mat) {
      mat.emissiveIntensity = vidOpacity.current;
    }
  });

  return <primitive ref={objectRef} object={scene} />;
}

function LoadedSignal({ onLoaded }: { onLoaded: () => void }) {
  useEffect(() => {
    onLoaded();
  }, [onLoaded]);
  return null;
}

type SceneProps = Props & { onLoaded?: () => void };

export function Hero3DScene({ scrollYProgress, onLoaded }: SceneProps) {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 20,
        pointerEvents: "none",
      }}
    >
      <Canvas
        gl={{ depth: true }}
        camera={{ position: [0, 0, 1], fov: HERO_CAMERA_FOV }}
      >
        <Suspense fallback={null}>
          <ParallaxPlanes scrollYProgress={scrollYProgress} />
          <PhoneModel scrollYProgress={scrollYProgress} />
          {onLoaded && <LoadedSignal onLoaded={onLoaded} />}
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload("/models/phone.glb");
