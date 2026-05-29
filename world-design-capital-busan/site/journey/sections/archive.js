import * as THREE from "three";
import { gsap } from "gsap";
import { prefersReducedMotion } from "../engine/env.js";

const PLANE_COUNT = 8;
// Scattered positions [x, y, z]
const POSITIONS = [
  [-2.5,  1.2, -1.0], [-0.8,  1.8, -2.0], [ 1.6,  1.0, -0.5], [ 2.8, -0.5, -1.5],
  [-2.8, -0.8, -1.0], [-0.5, -1.5, -0.5], [ 1.8, -1.2, -2.0], [ 0.0,  0.2, -0.5],
];

export function create(webgl) {
  let scene, camera;
  let planes = []; // { mesh, targetY }
  let ticker = null;
  let t = 0;
  let active = false;
  let onResize;
  let disposed = false;

  function buildScene() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 50);
    camera.position.set(0, 0, 8);

    const loader = new THREE.TextureLoader();
    const geo = new THREE.PlaneGeometry(1.4, 1.8);

    for (let i = 0; i < PLANE_COUNT; i++) {
      const [x, y, z] = POSITIONS[i];
      const mat = new THREE.MeshBasicMaterial({
        color: "#1f4f6b", side: THREE.DoubleSide, transparent: true, opacity: 0,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y - 3, z);
      mesh.rotation.set(0, (Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 0.15);
      scene.add(mesh);
      planes.push({ mesh, targetY: y });

      // Load saved-scenes thumbnail — graceful fallback on 404
      loader.load(
        `./assets/saved-scenes/${i + 1}.webp`,
        (tex) => {
          if (disposed) { tex.dispose(); return; }
          mat.map = tex;
          mat.color.set("#ffffff");
          mat.needsUpdate = true;
        },
      );
    }

    webgl.registerScene("archive", scene, camera);
  }

  function tick() {
    if (!active || prefersReducedMotion()) return;
    t += 0.005;
    for (let i = 0; i < planes.length; i++) {
      const { mesh, targetY } = planes[i];
      mesh.position.y = targetY + Math.sin(t + i * 0.7) * 0.08;
    }
  }

  return {
    init() {
      buildScene();
      ticker = gsap.ticker.add(tick);
      onResize = () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); };
      window.addEventListener("resize", onResize);
    },
    enter() {
      active = true;
      webgl.setActive("archive");
      for (let i = 0; i < planes.length; i++) {
        const { mesh, targetY } = planes[i];
        if (prefersReducedMotion()) {
          mesh.material.opacity = 0.88;
          mesh.position.y = targetY;
        } else {
          gsap.to(mesh.material, { opacity: 0.88, duration: 0.9, delay: i * 0.07, ease: "expo.out" });
          gsap.to(mesh.position, { y: targetY, duration: 1.2, delay: i * 0.07, ease: "expo.out" });
        }
      }
    },
    leave() { active = false; webgl.setActive(null); },
    dispose() {
      disposed = true;
      active = false;
      if (ticker) gsap.ticker.remove(ticker);
      window.removeEventListener("resize", onResize);
      webgl.unregisterScene("archive");
      scene?.traverse(o => { o.geometry?.dispose(); o.material?.map?.dispose(); o.material?.dispose(); });
      planes = [];
    },
  };
}
export default create;
