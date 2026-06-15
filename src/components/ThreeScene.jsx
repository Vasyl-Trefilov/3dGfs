import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const RADIUS = 6;
const STEP = Math.PI / 2;
const LERP_SPEED = 0.05;

const STEPS = [
  {
    title: "Point",
    desc: "A point is the most basic element in 3D graphics. It represents a single location in space defined by X, Y, and Z coordinates. Everything in computer graphics starts from points.",
    createContent(g) {
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.25, 16, 16),
        new THREE.MeshStandardMaterial({
          color: 0xff4444,
          emissive: 0xff4444,
          emissiveIntensity: 0.5,
        }),
      );
      g.add(dot);

      const hl = new THREE.Mesh(
        new THREE.SphereGeometry(0.35, 16, 16),
        new THREE.MeshBasicMaterial({
          color: 0xff4444,
          transparent: true,
          opacity: 0.15,
        }),
      );
      g.add(hl);

      const axesLen = 1.2;
      const arrowMat = (color) => new THREE.LineBasicMaterial({ color });
      const makeAxis = (start, end, color) => {
        const g2 = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(...start),
          new THREE.Vector3(...end),
        ]);
        return new THREE.Line(g2, arrowMat(color));
      };
      g.add(makeAxis([0, 0, 0], [axesLen, 0, 0], 0xff4444));
      g.add(makeAxis([0, 0, 0], [-axesLen, 0, 0], 0xff4444));
      g.add(makeAxis([0, 0, 0], [0, axesLen, 0], 0x44ff44));
      g.add(makeAxis([0, 0, 0], [0, -axesLen, 0], 0x44ff44));
      g.add(makeAxis([0, 0, 0], [0, 0, axesLen], 0x4444ff));
      g.add(makeAxis([0, 0, 0], [0, 0, -axesLen], 0x4444ff));

      const labelPositions = [
        [axesLen + 0.2, 0, 0],
        [-axesLen - 0.3, 0, 0],
        [0, axesLen + 0.2, 0],
        [0, -axesLen - 0.3, 0],
        [0, 0, axesLen + 0.2],
        [0, 0, -axesLen - 0.3],
      ];
      const labels = ["X", "-X", "Y", "-Y", "Z", "-Z"];
      labelPositions.forEach((pos, i) => {
        const sprite = makeTextSprite(labels[i], 0xffffff, 0.2);
        sprite.position.set(pos[0], pos[1], pos[2]);
        g.add(sprite);
      });
    },
  },
  {
    title: "Vertex & Edge",
    desc: "When two points are connected, they form a vertex and an edge. Vertices define the shape of an object. An edge is the straight line segment connecting two vertices - the simplest form of geometry.",
    createContent(g) {
      const positions = [
        new THREE.Vector3(-0.8, 0.5, 0),
        new THREE.Vector3(0.8, -0.3, 0.4),
      ];
      positions.forEach((p) => {
        const dot = new THREE.Mesh(
          new THREE.SphereGeometry(0.05, 12, 12),
          new THREE.MeshStandardMaterial({
            color: 0x44aaff,
            emissive: 0x44aaff,
            emissiveIntensity: 0.4,
          }),
        );
        dot.position.copy(p);
        g.add(dot);
      });

      const edgeGeo = new THREE.BufferGeometry().setFromPoints(positions);
      const edgeMat = new THREE.LineBasicMaterial({
        color: 0x88ddff,
        linewidth: 2,
      });
      const edge = new THREE.Line(edgeGeo, edgeMat);
      g.add(edge);

      const mid = new THREE.Vector3()
        .addVectors(positions[0], positions[1])
        .multiplyScalar(0.5);
      const label = makeTextSprite("Edge", 0x88ddff, 0.25);
        label.position.set(mid.x, mid.y + 0.4, mid.z);
        g.add(label);

      positions.forEach((p, i) => {
        const lbl = makeTextSprite("V" + (i + 1), 0x44aaff, 0.18);
        lbl.position.set(p.x, p.y - 0.4, p.z);
        g.add(lbl);
      });
    },
  },
  {
    title: "Face",
    desc: "Three vertices connected by edges form a triangle - the most common face in 3D graphics. Faces are the building blocks of surfaces. Most 3D objects are made of thousands of triangles stitched together.",
    createContent(g) {
      const pts = [
        new THREE.Vector3(-0.8, -0.5, 0),
        new THREE.Vector3(0.8, -0.5, 0),
        new THREE.Vector3(0, 0.8, 0),
      ];
      pts.forEach((p) => {
        const dot = new THREE.Mesh(
          new THREE.SphereGeometry(0.05, 10, 10),
          new THREE.MeshStandardMaterial({
            color: 0xffaa44,
            emissive: 0xffaa44,
            emissiveIntensity: 0.3,
          }),
        );
        dot.position.copy(p);
        g.add(dot);
      });

      const edgeGeo = new THREE.BufferGeometry().setFromPoints([
        ...pts,
        pts[0],
      ]);
      const edgeLine = new THREE.Line(
        edgeGeo,
        new THREE.LineBasicMaterial({ color: 0xffaa44 }),
      );
      g.add(edgeLine);

      const faceGeo = new THREE.BufferGeometry();
      const verts = new Float32Array([
        pts[0].x,
        pts[0].y,
        pts[0].z,
        pts[1].x,
        pts[1].y,
        pts[1].z,
        pts[2].x,
        pts[2].y,
        pts[2].z,
      ]);
      faceGeo.setAttribute("position", new THREE.BufferAttribute(verts, 3));
      faceGeo.setIndex([0, 1, 2]);
      faceGeo.computeVertexNormals();
      const faceMesh = new THREE.Mesh(
        faceGeo,
        new THREE.MeshBasicMaterial({
          color: 0xffaa44,
          transparent: true,
          opacity: 0.3,
          side: THREE.DoubleSide,
        }),
      );
      g.add(faceMesh);

      const label = makeTextSprite("Face (Triangle)", 0xffaa44, 0.3);
      label.position.set(0, -0.8, 0);
      g.add(label);
    },
  },
  {
    title: "Mesh",
    desc: "Multiple faces combined create a mesh - a complete 3D object. Meshes define the surface of 3D models. The more faces a mesh has, the smoother and more detailed it can appear.",
    createContent(g) {
      const geo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
      const wire = new THREE.LineSegments(
        new THREE.EdgesGeometry(geo),
        new THREE.LineBasicMaterial({ color: 0xdd44ff }),
      );
      g.add(wire);

      const mesh = new THREE.Mesh(
        geo,
        new THREE.MeshBasicMaterial({
          color: 0xdd44ff,
          transparent: true,
          opacity: 0.15,
          wireframe: false,
        }),
      );
      g.add(mesh);

      const verts = [
        [-0.4, -0.4, -0.4],
        [0.4, -0.4, -0.4],
        [0.4, 0.4, -0.4],
        [-0.4, 0.4, -0.4],
        [-0.4, -0.4, 0.4],
        [0.4, -0.4, 0.4],
        [0.4, 0.4, 0.4],
        [-0.4, 0.4, 0.4],
      ];
      verts.forEach((v) => {
        const dot = new THREE.Mesh(
          new THREE.SphereGeometry(0.04, 8, 8),
          new THREE.MeshStandardMaterial({
            color: 0xff88ff,
            emissive: 0xff88ff,
            emissiveIntensity: 0.5,
          }),
        );
        dot.position.set(v[0], v[1], v[2]);
        g.add(dot);
      });

      const label = makeTextSprite("Mesh (6 faces, 8 vertices)", 0xdd44ff, 0.3);
      label.position.set(0, -0.9, 0);
      g.add(label);
    },
  },
];

