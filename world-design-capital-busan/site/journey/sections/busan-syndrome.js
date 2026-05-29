import * as THREE from "three";
import { gsap } from "gsap";
import { prefersReducedMotion } from "../engine/env.js";

const COUNT = 3500;

export function create(webgl) {
  let scene, camera, geo, mesh;
  let baseX, baseZ;
  let ticker = null;
  let t = 0;
  let active = false;
  let onResize;

  function buildScene() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 100);
    camera.position.z = 6;

    baseX = new Float32Array(COUNT);
    baseZ = new Float32Array(COUNT);
    const pos = new Float32Array(COUNT * 3);
    const col = new Float32Array(COUNT * 3);
    const sea = new THREE.Color("#1f6f8b");
    const coral = new THREE.Color("#ff7a59");

    for (let i = 0; i < COUNT; i++) {
      baseX[i] = (Math.random() - 0.5) * 12;
      baseZ[i] = (Math.random() - 0.5) * 6;
      pos[i * 3] = baseX[i];
      pos[i * 3 + 1] = 0;
      pos[i * 3 + 2] = baseZ[i];
      const c = sea.clone().lerp(coral, Math.random() * 0.35);
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }

    geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));

    mesh = new THREE.Points(geo, new THREE.PointsMaterial({
      size: 0.036, vertexColors: true, transparent: true, opacity: 0,
    }));
    scene.add(mesh);
    webgl.registerScene("busan-syndrome", scene, camera);
  }

  function tick() {
    if (!active || prefersReducedMotion()) return;
    t += 0.008;
    const arr = geo.attributes.position.array;
    for (let i = 0; i < COUNT; i++) {
      arr[i * 3 + 1] =
        (Math.sin(baseX[i] * 1.1 + t) + Math.cos(baseZ[i] * 0.9 + t * 0.8)) * 0.8;
    }
    geo.attributes.position.needsUpdate = true;
    mesh.rotation.y = t * 0.03;
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
      webgl.setActive("busan-syndrome");
      const target = prefersReducedMotion() ? 0.85 : 0;
      if (prefersReducedMotion()) { mesh.material.opacity = 0.85; return; }
      gsap.fromTo(mesh.material, { opacity: 0 }, { opacity: 0.85, duration: 1.4, ease: "expo.out" });
    },
    leave() { active = false; webgl.setActive(null); },
    dispose() {
      active = false;
      if (ticker) gsap.ticker.remove(ticker);
      window.removeEventListener("resize", onResize);
      webgl.unregisterScene("busan-syndrome");
      geo?.dispose(); mesh?.material.dispose();
    },
  };
}
export default create;
