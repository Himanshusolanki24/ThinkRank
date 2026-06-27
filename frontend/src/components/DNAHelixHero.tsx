// @ts-nocheck
/**
 * DNAHelixHero — interactive three.js DNA double helix for the home hero.
 * Adapted from the standalone showcase: fills its parent panel, drag-to-rotate,
 * auto-spins when idle. Full-screen chrome (title/hint/palette) and wheel-zoom
 * are intentionally omitted so it embeds cleanly in the landing hero.
 */
import { useEffect, useRef } from "react";
import * as THREE from "three";

// Dark purple glossy helix gradient: deep violet shades with subtle purple highlights
const NEON_STOPS = [
  [0, "#3B1A78"], [0.18, "#4C1D95"], [0.36, "#5B21B6"], [0.5, "#3C1A8A"],
  [0.6, "#6D28D9"], [0.74, "#4C1D95"], [0.88, "#5B21B6"], [1, "#7C3AED"],
];

// Shared accent palette (atmosphere particles, rings, dots)
const ATMO = ["#3B1A78", "#4C1D95", "#5B21B6", "#6D28D9"];

function buildGradientFn(stops) {
  const S = stops.map(([p, h]) => [p, new THREE.Color(h)]);
  return (t) => {
    t = Math.min(1, Math.max(0, t));
    for (let i = 0; i < S.length - 1; i++) {
      const a = S[i], b = S[i + 1];
      if (t >= a[0] && t <= b[0]) {
        const k = (t - a[0]) / (b[0] - a[0]);
        return a[1].clone().lerp(b[1], k);
      }
    }
    return S[S.length - 1][1].clone();
  };
}

