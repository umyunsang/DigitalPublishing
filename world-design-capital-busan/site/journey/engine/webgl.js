import * as THREE from "three";
import { cappedDPR } from "./env.js";

// 단일 WebGLRenderer. 활성 씬 1개만 매 프레임 그린다.
export function initWebGL(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(cappedDPR());
  const resize = () => renderer.setSize(window.innerWidth, window.innerHeight, false);
  resize();
  window.addEventListener("resize", resize);

  const scenes = new Map();   // name -> { scene, camera }
  let activeName = null;
  let raf = 0;

  const loop = () => {
    raf = requestAnimationFrame(loop);
    const a = activeName && scenes.get(activeName);
    if (a) renderer.render(a.scene, a.camera);
  };
  loop();

  // 컨텍스트 손실 복구
  canvas.addEventListener("webglcontextlost", (e) => { e.preventDefault(); cancelAnimationFrame(raf); });
  canvas.addEventListener("webglcontextrestored", () => loop());

  return {
    renderer,
    registerScene(name, scene, camera) { scenes.set(name, { scene, camera }); },
    unregisterScene(name) { scenes.delete(name); if (activeName === name) activeName = null; },
    setActive(name) { activeName = name; },
    dispose() {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      scenes.clear(); renderer.dispose();
    },
  };
}
