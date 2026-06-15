import { useEffect, useRef } from "react";
import * as THREE from "three";

const RADIUS = 7;
const STEP = Math.PI / 4;
const LERP_SPEED = 0.05;

function createOrbitObject(angle, color, size = 0.5) {
  const geometry = new THREE.BoxGeometry(size, size, size);
  const material = new THREE.MeshStandardMaterial({
    color,
    metalness: 0.3,
    roughness: 0.4,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(RADIUS * Math.sin(angle), 0, RADIUS * Math.cos(angle));
  mesh.lookAt(0, 0, 0);
  return mesh;
}

export default function ThreeScene() {
  const containerRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111122);

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x404060);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0x4488ff, 0.5);
    fillLight.position.set(-10, 5, -10);
    scene.add(fillLight);

    const grid = new THREE.GridHelper(20, 20, 0x88aaff, 0x334466);
    scene.add(grid);

    const objects = [];
    const colors = [
      0xff4444, 0x44ff44, 0x4444ff, 0xffff44, 0xff44ff, 0x44ffff, 0xff8844,
      0x88ff44,
    ];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const obj = createOrbitObject(angle, colors[i], 0.6);
      scene.add(obj);
      objects.push(obj);
    }

    let currentAngle = 0;
    let targetAngle = 0;
    let isAnimating = false;

    camera.position.set(
      RADIUS * Math.sin(currentAngle),
      1,
      RADIUS * Math.cos(currentAngle),
    );
    camera.lookAt(0, 0, 0);

    const clock = new THREE.Clock();

    function animate() {
      const delta = clock.getDelta();

      if (isAnimating) {
        currentAngle +=
          (targetAngle - currentAngle) * Math.min(1, LERP_SPEED * delta * 60);
        if (Math.abs(targetAngle - currentAngle) < 0.001) {
          currentAngle = targetAngle;
          isAnimating = false;
        }
      }

      camera.position.x = (RADIUS + 4) * Math.sin(currentAngle);
      camera.position.z = (RADIUS + 4) * Math.cos(currentAngle);
      camera.lookAt(0, 0, 0);

      objects.forEach((obj) => {
        obj.rotation.y += delta * 0.5;
      });

      renderer.render(scene, camera);
    }

    renderer.setAnimationLoop(animate);

    function handleClick(e) {
      const x = e.clientX;
      if (isAnimating) return;
      if (x > window.innerWidth / 2) {
        targetAngle += STEP;
      } else {
        targetAngle -= STEP;
      }
      isAnimating = true;
    }

    window.addEventListener("click", handleClick);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      renderer.setAnimationLoop(null);
      window.removeEventListener("click", handleClick);
      window.removeEventListener("resize", handleResize);
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} style={{ display: "block" }} />;
}