export default function DNAHelixHero() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch (e) {
      return;
    }
    renderer.setClearColor(0x000000, 0); // transparent — blend with the page

    const W = () => mount.clientWidth || window.innerWidth;
    const H = () => mount.clientHeight || window.innerHeight;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W(), H());
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.92;
    renderer.outputEncoding = THREE.sRGBEncoding;
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";
    renderer.domElement.style.cursor = "grab";

    const scene = new THREE.Scene();
    // no opaque background / fog → canvas is transparent and blends with the home page

    const camera = new THREE.PerspectiveCamera(42, W() / H(), 0.1, 200);
    camera.position.set(0, 0, 32);

    const glowTex = (() => {
      const s = 128, c = document.createElement("canvas");
      c.width = c.height = s;
      const ctx = c.getContext("2d");
      const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
      g.addColorStop(0, "rgba(255,255,255,1)");
      g.addColorStop(.22, "rgba(255,255,255,.85)");
      g.addColorStop(.5, "rgba(255,255,255,.25)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
      const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t;
    })();
    const addGlow = (parent, color, size, opacity) => {
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({
        map: glowTex, color, transparent: true, opacity,
        blending: THREE.AdditiveBlending, depthWrite: false,
      }));
      sp.scale.set(size, size, 1); parent.add(sp); return sp;
    };

    scene.add(new THREE.AmbientLight(0x100a26, 0.8));
    const key = new THREE.PointLight(0x7c3aed, 2.2, 80); key.position.set(-9, 6, 12); scene.add(key);   // violet
    const fill = new THREE.PointLight(0x5b21b6, 1.9, 80); fill.position.set(9, -7, 10); scene.add(fill);  // deep purple
    const rim = new THREE.PointLight(0x8b5cf6, 1.2, 120); rim.position.set(0, 2, -16); scene.add(rim);    // soft purple rim
    const dir = new THREE.DirectionalLight(0x4c1d95, 0.5); dir.position.set(0, 1, 0.4); scene.add(dir);   // deep violet key

    const dna = new THREE.Group(); scene.add(dna);
    const N = 150, TURNS = 5.6, HEIGHT = 36, RADIUS = 2.7, SPH_R = 0.46, ROD_EVERY = 2;
    const BEND_X = 2.4, BEND_Z = 1.1; // subtle lean — stays tall & mostly vertical
    const sphereGeo = new THREE.SphereGeometry(SPH_R, 32, 32);
    const parts = [];
    const up = new THREE.Vector3(0, 1, 0);

    // Curved central spine — offsets the helix axis so it leans/bends instead of standing straight
    const spineOffset = (t) => ({
      x: Math.sin((t - 0.5) * Math.PI) * BEND_X,
      z: (Math.cos((t - 0.5) * Math.PI) - 1) * BEND_Z,
    });

    const backboneSphere = (pos, t, side) => {
      // Glossy translucent glass — transmission + clearcoat + iridescence for crystal refractions
      const mat = new THREE.MeshPhysicalMaterial({
        roughness: .07, metalness: 0,
        clearcoat: 1, clearcoatRoughness: .05,
        transmission: .55, ior: 1.45, thickness: 1.4,
        iridescence: .45, iridescenceIOR: 1.3,
        transparent: true, opacity: 1,
      });
      const mesh = new THREE.Mesh(sphereGeo, mat); mesh.position.copy(pos); dna.add(mesh);
      const halo = addGlow(mesh, 0xffffff, SPH_R * 5.2, .45);
      const core = addGlow(mesh, 0xffffff, SPH_R * 2.0, .5);
      parts.push({ kind: "sphere", t, side, mat, halo, core });
    };
    const basePair = (a, b, t) => {
      const d = new THREE.Vector3().subVectors(b, a), len = d.length();
      const geo = new THREE.CylinderGeometry(.075, .075, len, 12, 1, true);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x9a72ff, roughness: .25, metalness: 0, transparent: true, opacity: .9,
      });
      const rod = new THREE.Mesh(geo, mat);
      rod.position.copy(a).add(b).multiplyScalar(.5);
      rod.quaternion.setFromUnitVectors(up, d.clone().normalize());
      dna.add(rod);
      const halo = addGlow(rod, 0xffffff, len * .55, .3);
      parts.push({ kind: "rod", t, side: 0, mat, halo });
    };

    for (let i = 0; i < N; i++) {
      const t = i / (N - 1), ang = t * TURNS * Math.PI * 2, y = (t - .5) * HEIGHT;
      const { x: ox, z: oz } = spineOffset(t);
      const a = new THREE.Vector3(ox + Math.cos(ang) * RADIUS, y, oz + Math.sin(ang) * RADIUS);
      const b = new THREE.Vector3(ox + Math.cos(ang + Math.PI) * RADIUS, y, oz + Math.sin(ang + Math.PI) * RADIUS);
      backboneSphere(a, t, 0);
      backboneSphere(b, t, 1);
      if (i % ROD_EVERY === 0 && i > 0 && i < N - 1) basePair(a, b, t);
    }

    const aef = new THREE.Color("#A78BFA");
    const aef2 = new THREE.Color("#8B5CF6");
    const grad = buildGradientFn(NEON_STOPS);
    parts.forEach((o) => {
      const col = grad(o.t);
      if (o.kind === "sphere") {
        o.mat.color.copy(col).multiplyScalar(.5);
        o.mat.attenuationColor = col.clone();
        o.mat.attenuationDistance = 2.4;
        o.mat.emissive.copy(col); o.mat.emissiveIntensity = 1.1;
        o.halo.material.color.copy(col);
        o.core.material.color.copy(col.clone().lerp(new THREE.Color("#ffffff"), .5));
      } else {
        o.mat.emissive.copy(col.clone().lerp(aef, .5)); o.mat.emissiveIntensity = 1.35;
        o.halo.material.color.copy(col.clone().lerp(aef2, .45));
      }
    });
    key.color.copy(grad(0.55).clone().lerp(new THREE.Color("#7C3AED"), .45));
    fill.color.copy(grad(0.0).clone().lerp(new THREE.Color("#5B21B6"), .4));

    const backdrop = new THREE.Group(); backdrop.position.z = -6; scene.add(backdrop);
    for (let r = 3; r <= 9; r++) {
      const seg = 160, pts = [], radius = r * 1.9;
      for (let s = 0; s <= seg; s++) { const a = s / seg * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius, 0)); }
      backdrop.add(new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color: r % 2 ? 0x3f7dff : 0x8a5cff, transparent: true, opacity: .10 + (1 / r) * .08, blending: THREE.AdditiveBlending, depthWrite: false })
      ));
    }
    const hexagon = (x, y, z, size, opacity) => {
      const pts = [];
      for (let i = 0; i <= 6; i++) { const a = i / 6 * Math.PI * 2 + Math.PI / 6; pts.push(new THREE.Vector3(Math.cos(a) * size, Math.sin(a) * size, 0)); }
      const h = new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color: 0x8a5cff, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false })
      );
      h.position.set(x, y, z); backdrop.add(h);
    };
    hexagon(-13, -3, -2, .9, .22); hexagon(13, 5, -3, .7, .18); hexagon(-11, 6, 1, .55, .16);
    hexagon(12, -6, 0, 1, .20); hexagon(-14, 1, -4, .6, .14);

    const PCOUNT = 520, pPos = new Float32Array(PCOUNT * 3), pCol = new Float32Array(PCOUNT * 3);
    const pal = ATMO.map((h) => new THREE.Color(h));
    for (let i = 0; i < PCOUNT; i++) {
      const r = 6 + Math.random() * 26, th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
      pPos[i * 3] = Math.sin(ph) * Math.cos(th) * r;
      pPos[i * 3 + 1] = (Math.random() - .5) * 30;
      pPos[i * 3 + 2] = Math.sin(ph) * Math.sin(th) * r * .6 - 4;
      const c = pal[(Math.random() * pal.length) | 0];
      pCol[i * 3] = c.r; pCol[i * 3 + 1] = c.g; pCol[i * 3 + 2] = c.b;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute("color", new THREE.BufferAttribute(pCol, 3));
    const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
      size: .16, map: glowTex, vertexColors: true, transparent: true,
      opacity: .7, blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    scene.add(particles);

    const dots = new THREE.Group(); scene.add(dots);
    for (let i = 0; i < 14; i++) {
      const c = pal[(Math.random() * pal.length) | 0];
      const g = addGlow(dots, c, .6 + Math.random() * 1.1, .7);
      g.position.set((Math.random() - .5) * 30, (Math.random() - .5) * 24, (Math.random() - .5) * 10 - 4);
    }

    let targetYaw = .4, targetPitch = .05, yaw = .4, pitch = .05;
    let dragging = false, lastX = 0, lastY = 0, idle = 0;
    const targetZoom = 32;
    const down = (x, y) => { dragging = true; lastX = x; lastY = y; idle = 0; renderer.domElement.style.cursor = "grabbing"; };
    const move = (x, y) => {
      if (!dragging) return;
      targetYaw += (x - lastX) * .006;
      targetPitch += (y - lastY) * .004;
      targetPitch = Math.max(-.9, Math.min(.9, targetPitch));
      lastX = x; lastY = y; idle = 0;
    };
    const up2 = () => { dragging = false; renderer.domElement.style.cursor = "grab"; };
    const onMD = (e) => down(e.clientX, e.clientY);
    const onMM = (e) => move(e.clientX, e.clientY);
    const onTS = (e) => { const t = e.touches[0]; down(t.clientX, t.clientY); };
    const onTM = (e) => { const t = e.touches[0]; move(t.clientX, t.clientY); };
    renderer.domElement.addEventListener("mousedown", onMD);
    window.addEventListener("mousemove", onMM);
    window.addEventListener("mouseup", up2);
    renderer.domElement.addEventListener("touchstart", onTS, { passive: true });
    renderer.domElement.addEventListener("touchmove", onTM, { passive: true });
    window.addEventListener("touchend", up2);

    const onResize = () => {
      camera.aspect = W() / H();
      camera.updateProjectionMatrix();
      renderer.setSize(W(), H());
    };
    window.addEventListener("resize", onResize);

    const clock = new THREE.Clock();
    let raf;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const dt = clock.getDelta(), t = clock.elapsedTime; idle += dt;
      if (!dragging && idle > 1) targetYaw += dt * .18;
      yaw += (targetYaw - yaw) * .08; pitch += (targetPitch - pitch) * .08;
      dna.rotation.y = yaw; dna.rotation.x = pitch; dna.position.y = Math.sin(t * .4) * .25;
      camera.position.z += (targetZoom - camera.position.z) * .07;
      camera.position.y = Math.sin(t * .25) * .4; camera.lookAt(0, 0, 0);
      particles.rotation.y = t * .02; backdrop.rotation.z = Math.sin(t * .05) * .04;
      dots.children.forEach((d, i) => { d.material.opacity = .45 + .35 * Math.sin(t * 1.3 + i); });
      renderer.render(scene, camera);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      renderer.domElement.removeEventListener("mousedown", onMD);
      window.removeEventListener("mousemove", onMM);
      window.removeEventListener("mouseup", up2);
      renderer.domElement.removeEventListener("touchstart", onTS);
      renderer.domElement.removeEventListener("touchmove", onTM);
      window.removeEventListener("touchend", up2);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0" />;
}
