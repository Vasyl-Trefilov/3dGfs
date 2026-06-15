import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const STEP = Math.PI / 4;
const LERP_SPEED = 0.08;

function makeAxis(start, end, color) {
  const geo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(...start),
    new THREE.Vector3(...end),
  ]);
  return new THREE.Line(geo, new THREE.LineBasicMaterial({ color }));
}

function makeTextSprite(text, color, scaleY = 0.3) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  ctx.font = "Bold 48px system-ui, sans-serif";
  const metrics = ctx.measureText(text);
  const w = Math.ceil(metrics.width) + 60;
  const h = 80;
  canvas.width = w;
  canvas.height = h;
  ctx.font = "Bold 48px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const hex = "#" + new THREE.Color(color).getHexString();
  ctx.fillStyle = hex;
  ctx.fillText(text, w / 2, h / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const mat = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
  });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(scaleY * (w / h), scaleY, 1);
  return sprite;
}

function getCheckerboardTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      ctx.fillStyle = (i + j) % 2 === 0 ? "#ffffff" : "#444444";
      ctx.fillRect(i * 32, j * 32, 32, 32);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  return tex;
}

const STEPS = [
  {
    title: {
      en: "1. The Point",
      de: "1. Der Punkt",
    },
    desc: {
      en: "A point is the absolute most basic element in 3D graphics. It represents a single location in infinite space, defined purely by its X, Y, and Z coordinates.",
      de: "Ein Punkt ist das absolut grundlegendste Element in der 3D-Grafik. Er repräsentiert einen einzelnen Ort im unendlichen Raum, der rein durch seine X-, Y- und Z-Koordinaten definiert ist.",
    },
    createContent(g) {
      const dot1 = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 16, 16),
        new THREE.MeshStandardMaterial({
          color: 0xff4444,
          emissive: 0xff0000,
          emissiveIntensity: 0.8,
        }),
      );
      dot1.position.set(0.4, 0.3, 0.2);
      g.add(dot1);

      const hl1 = new THREE.Mesh(
        new THREE.SphereGeometry(0.125, 16, 16),
        new THREE.MeshBasicMaterial({
          color: 0xff4444,
          transparent: true,
          opacity: 0.2,
        }),
      );
      hl1.position.set(0.4, 0.3, 0.2);
      g.add(hl1);

      const dot2 = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 16, 16),
        new THREE.MeshStandardMaterial({
          color: 0xff4444,
          emissive: 0xff0000,
          emissiveIntensity: 0.8,
        }),
      );
      dot2.position.set(0.2, 0.6, 0.3);
      g.add(dot2);

      const hl2 = new THREE.Mesh(
        new THREE.SphereGeometry(0.125, 16, 16),
        new THREE.MeshBasicMaterial({
          color: 0xff4444,
          transparent: true,
          opacity: 0.2,
        }),
      );
      hl2.position.set(0.2, 0.6, 0.3);
      g.add(hl2);

      const axesLen = 1.2;
      g.add(makeAxis([0, 0, 0], [axesLen, 0, 0], 0xff4444));
      g.add(makeAxis([0, 0, 0], [0, axesLen, 0], 0x44ff44));
      g.add(makeAxis([0, 0, 0], [0, 0, axesLen], 0x4444ff));

      const labels = [
        { t: "X", p: [axesLen + 0.2, 0, 0] },
        { t: "Y", p: [0, axesLen + 0.2, 0] },
        { t: "Z", p: [0, 0, axesLen + 0.2] },
      ];
      labels.forEach(({ t, p }) => {
        const sprite = makeTextSprite(t, 0xffffff, 0.2);
        sprite.position.set(...p);
        g.add(sprite);
      });

      g.userData.update = (time) => {
        hl1.scale.setScalar(1 + Math.sin(time * 4) * 0.2);
        hl2.scale.setScalar(1 + Math.sin(time * 4) * 0.2);
      };
    },
  },
  {
    title: {
      en: "2. Vertex & Edge",
      de: "2. Scheitelpunkt & Kante",
    },
    desc: {
      en: "When two points are connected, they form an Edge. The points themselves are now called Vertices. This straight line segment is the simplest form of geometry.",
      de: "Wenn zwei Punkte verbunden werden, bilden sie eine Kante. Die Punkte selbst werden nun Vertices (Scheitelpunkte) genannt. Dieses gerade Liniensegment ist die einfachste Form der Geometrie.",
    },
    createContent(g) {
      const p1 = new THREE.Vector3(-0.8, 0.5, 0);
      const p2 = new THREE.Vector3(0.8, -0.3, 0.4);

      [p1, p2].forEach((p, i) => {
        const dot = new THREE.Mesh(
          new THREE.SphereGeometry(0.08, 12, 12),
          new THREE.MeshStandardMaterial({
            color: 0x44aaff,
            emissive: 0x44aaff,
            emissiveIntensity: 0.5,
          }),
        );
        dot.position.copy(p);
        g.add(dot);
        const lbl = makeTextSprite("V" + (i + 1), 0x44aaff, 0.2);
        lbl.position.copy(p).add(new THREE.Vector3(0, 0.3, 0));
        g.add(lbl);
      });

      const edge = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([p1, p2]),
        new THREE.LineBasicMaterial({ color: 0x88ddff, linewidth: 2 }),
      );
      g.add(edge);

      const movingDot = new THREE.Mesh(
        new THREE.SphereGeometry(0.05, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xffffff }),
      );
      g.add(movingDot);

      g.userData.update = (time) => {
        const t = (Math.sin(time * 3) + 1) / 2;
        movingDot.position.lerpVectors(p1, p2, t);
      };
    },
  },
  {
    title: {
      en: "3. The Face (Triangle)",
      de: "3. Die Fläche (Dreieck)",
    },
    desc: {
      en: "Three vertices connected by edges form a Triangle - the undisputed king of 3D graphics. Every complex surface is just thousands of these tiny flat triangles stitched together.",
      de: "Drei durch Kanten verbundene Vertices bilden ein Dreieck – den unangefochtenen König der 3D-Grafiken. Jede komplexe Oberfläche besteht aus Tausenden dieser winzigen flachen Dreiecke.",
    },
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
          }),
        );
        dot.position.copy(p);
        g.add(dot);
      });

      const edgeLine = new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color: 0xffaa44 }),
      );
      g.add(edgeLine);

      const faceGeo = new THREE.BufferGeometry().setFromPoints(pts);
      faceGeo.computeVertexNormals();
      const faceMesh = new THREE.Mesh(
        faceGeo,
        new THREE.MeshBasicMaterial({
          color: 0xffaa44,
          transparent: true,
          opacity: 0.4,
          side: THREE.DoubleSide,
        }),
      );
      g.add(faceMesh);

      const center = new THREE.Vector3(0, -0.06, 0);
      const arrow = new THREE.ArrowHelper(
        new THREE.Vector3(0, 0, 1),
        center,
        0.6,
        0xffff00,
      );
      g.add(arrow);
      const nLbl = makeTextSprite("Normal", 0xffff00, 0.15);
      nLbl.position.set(0, 0.2, 0.6);
      g.add(nLbl);
    },
  },
  {
    title: {
      en: "4. The Mesh",
      de: "4. Das Polygonnetz (Mesh)",
    },
    desc: {
      en: "Multiple faces combined create a Mesh, acting as the 'hollow shell' of a 3D object. The more triangles a mesh has, the smoother and more organic it appears.",
      de: "Mehrere kombinierte Flächen bilden ein Mesh, das als 'hohle Hülle' eines 3D-Objekts fungiert. Je mehr Dreiecke ein Mesh hat, desto glatter und organischer wirkt es.",
    },
    createContent(g) {
      const geo = new THREE.IcosahedronGeometry(0.7, 1);

      const wire = new THREE.LineSegments(
        new THREE.EdgesGeometry(geo),
        new THREE.LineBasicMaterial({
          color: 0xdd44ff,
          transparent: true,
          opacity: 0.8,
        }),
      );
      g.add(wire);

      const mesh = new THREE.Mesh(
        geo,
        new THREE.MeshBasicMaterial({
          color: 0xdd44ff,
          transparent: true,
          opacity: 0.2,
        }),
      );
      g.add(mesh);

      g.userData.update = (time, delta) => {
        wire.rotation.y += delta * 0.2;
        wire.rotation.x += delta * 0.1;
        mesh.rotation.copy(wire.rotation);
      };
    },
  },
  {
    title: {
      en: "5. UV Mapping & Textures",
      de: "5. UV-Mapping & Texturen",
    },
    desc: {
      en: "To make shapes look real, we wrap 2D images (textures) around them. 'UV Mapping' tells the computer exactly how to unfold the 3D geometry onto a flat 2D image.",
      de: "Damit Formen real aussehen, wickeln wir 2D-Bilder (Texturen) um sie. 'UV-Mapping' teilt dem Computer genau mit, wie die 3D-Geometrie auf ein flaches 2D-Bild entfaltet wird.",
    },
    createContent(g) {
      const tex = getCheckerboardTexture();
      const geo = new THREE.BoxGeometry(1, 1, 1);
      const mat = new THREE.MeshStandardMaterial({ map: tex });
      const box = new THREE.Mesh(geo, mat);
      g.add(box);

      const wire = new THREE.LineSegments(
        new THREE.EdgesGeometry(geo),
        new THREE.LineBasicMaterial({ color: 0x00ffff }),
      );
      g.add(wire);

      g.userData.update = (time, delta) => {
        box.rotation.y -= delta * 0.5;
        box.rotation.x -= delta * 0.3;
        wire.rotation.copy(box.rotation);
      };
    },
  },
  {
    title: {
      en: "6. Shaders & Materials",
      de: "6. Shader & Materialien",
    },
    desc: {
      en: "Materials use programs called 'Shaders' to calculate how surfaces react to light. Below: Wireframe, Matte (Diffuse), and Glossy (Physically Based Rendering).",
      de: "Materialien verwenden kleine Programme namens 'Shader', um zu berechnen, wie Oberflächen auf Licht reagieren. Unten: Drahtgitter, Matt (Diffuse) und Glänzend (PBR).",
    },
    createContent(g) {
      const geo = new THREE.SphereGeometry(0.35, 32, 32);

      const m1 = new THREE.MeshBasicMaterial({
        color: 0x44aaff,
        wireframe: true,
      });
      const s1 = new THREE.Mesh(geo, m1);
      s1.position.x = -0.9;
      g.add(s1);

      const m2 = new THREE.MeshStandardMaterial({
        color: 0x44aaff,
        roughness: 1,
        metalness: 0,
      });
      const s2 = new THREE.Mesh(geo, m2);
      s2.position.x = 0;
      g.add(s2);

      const m3 = new THREE.MeshStandardMaterial({
        color: 0x44aaff,
        roughness: 0.1,
        metalness: 0.9,
      });
      const s3 = new THREE.Mesh(geo, m3);
      s3.position.x = 0.9;
      g.add(s3);
    },
  },
  {
    title: {
      en: "7. Lighting & Shadows",
      de: "7. Beleuchtung & Schatten",
    },
    desc: {
      en: "Without light, everything is pitch black. Virtual lights cast rays that bounce off materials, generating shadows, highlights, and giving the brain a sense of true depth.",
      de: "Ohne Licht ist alles pechschwarz. Virtuelle Lichter werfen Strahlen, die von Materialien abprallen, Schatten und Glanzlichter erzeugen und dem Gehirn ein Gefühl von wahrer Tiefe vermitteln.",
    },
    createContent(g) {
      const knot = new THREE.Mesh(
        new THREE.TorusKnotGeometry(0.4, 0.15, 100, 16),
        new THREE.MeshStandardMaterial({
          color: 0xff2244,
          roughness: 0.3,
          metalness: 0.2,
        }),
      );
      g.add(knot);

      const bulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0xffffff }),
      );
      const light = new THREE.PointLight(0xffffff, 5, 10);
      bulb.add(light);
      g.add(bulb);

      g.userData.update = (time, delta) => {
        knot.rotation.y += delta * 0.5;
        bulb.position.set(
          Math.sin(time * 2) * 1.5,
          Math.sin(time * 1.5) * 0.8,
          Math.cos(time * 2) * 1.5,
        );
      };
    },
  },
  {
    title: {
      en: "8. The GPU & Rasterization",
      de: "8. Die GPU & Rasterisierung",
    },
    desc: {
      en: "Finally, the Graphics Processing Unit (GPU) takes this 3D scene and flattens it. It scans the shapes and determines exactly which discrete 2D screen pixels fall inside the geometry, filling them with color.",
      de: "Schließlich nimmt die Graphics Processing Unit (GPU) diese 3D-Szene und flacht sie ab. Sie scannt die Formen und bestimmt exakt, welche diskreten 2D-Bildschirmpixel innerhalb der Geometrie liegen, und füllt sie mit Farbe.",
    },
    createContent(g) {
      const a = new THREE.Vector3(0, 0.7, 0);
      const b = new THREE.Vector3(-0.7, -0.6, 0);
      const c = new THREE.Vector3(0.7, -0.6, 0);

      const wireGeo = new THREE.BufferGeometry().setFromPoints([a, b, c, a]);
      const wireMat = new THREE.LineBasicMaterial({
        color: 0x00ffff,
        linewidth: 2,
        transparent: true,
        opacity: 0.8,
      });
      const wireLine = new THREE.Line(wireGeo, wireMat);
      wireLine.position.z = 0.05;
      g.add(wireLine);

      const isInsideTriangle = (px, py, ax, ay, bx, by, cx, cy) => {
        const area =
          0.5 * (-by * cx + ay * (-bx + cx) + ax * (by - cy) + bx * cy);
        const s =
          (1 / (2 * area)) *
          (ay * cx - ax * cy + (cy - ay) * px + (ax - cx) * py);
        const t =
          (1 / (2 * area)) *
          (ax * by - ay * bx + (ay - by) * px + (bx - ax) * py);
        return s >= 0 && t >= 0 && 1 - s - t >= 0;
      };

      const gridSize = 32;
      const gridSpan = 2.0;
      const pixelSize = gridSpan / gridSize;

      const pixelGeo = new THREE.PlaneGeometry(
        pixelSize * 0.85,
        pixelSize * 0.85,
      );
      const pixelMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const instancedMesh = new THREE.InstancedMesh(
        pixelGeo,
        pixelMat,
        gridSize * gridSize,
      );
      g.add(instancedMesh);

      const dummy = new THREE.Object3D();
      const colorInside = new THREE.Color(0x22ff44);
      const colorOutside = new THREE.Color(0x1a1a24);
      const colorScan = new THREE.Color(0xffffff);

      const pixelData = [];
      let idx = 0;

      for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
          const posX = -(gridSpan / 2) + (x + 0.5) * pixelSize;
          const posY = -(gridSpan / 2) + (y + 0.5) * pixelSize;

          dummy.position.set(posX, posY, 0);
          dummy.updateMatrix();
          instancedMesh.setMatrixAt(idx, dummy.matrix);

          const isInside = isInsideTriangle(
            posX,
            posY,
            a.x,
            a.y,
            b.x,
            b.y,
            c.x,
            c.y,
          );
          pixelData.push({ y: posY, isInside, index: idx });

          instancedMesh.setColorAt(idx, colorOutside);
          idx++;
        }
      }

      instancedMesh.instanceMatrix.needsUpdate = true;
      if (instancedMesh.instanceColor)
        instancedMesh.instanceColor.needsUpdate = true;

      g.userData.update = (time) => {
        const scanY = 1.2 - ((time * 0.8) % 2.7);

        for (let i = 0; i < pixelData.length; i++) {
          const p = pixelData[i];

          if (p.y > scanY) {
            instancedMesh.setColorAt(
              p.index,
              p.isInside ? colorInside : colorOutside,
            );
          } else if (Math.abs(p.y - scanY) < pixelSize) {
            instancedMesh.setColorAt(p.index, colorScan);
          } else {
            instancedMesh.setColorAt(p.index, colorOutside);
          }
        }
        instancedMesh.instanceColor.needsUpdate = true;
      };
    },
  },
];