function makeTextSprite(text, color, scaleY = 0.3) {
  const ctx = document.createElement("canvas").getContext("2d");
  ctx.font = "Bold 48px monospace";
  const metrics = ctx.measureText(text);
  const w = Math.ceil(metrics.width) + 40;
  const h = 80;
  ctx.canvas.width = w;
  ctx.canvas.height = h;
  ctx.font = "Bold 48px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const hex = "#" + new THREE.Color(color).getHexString();
  ctx.fillStyle = hex;
  ctx.fillText(text, w / 2, h / 2);

  const texture = new THREE.CanvasTexture(ctx.canvas);
  texture.minFilter = THREE.LinearFilter;
  const mat = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
  });
  const sprite = new THREE.Sprite(mat);
  const aspect = w / h;
  sprite.scale.set(scaleY * aspect, scaleY, 1);
  return sprite;
}

function createStepGroup(angle, label) {
  const group = new THREE.Group();
  group.position.set(RADIUS * Math.sin(angle), 0, RADIUS * Math.cos(angle));
  group.userData = { angle, label };
  return group;
}

export default function ThreeScene() {
  const containerRef = useRef(null);
  const [currentStep, setCurrentStep] = useState(0);
  const stepRef = useRef(0);

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

    const groups = STEPS.map((step, i) => {
      const g = createStepGroup(i * STEP, step.title);
      step.createContent(g);
      scene.add(g);
      return g;
    });

    let currentAngle = 0;
    let targetAngle = 0;
    let isAnimating = false;

    camera.position.set(
      RADIUS * Math.sin(currentAngle),
      0.2,
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

      groups.forEach((g) => {
        g.rotation.y += delta * 0.3;
      });

      renderer.render(scene, camera);
    }

    renderer.setAnimationLoop(animate);

    function handleClick(e) {
      if (isAnimating) return;
      const dir = e.clientX > window.innerWidth / 2 ? 1 : -1;
      const next = (stepRef.current + dir + STEPS.length) % STEPS.length;
      stepRef.current = next;
      setCurrentStep(next);
      targetAngle = next * STEP;
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

  return (
    <div
      ref={containerRef}
      style={{ position: "relative", width: "100%", height: "100%" }}
    >
      <div
        style={{
          position: "absolute",
          bottom: "40px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(0,0,0,0.75)",
          color: "#fff",
          padding: "16px 28px",
          borderRadius: "12px",
          fontFamily: "system-ui, sans-serif",
          maxWidth: "600px",
          width: "80%",
          textAlign: "center",
          pointerEvents: "none",
          backdropFilter: "blur(4px)",
          border: "1px solid rgba(255,255,255,0.1)",
          zIndex: 10,
        }}
      >
        <h2 style={{ margin: "0 0 8px", fontSize: "20px", color: "#88ddff" }}>
          {STEPS[currentStep].title}
        </h2>
        <p
          style={{
            margin: 0,
            fontSize: "14px",
            lineHeight: "1.5",
            color: "#ccc",
          }}
        >
          {STEPS[currentStep].desc}
        </p>
      </div>
      {/* <div
        style={{
          position: "absolute",
          bottom: "120px",
          left: "50%",
          transform: "translateX(-50%)",
          color: "rgba(255,255,255,0.3)",
          fontSize: "12px",
          fontFamily: "monospace",
          pointerEvents: "none",
          zIndex: 10,
        }}
      >
        click left / right to navigate
      </div>*/}
    </div>
  );
}
