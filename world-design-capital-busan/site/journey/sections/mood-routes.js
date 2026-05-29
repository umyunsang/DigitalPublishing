import * as THREE from "three";
import { gsap } from "gsap";
import { prefersReducedMotion } from "../engine/env.js";

// Abstract Busan location nodes in 3D space
const NODES = [
  [-2.5,  1.0,  0.5], // 해운대
  [-0.8,  1.5,  0.0], // 광안리
  [ 1.2,  0.8, -0.5], // 남포동
  [ 2.8,  0.2,  0.3], // 부산역
  [ 1.5, -0.8,  0.8], // 서면
  [-0.2, -1.2,  0.2], // 연산동
  [-2.0, -0.5, -0.3], // 기장
  [ 0.5,  0.3,  0.6], // 동래
  [ 3.2, -0.5, -0.2], // 사직
  [-1.5,  2.0, -0.5], // 송정
];

const EDGES = [
  [0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,0],
  [1,7],[7,4],[7,8],[8,3],[9,0],[9,1],[5,2],[6,9],
];

export function create(webgl) {
  let scene, camera;
  let lineMaterials = [];
  let ticker = null;
  let t = 0;
  let active = false;
  let onResize;

  function buildScene() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 100);
    camera.position.set(0, 0, 8);

    const seaColor = new THREE.Color("#1f6f8b");
    const coralColor = new THREE.Color("#ff7a59");

    // Node spheres
    const nodeGeo = new THREE.SphereGeometry(0.07, 8, 8);
    for (const [x, y, z] of NODES) {
      const m = new THREE.Mesh(nodeGeo, new THREE.MeshBasicMaterial({ color: coralColor, transparent: true, opacity: 0 }));
      m.position.set(x, y, z);
      scene.add(m);
      lineMaterials.push(m.material);
    }

    // Route edges
    for (const [a, b] of EDGES) {
      const pts = [
        new THREE.Vector3(...NODES[a]),
        new THREE.Vector3(...NODES[b]),
      ];
      const g = new THREE.BufferGeometry().setFromPoints(pts);
      const mat = new THREE.LineDashedMaterial({
        color: seaColor, dashSize: 0.18, gapSize: 0.06,
        transparent: true, opacity: 0,
      });
      const line = new THREE.Line(g, mat);
      line.computeLineDistances();
      scene.add(line);
      lineMaterials.push(mat);
    }

    webgl.registerScene("mood-routes", scene, camera);
  }

  function tick() {
    if (!active || prefersReducedMotion()) return;
    t += 0.003;
    if (scene) scene.rotation.y = Math.sin(t) * 0.25;
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
      webgl.setActive("mood-routes");
      if (prefersReducedMotion()) {
        lineMaterials.forEach(m => { m.opacity = m instanceof THREE.LineDashedMaterial ? 0.65 : 1; });
        return;
      }
      gsap.to(lineMaterials, {
        opacity(i) { return lineMaterials[i] instanceof THREE.LineDashedMaterial ? 0.65 : 1; },
        duration: 0.7, stagger: 0.04, ease: "expo.out",
      });
    },
    leave() { active = false; webgl.setActive(null); },
    dispose() {
      active = false;
      if (ticker) gsap.ticker.remove(ticker);
      window.removeEventListener("resize", onResize);
      webgl.unregisterScene("mood-routes");
      scene?.traverse(o => { o.geometry?.dispose(); o.material?.dispose(); });
      lineMaterials = [];
    },
  };
}
export default create;