export default function ThreeScene() {
  const containerRef = useRef(null);

  const [currentStep, setCurrentStep] = useState(0);
  const [lang, setLang] = useState("en");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [radius, setRadius] = useState(20);
  const [cameraY, setCameraY] = useState(0.4);
  const [animSpeed, setAnimSpeed] = useState(1);
  const animSpeedRef = useRef(animSpeed);

  useEffect(() => {
    animSpeedRef.current = animSpeed;
  }, [animSpeed]);

  const absStepRef = useRef(0);
  const targetAngleRef = useRef(0);
  const radiusRef = useRef(radius);
  const cameraYRef = useRef(cameraY);

  useEffect(() => {
    radiusRef.current = radius;
  }, [radius]);

  useEffect(() => {
    cameraYRef.current = cameraY;
  }, [cameraY]);

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

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

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const groups = STEPS.map((step, i) => {
      const g = new THREE.Group();
      g.position.set(
        radiusRef.current * Math.sin(i * STEP),
        0,
        radiusRef.current * Math.cos(i * STEP),
      );
      step.createContent(g);
      scene.add(g);
      return g;
    });

    const starGeometry = new THREE.BufferGeometry();
    const starCount = 6000;
    const starPositions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const r = 200 + Math.random() * 1000;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      starPositions[i * 3] = x;
      starPositions[i * 3 + 1] = y;
      starPositions[i * 3 + 2] = z;
    }

    starGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(starPositions, 3),
    );

    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.1,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      transparent: true,
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    const clock = new THREE.Clock();
    let currentAngle = 0;
    let animTime = 0;

    function animate() {
      const delta = clock.getDelta() * animSpeedRef.current;
      animTime += delta;

      currentAngle +=
        (targetAngleRef.current - currentAngle) *
        Math.min(1, LERP_SPEED * delta * 60);

      camera.position.x = (radiusRef.current + 3) * Math.sin(currentAngle);
      camera.position.z = (radiusRef.current + 3) * Math.cos(currentAngle);
      camera.position.y = cameraYRef.current;
      camera.lookAt(0, -0.5, 0);

      stars.rotation.y = animTime * 0.00001;

      groups.forEach((g, i) => {
        g.position.set(
          radiusRef.current * Math.sin(i * STEP),
          0,
          radiusRef.current * Math.cos(i * STEP),
        );
        g.rotation.y = animTime * 0.2;

        if (g.userData.update) {
          g.userData.update(animTime, delta);
        }
      });

      renderer.render(scene, camera);
    }

    renderer.setAnimationLoop(animate);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      renderer.setAnimationLoop(null);
      window.removeEventListener("resize", handleResize);
      if (containerRef.current)
        containerRef.current.removeChild(renderer.domElement);
      renderer.dispose();
      scene.clear();
    };
  }, []);

  function handleScreenClick(e) {
    const dir = e.clientX > window.innerWidth / 2 ? 1 : -1;
    absStepRef.current += dir;

    const len = STEPS.length;
    const nextIndex = ((absStepRef.current % len) + len) % len;

    setCurrentStep(nextIndex);
    targetAngleRef.current = absStepRef.current * STEP;
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <div
        onClick={handleScreenClick}
        style={{ position: "absolute", inset: 0, zIndex: 5, cursor: "pointer" }}
      />

      <div
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          zIndex: 20,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{
            background: "rgba(10, 15, 30, 0.8)",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "50%",
            width: "48px",
            height: "48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            backdropFilter: "blur(10px)",
            fontSize: "18px",
            transition: "transform 0.3s ease",
            transform: isMenuOpen ? "rotate(90deg)" : "rotate(0deg)",
          }}
          title="Settings"
        >
          {">"}
        </button>

        {isMenuOpen && (
          <div
            style={{
              marginTop: "12px",
              background: "rgba(10, 15, 30, 0.9)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "12px",
              padding: "20px",
              color: "#fff",
              backdropFilter: "blur(10px)",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              minWidth: "240px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            }}
          >
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <label
                style={{
                  fontSize: "13px",
                  color: "#88ddff",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                {lang === "en" ? "Language" : "Sprache"}
              </label>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                style={{
                  background: "rgba(0,0,0,0.5)",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.3)",
                  padding: "8px",
                  borderRadius: "6px",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                <option value="en">English</option>
                <option value="de">Deutsch</option>
              </select>
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <label
                style={{
                  fontSize: "13px",
                  color: "#88ddff",
                  display: "flex",
                  justifyContent: "space-between",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                <span>Radius</span>
                <span>{radius}</span>
              </label>
              <input
                type="range"
                min="5"
                max="40"
                step="1"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                style={{ cursor: "pointer" }}
              />
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <label
                style={{
                  fontSize: "13px",
                  color: "#88ddff",
                  display: "flex",
                  justifyContent: "space-between",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                <span>Time</span>
                <span>{animSpeed}</span>
              </label>
              <input
                type="range"
                min="0"
                max="1.5"
                step="0.1"
                value={animSpeed}
                onChange={(e) => setAnimSpeed(Number(e.target.value))}
                style={{ cursor: "pointer" }}
              />
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <label
                style={{
                  fontSize: "13px",
                  color: "#88ddff",
                  display: "flex",
                  justifyContent: "space-between",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                <span>Camera Y</span>
                <span>{cameraY.toFixed(1)}</span>
              </label>
              <input
                type="range"
                min="-10"
                max="15"
                step="0.5"
                value={cameraY}
                onChange={(e) => setCameraY(Number(e.target.value))}
                style={{ cursor: "pointer" }}
              />
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          position: "absolute",
          bottom: "40px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(10, 15, 30, 0.8)",
          color: "#fff",
          padding: "24px 32px",
          borderRadius: "16px",
          fontFamily: "system-ui, sans-serif",
          maxWidth: "600px",
          width: "85%",
          textAlign: "center",
          pointerEvents: "none",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          zIndex: 10,
        }}
      >
        <div
          style={{
            color: "#88ddff",
            fontSize: "12px",
            textTransform: "uppercase",
            letterSpacing: "2px",
            marginBottom: "8px",
          }}
        >
          {lang === "en" ? "Step" : "Schritt"} {currentStep + 1}{" "}
          {lang === "en" ? "of" : "von"} {STEPS.length}
        </div>
        <h2 style={{ margin: "0 0 12px", fontSize: "24px", fontWeight: "700" }}>
          {STEPS[currentStep].title[lang]}
        </h2>
        <p
          style={{
            margin: 0,
            fontSize: "15px",
            lineHeight: "1.6",
            color: "#aabccd",
          }}
        >
          {STEPS[currentStep].desc[lang]}
        </p>
      </div>

      {/* <div
        style={{
          position: "absolute",
          top: "40px",
          left: "50%",
          transform: "translateX(-50%)",
          color: "rgba(255,255,255,0.4)",
          fontSize: "14px",
          textTransform: "uppercase",
          letterSpacing: "3px",
          fontFamily: "system-ui, sans-serif",
          pointerEvents: "none",
          zIndex: 10,
          background: "rgba(0,0,0,0.3)",
          padding: "8px 16px",
          borderRadius: "20px",
        }}
      >
        {lang === "en"
          ? "Click Left / Right to navigate"
          : "Klicken Sie links / rechts zum Navigieren"}
      </div>*/}
    </div>
  );
}
