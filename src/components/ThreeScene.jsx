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

const STEPS = [
  {
    title: {
      en: "1. The Point",
      de: "1. Der Punkt(Vertex)",
    },
    desc: {
      en: "A point is the absolute most basic element in graphics. It represents a single exact location in space, defined purely by its X, Y, and Z coordinates.",
      de: "Ein Punkt ist das absolut grundlegendste Element in der Computergrafik. Er repräsentiert einen exakten Ort im Raum, der rein durch seine X-, Y- und Z-Koordinaten definiert ist.",
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
      en: "2. The Edge",
      de: "2. Die Kante(Edge)",
    },
    desc: {
      en: "When two points are connected, they form an Edge. This straight line segment is the simplest shape the computer can draw.",
      de: "Wenn zwei Punkte verbunden werden, bilden sie eine Kante. Dieses gerade Liniensegment ist die einfachste Form, die der Computer zeichnen kann.",
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
      de: "3. Das Dreieck (Face)",
    },
    desc: {
      en: "Three connected points form a Triangle. The computer loves triangles because they are always perfectly flat, unlike a Quad (rectangle) which bends and breaks when a point moves.",
      de: "Drei verbundene Punkte bilden ein Dreieck. Der Computer liebt Dreiecke, weil sie immer perfekt flach sind. Ein Viereck (Rechts) hingegen knickt in sich zusammen, sobald sich ein Punkt verschiebt.",
    },
    createContent(g) {
      const tPts = [
        new THREE.Vector3(-1.2, -0.5, 0),
        new THREE.Vector3(-0.2, -0.5, 0),
        new THREE.Vector3(-0.7, 0.8, 0),
      ];

      tPts.forEach((p) => {
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

      const tLine = new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(tPts),
        new THREE.LineBasicMaterial({ color: 0xffaa44 }),
      );
      g.add(tLine);

      const tFaceGeo = new THREE.BufferGeometry().setFromPoints(tPts);
      tFaceGeo.computeVertexNormals();
      const tFaceMesh = new THREE.Mesh(
        tFaceGeo,
        new THREE.MeshBasicMaterial({
          color: 0xffaa44,
          transparent: true,
          opacity: 0.4,
          side: THREE.DoubleSide,
        }),
      );
      g.add(tFaceMesh);

      const qPts = [
        new THREE.Vector3(0.2, 0.8, 0),
        new THREE.Vector3(1.2, 0.8, 0),
        new THREE.Vector3(1.2, -0.5, 0),
        new THREE.Vector3(0.2, -0.5, 0),
      ];

      const qDots = [];
      qPts.forEach((p) => {
        const dot = new THREE.Mesh(
          new THREE.SphereGeometry(0.05, 10, 10),
          new THREE.MeshStandardMaterial({
            color: 0xff4444,
            emissive: 0xff4444,
          }),
        );
        dot.position.copy(p);
        g.add(dot);
        qDots.push(dot);
      });

      const qLineGeo = new THREE.BufferGeometry().setFromPoints([
        ...qPts,
        qPts[0],
      ]);
      const qLine = new THREE.Line(
        qLineGeo,
        new THREE.LineBasicMaterial({ color: 0xff4444 }),
      );
      g.add(qLine);

      // const qDiagGeo = new THREE.BufferGeometry().setFromPoints([
      //   qPts[0],
      //   qPts[2],
      // ]);
      // const qDiag = new THREE.Line(
      //   qDiagGeo,
      //   new THREE.LineBasicMaterial({
      //     color: 0xff4444,
      //     transparent: true,
      //     opacity: 0.3,
      //   }),
      // );
      // g.add(qDiag);

      const qFaceGeo = new THREE.BufferGeometry().setFromPoints(qPts);
      qFaceGeo.setIndex([0, 3, 2, 0, 2, 1]);
      qFaceGeo.computeVertexNormals();
      const qFaceMesh = new THREE.Mesh(
        qFaceGeo,
        new THREE.MeshBasicMaterial({
          color: 0xff4444,
          transparent: true,
          opacity: 0.4,
          side: THREE.DoubleSide,
        }),
      );
      g.add(qFaceMesh);

      g.userData.update = (time) => {
        const zDisplace = Math.sin(time * 3) * 0.6;

        qDots[1].position.z = zDisplace;

        const linePos = qLineGeo.attributes.position;
        linePos.setZ(1, zDisplace);
        linePos.needsUpdate = true;

        const facePos = qFaceGeo.attributes.position;
        facePos.setZ(1, zDisplace);
        facePos.needsUpdate = true;
      };
    },
  },
  {
    title: {
      en: "4. 2D is also Triangles",
      de: "4. Auch 2D besteht aus Dreiecken",
    },
    desc: {
      en: "How does your computer draw 2D windows or text? Even flat elements like your browser are just rectangles made of two triangles each!",
      de: "Wie zeichnet der Computer flache 2D-Fenster oder Text? Selbst flache Elemente wie dein Browserfenster sind nur Rechtecke, die jeweils aus zwei Dreiecken zusammengeklebt sind!",
    },
    noGlobalSpin: true,
    createContent(g) {
      const windowGroup = new THREE.Group();

      const bgGeo = new THREE.PlaneGeometry(1.6, 1.2);
      const bgMat = new THREE.MeshBasicMaterial({
        color: 0xcccccc,
        side: THREE.DoubleSide,
        transparent: true,
      });
      const bgWireMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
      });
      const bgMesh = new THREE.Mesh(bgGeo, bgMat);
      const bgWire = new THREE.Mesh(bgGeo, bgWireMat);
      bgMesh.add(bgWire);
      windowGroup.add(bgMesh);

      const titleGeo = new THREE.PlaneGeometry(1.6, 0.25);
      const titleMat = new THREE.MeshBasicMaterial({
        color: 0x0055aa,
        side: THREE.DoubleSide,
        transparent: true,
      });
      const titleWireMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
      });
      const titleMesh = new THREE.Mesh(titleGeo, titleMat);
      titleMesh.position.set(0, 0.475, 0.01);
      const titleWire = new THREE.Mesh(titleGeo, titleWireMat);
      titleMesh.add(titleWire);
      windowGroup.add(titleMesh);

      const btnGeo = new THREE.PlaneGeometry(0.15, 0.15);
      const btnMat = new THREE.MeshBasicMaterial({
        color: 0xff3333,
        side: THREE.DoubleSide,
        transparent: true,
      });
      const btnWireMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
      });
      const btnMesh = new THREE.Mesh(btnGeo, btnMat);
      btnMesh.position.set(0.65, 0.475, 0.02);
      const btnWire = new THREE.Mesh(btnGeo, btnWireMat);
      btnMesh.add(btnWire);
      windowGroup.add(btnMesh);

      g.add(windowGroup);

      g.userData.update = (time) => {
        windowGroup.rotation.y = Math.sin(time * 0.5) * 0.4;
        const showWire = Math.sin(time * 2) > 0;
        bgWire.visible = showWire;
        titleWire.visible = showWire;
        btnWire.visible = showWire;

        bgMesh.material.opacity = showWire ? 0.2 : 1.0;
        titleMesh.material.opacity = showWire ? 0.2 : 1.0;
        btnMesh.material.opacity = showWire ? 0.2 : 1.0;
      };
    },
  },
  {
    title: {
      en: "5. The Mesh (3D Shapes)",
      de: "5. Das 3D-Gitter (Mesh)",
    },
    desc: {
      en: "By connecting many triangles in 3D space, we create a hollow shell called a Mesh. Every 3D character or object in a game is just thousands of these flat triangles.",
      de: "Indem wir viele Dreiecke im 3D-Raum verbinden, erstellen wir eine hohle Hülle, ein sogenanntes Mesh. Jeder 3D-Charakter oder jedes Objekt in Spielen besteht einfach aus Tausenden solcher flachen Dreiecke.",
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
      en: "6. The Illusion of Depth",
      de: "6. Die Illusion von Tiefe",
    },
    desc: {
      en: "To make flat triangles look like a real object, we add virtual light. The computer calculates how bright each triangle should be, creating shadows and the illusion of 3D depth.",
      de: "Damit flache Dreiecke wie ein echtes Objekt aussehen, fügen wir virtuelles Licht hinzu. Der Computer berechnet, wie hell jedes Dreieck sein muss, und erzeugt so Schatten und die Illusion von 3D-Tiefe.",
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
      en: "7. The Screen (Pixels)",
      de: "7. Der Bildschirm (Pixels)",
    },
    desc: {
      en: "In the end, your monitor only shows tiny square pixels. The computer checks which pixel is inside which triangle and colors it. This happens millions of times per second!",
      de: "Am Ende zeigt dein Monitor nur winzige quadratische Pixel an. Der Computer prüft, welches Pixel in welchem Dreieck liegt, und färbt es ein. Das passiert Millionen Mal pro Sekunde!",
    },
    noGlobalSpin: true,
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
  {
    title: {
      en: "8. The Result",
      de: "8. Das Ergebnis",
    },
    desc: {
      en: "",
      de: "",
    },
    noGlobalSpin: true,
    createContent(g) {
      function subdivideFaces(baseGeo) {
        const srcPos = baseGeo.attributes.position;
        const srcIdx = baseGeo.index;
        const faceCount = srcIdx ? srcIdx.count : srcPos.count;

        const positions = [];
        const indices = [];

        for (let f = 0; f < faceCount; f += 3) {
          const ai = srcIdx ? srcIdx.getX(f) : f;
          const bi = srcIdx ? srcIdx.getX(f + 1) : f + 1;
          const ci = srcIdx ? srcIdx.getX(f + 2) : f + 2;

          const ax = srcPos.getX(ai),
            ay = srcPos.getY(ai),
            az = srcPos.getZ(ai);
          const bx = srcPos.getX(bi),
            by = srcPos.getY(bi),
            bz = srcPos.getZ(bi);
          const cx = srcPos.getX(ci),
            cy = srcPos.getY(ci),
            cz = srcPos.getZ(ci);

          const dx = (ax + bx + cx) / 3;
          const dy = (ay + by + cy) / 3;
          const dz = (az + bz + cz) / 3;

          const n = positions.length / 3;
          positions.push(ax, ay, az);
          positions.push(bx, by, bz);
          positions.push(cx, cy, cz);
          positions.push(dx, dy, dz);

          indices.push(n + 3, n + 1, n + 2);
          indices.push(n + 0, n + 3, n + 2);
          indices.push(n + 0, n + 1, n + 3);
        }

        const geo = new THREE.BufferGeometry();
        const posArr = new Float32Array(positions);
        geo.setAttribute("position", new THREE.BufferAttribute(posArr, 3));
        geo.setIndex(indices);
        geo.computeVertexNormals();
        return geo;
      }

      const RADIUS = 0.8;
      const geoLow = new THREE.IcosahedronGeometry(RADIUS, 1);

      const geoHighBase = new THREE.IcosahedronGeometry(RADIUS, 4);
      const geoHigh = subdivideFaces(geoHighBase);
      geoHighBase.dispose();

      const posAttr = geoHigh.attributes.position;

      const smoothPositions = posAttr.array.slice();

      const vertexCount = posAttr.count;
      const directions = new Float32Array(smoothPositions.length);
      const tempVec = new THREE.Vector3();
      for (let i = 0; i < vertexCount; i++) {
        const base = i * 3;
        tempVec.set(
          smoothPositions[base],
          smoothPositions[base + 1],
          smoothPositions[base + 2],
        );
        const len = tempVec.length() || 1;
        directions[base] = tempVec.x / len;
        directions[base + 1] = tempVec.y / len;
        directions[base + 2] = tempVec.z / len;
      }

      const isSpikeTip = new Uint8Array(vertexCount);
      for (let i = 3; i < vertexCount; i += 4) isSpikeTip[i] = 1;

      const matWireLow = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
        transparent: true,
        depthWrite: false,
      });
      const matWireHigh = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
        transparent: true,
        depthWrite: false,
      });
      const matFlatWhite = new THREE.MeshBasicMaterial({
        color: 0xaaaaaa,
        transparent: true,
      });
      const matLit = new THREE.MeshPhongMaterial({
        color: 0x4b2ecf,
        specular: 0xffffff,
        shininess: 1,
        transparent: true,
      });

      const meshWireLow = new THREE.Mesh(geoLow, matWireLow);

      const meshWireHigh = new THREE.Mesh(geoHigh, matWireHigh);
      const meshFlatWhite = new THREE.Mesh(geoHigh, matFlatWhite);
      const meshLit = new THREE.Mesh(geoHigh, matLit);

      meshWireLow.scale.setScalar(1.002);
      meshWireHigh.scale.setScalar(1.002);

      const group = new THREE.Group();
      group.add(meshWireLow, meshWireHigh, meshFlatWhite, meshLit);
      g.add(group);

      group.position.z = -1.6;

      const hemiLight = new THREE.DirectionalLight(0x4b2ecf, 1);
      hemiLight.position.set(0, -20, -10);
      g.add(hemiLight);

      const dirLight = new THREE.DirectionalLight(0x00ffb3, 1);
      dirLight.position.set(0, 20, 10);
      g.add(dirLight);

      function setMeshOpacity(mesh, opacity) {
        mesh.material.opacity = opacity;
        mesh.visible = opacity > 0.001;
      }

      const spikeConf = {
        speed: 800,
        min: 0.1,
        max: 0.22,
      };

      function updateGeometry(timeStamp, spikeAmount) {
        const { speed, min, max } = spikeConf;
        const arr = posAttr.array;

        for (let i = 0; i < vertexCount; i++) {
          const base = i * 3;
          const sx = smoothPositions[base];
          const sy = smoothPositions[base + 1];
          const sz = smoothPositions[base + 2];

          if (isSpikeTip[i] && spikeAmount > 0) {
            const wave = min + Math.abs(Math.sin(i + timeStamp / speed)) * max;
            const dirX = directions[base];
            const dirY = directions[base + 1];
            const dirZ = directions[base + 2];

            const tx = dirX * (RADIUS + wave);
            const ty = dirY * (RADIUS + wave);
            const tz = dirZ * (RADIUS + wave);

            arr[base] = sx + (tx - sx) * spikeAmount;
            arr[base + 1] = sy + (ty - sy) * spikeAmount;
            arr[base + 2] = sz + (tz - sz) * spikeAmount;
          } else {
            arr[base] = sx;
            arr[base + 1] = sy;
            arr[base + 2] = sz;
          }
        }

        posAttr.needsUpdate = true;
        geoHigh.computeVertexNormals();
      }

      const easeInOut = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);
      const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

      const fadeOut = (t) => 1 - Math.pow(clamp(t, 0, 1), 3);
      const fadeIn = (t) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);

      const DUR = {
        lowWireHold: 3,
        lowToHigh: 3,
        growSpikes: 3,
        wireToFlat: 3,
        flatToLit: 3,
        litHold: 10,
        litToLowWire: 2,
      };

      const CYCLE =
        DUR.lowWireHold +
        DUR.lowToHigh +
        DUR.growSpikes +
        DUR.wireToFlat +
        DUR.flatToLit +
        DUR.litHold +
        DUR.litToLowWire;

      g.userData.update = (time, delta) => {
        group.rotation.y += 0.06 * delta;
        group.rotation.x += 0.18 * delta;
        group.rotation.z += 0.12 * delta;

        const elapsed = time % CYCLE;

        function setAll(opacities) {
          setMeshOpacity(meshWireLow, opacities.wireLow ?? 0);
          setMeshOpacity(meshWireHigh, opacities.wireHigh ?? 0);
          setMeshOpacity(meshFlatWhite, opacities.flatWhite ?? 0);
          setMeshOpacity(meshLit, opacities.lit ?? 0);
        }

        let t0 = 0;
        let segEnd = t0 + DUR.lowWireHold;
        let spikeAmount = 0;

        if (elapsed < segEnd) {
          setAll({ wireLow: 1 });
          dirLight.intensity = 0;
          hemiLight.intensity = 0;
          updateGeometry(time * 1000, 0);
          return;
        }
        t0 = segEnd;
        segEnd = t0 + DUR.lowToHigh;

        if (elapsed < segEnd) {
          const t = clamp((elapsed - t0) / DUR.lowToHigh, 0, 1);
          setAll({ wireLow: fadeOut(t), wireHigh: fadeIn(t) });
          dirLight.intensity = 0;
          hemiLight.intensity = 0;
          updateGeometry(time * 1000, 0);
          return;
        }
        t0 = segEnd;
        segEnd = t0 + DUR.growSpikes;

        if (elapsed < segEnd) {
          const t = clamp((elapsed - t0) / DUR.growSpikes, 0, 1);
          spikeAmount = easeInOut(t);
          setAll({ wireHigh: 1 });
          dirLight.intensity = 0;
          hemiLight.intensity = 0;
          updateGeometry(time * 1000, spikeAmount);
          return;
        }
        t0 = segEnd;
        segEnd = t0 + DUR.wireToFlat;

        if (elapsed < segEnd) {
          const t = clamp((elapsed - t0) / DUR.wireToFlat, 0, 1);
          setAll({ wireHigh: fadeOut(t), flatWhite: fadeIn(t) });
          dirLight.intensity = 0;
          hemiLight.intensity = 0;
          updateGeometry(time * 1000, 1);
          return;
        }
        t0 = segEnd;
        segEnd = t0 + DUR.flatToLit;

        if (elapsed < segEnd) {
          const t = clamp((elapsed - t0) / DUR.flatToLit, 0, 1);
          setAll({ flatWhite: fadeOut(t), lit: fadeIn(t) });
          dirLight.intensity = easeInOut(t) * 1;
          hemiLight.intensity = easeInOut(t) * 1;
          updateGeometry(time * 1000, 1);
          return;
        }
        t0 = segEnd;
        segEnd = t0 + DUR.litHold;

        if (elapsed < segEnd) {
          setAll({ lit: 1 });
          dirLight.intensity = 1;
          hemiLight.intensity = 1;
          updateGeometry(time * 1000, 1);
          return;
        }
        t0 = segEnd;
        segEnd = t0 + DUR.litToLowWire;

        const t = clamp((elapsed - t0) / DUR.litToLowWire, 0, 1);
        spikeAmount = 1 - easeInOut(t);
        setAll({ wireLow: fadeIn(t), lit: fadeOut(t) });
        dirLight.intensity = 1 - easeInOut(t);
        hemiLight.intensity = 1 - easeInOut(t);
        updateGeometry(time * 1000, spikeAmount);
      };
    },
  },
];

export default function ThreeScene() {
  const containerRef = useRef(null);

  const [currentStep, setCurrentStep] = useState(0);
  const [lang, setLang] = useState("de");
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

        if (STEPS[i].noGlobalSpin) {
          g.rotation.y = i * STEP;
        } else {
          g.rotation.y = animTime * 0.2;
        }

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
                <option value="de">Deutsch</option>
                <option value="en">English</option>
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
                max="3.5"
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
    </div>
  );
}
