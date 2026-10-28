// The WebGL hub: a glowing core that emits broadcast rings, one object per service on tilted
// orbits, and a field of pixels that assembles around the core as the section scrolls through.
// Loaded on demand by MediaHub (dynamic import), so three.js never weighs on first load.
import * as THREE from 'three';
import { clamp, damp, lerp, subscribe } from '@/lib/motion';

const BRIGHT = new THREE.Color('#7fb53f');
const BRAND = new THREE.Color('#6a9a36');
const DEEP = new THREE.Color('#24391a');
const PAPER = new THREE.Color('#f3f1ea');
const INK = new THREE.Color('#0b120a');

export interface HubScene {
  /** 0 → 1 while the section crosses the viewport. */
  setProgress(p: number): void;
  /** Pointer relative to the stage centre, each axis -1 → 1. */
  setPointer(x: number, y: number): void;
  start(): void;
  stop(): void;
  dispose(): void;
}

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

// ── Materials ──
const solid = (color: THREE.Color, emissive = 0) =>
  new THREE.MeshStandardMaterial({
    color,
    emissive: BRIGHT,
    emissiveIntensity: emissive,
    metalness: 0.35,
    roughness: 0.4,
    flatShading: true,
  });
const glow = (color: THREE.Color, opacity = 0.9) =>
  new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

function fresnel(color: THREE.Color, power: number, intensity: number) {
  return new THREE.ShaderMaterial({
    uniforms: { uColor: { value: color }, uPower: { value: power }, uIntensity: { value: intensity } },
    vertexShader: /* glsl */ `
      varying vec3 vN;
      varying vec3 vV;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uPower;
      uniform float uIntensity;
      varying vec3 vN;
      varying vec3 vV;
      void main() {
        float f = pow(1.0 - abs(dot(vN, vV)), uPower) * uIntensity;
        gl_FragColor = vec4(uColor * f, f);
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

// ── One object per service (each about one unit across, facing +z) ──
// Motion design & production: a film reel.
function filmReel(seg: number) {
  const g = new THREE.Group();
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.08, seg), solid(DEEP, 0.1));
  disc.rotation.x = Math.PI / 2;
  g.add(disc);
  g.add(new THREE.Mesh(new THREE.TorusGeometry(0.44, 0.045, 8, seg), solid(BRIGHT, 0.5)));
  const holeGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.1, 16);
  const holeMat = solid(INK);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const hole = new THREE.Mesh(holeGeo, holeMat);
    hole.rotation.x = Math.PI / 2;
    hole.position.set(Math.cos(a) * 0.24, Math.sin(a) * 0.24, 0.01);
    g.add(hole);
  }
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.14, 16), solid(BRIGHT, 0.6));
  hub.rotation.x = Math.PI / 2;
  g.add(hub);
  return g;
}

// Graphic design: a pen nib.
function penNib() {
  const nib = new THREE.Shape();
  nib.moveTo(0, 0.46);
  nib.lineTo(0.27, 0.04);
  nib.lineTo(0.15, -0.36);
  nib.lineTo(-0.15, -0.36);
  nib.lineTo(-0.27, 0.04);
  nib.closePath();
  const hole = new THREE.Path();
  hole.absarc(0, 0, 0.065, 0, Math.PI * 2, true);
  nib.holes.push(hole);
  const geo = new THREE.ExtrudeGeometry(nib, { depth: 0.07, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 2 });
  geo.center();
  const g = new THREE.Group();
  g.add(new THREE.Mesh(geo, solid(BRIGHT, 0.45)));
  const slit = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.42, 0.12), solid(INK));
  slit.position.y = 0.23;
  g.add(slit);
  const collar = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.08, 0.12), solid(DEEP, 0.15));
  collar.position.y = -0.4;
  g.add(collar);
  return g;
}

function roundedRect(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  s.moveTo(-w / 2 + r, -h / 2);
  s.lineTo(w / 2 - r, -h / 2);
  s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
  s.lineTo(w / 2, h / 2 - r);
  s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
  s.lineTo(-w / 2 + r, h / 2);
  s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
  s.lineTo(-w / 2, -h / 2 + r);
  s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
  return s;
}

// Website design & build: a browser window with a page inside.
function browserWindow() {
  const g = new THREE.Group();
  const plate = new THREE.Mesh(new THREE.ExtrudeGeometry(roundedRect(0.92, 0.64, 0.07), { depth: 0.05, bevelEnabled: false }), solid(DEEP, 0.12));
  plate.position.z = -0.025;
  g.add(plate);
  const front = (w: number, h: number, x: number, y: number, mat: THREE.Material) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.03), mat);
    m.position.set(x, y, 0.035);
    g.add(m);
  };
  front(0.92, 0.012, 0, 0.21, glow(BRIGHT, 0.7)); // under the tab bar
  const dot = new THREE.CircleGeometry(0.022, 12);
  [-0.38, -0.32, -0.26].forEach((x) => {
    const d = new THREE.Mesh(dot, glow(PAPER, 0.8));
    d.position.set(x, 0.26, 0.03);
    g.add(d);
  });
  front(0.36, 0.05, -0.2, 0.13, solid(BRIGHT, 0.5)); // headline
  front(0.26, 0.03, -0.25, 0.05, solid(PAPER, 0)); // text line
  front(0.32, 0.2, 0.22, 0.07, solid(BRAND, 0.3)); // hero image
  [-0.28, 0, 0.28].forEach((x) => front(0.22, 0.14, x, -0.18, solid(BRAND, 0.15))); // cards
  return g;
}

// Logo design & branding: an abstract mark in a glowing ring.
function brandMark(seg: number) {
  const g = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.016, 6, seg), glow(BRIGHT, 0.85));
  ring.name = 'glow';
  g.add(ring);
  const diamond = new THREE.Shape();
  diamond.moveTo(0, 0.32);
  diamond.lineTo(0.26, 0);
  diamond.lineTo(0, -0.32);
  diamond.lineTo(-0.26, 0);
  diamond.closePath();
  const geo = new THREE.ExtrudeGeometry(diamond, { depth: 0.08, bevelEnabled: true, bevelSize: 0.015, bevelThickness: 0.015, bevelSegments: 1 });
  geo.center();
  g.add(new THREE.Mesh(geo, solid(BRAND, 0.3)));
  const half = new THREE.Shape();
  half.moveTo(0, 0.32);
  half.lineTo(0.26, 0);
  half.lineTo(0, 0);
  half.closePath();
  const facet = new THREE.Mesh(new THREE.ShapeGeometry(half), glow(BRIGHT, 0.9));
  facet.position.z = 0.06;
  g.add(facet);
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 12), solid(PAPER, 0.2));
  core.position.z = 0.06;
  g.add(core);
  return g;
}

// ── Pixel field: scattered points that settle onto a shell around the core ──
function pixelField(count: number) {
  const start = new Float32Array(count * 3);
  const target = new Float32Array(count * 3);
  const seed = new Float32Array(count);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    // Start: a wide loose cloud.
    const r = 4 + Math.random() * 5;
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    start.set([r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph) * 0.7, r * Math.sin(ph) * Math.sin(th) - 2], i * 3);
    // Target: an even (Fibonacci) shell.
    const y = 1 - (i / (count - 1)) * 2;
    const rad = Math.sqrt(1 - y * y);
    const a = i * golden;
    const shell = 2.1 + (Math.random() - 0.5) * 0.12;
    target.set([Math.cos(a) * rad * shell, y * shell, Math.sin(a) * rad * shell], i * 3);
    seed[i] = Math.random();
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(start, 3));
  geo.setAttribute('aTarget', new THREE.BufferAttribute(target, 3));
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uProgress: { value: 0 },
      uTime: { value: 0 },
      uSize: { value: 26 },
      uPixelRatio: { value: 1 },
      uA: { value: BRIGHT },
      uB: { value: PAPER },
    },
    vertexShader: /* glsl */ `
      attribute vec3 aTarget;
      attribute float aSeed;
      uniform float uProgress;
      uniform float uTime;
      uniform float uSize;
      uniform float uPixelRatio;
      varying float vAlpha;
      varying float vSeed;
      void main() {
        float p = smoothstep(0.0, 1.0, clamp(uProgress * 1.4 - aSeed * 0.4, 0.0, 1.0));
        vec3 pos = mix(position, aTarget, p);
        pos += 0.05 * vec3(sin(uTime * 0.7 + aSeed * 40.0), cos(uTime * 0.9 + aSeed * 30.0), sin(uTime * 0.5 + aSeed * 20.0));
        vec4 mv = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = uSize * uPixelRatio / -mv.z;
        gl_Position = projectionMatrix * mv;
        vAlpha = (0.25 + 0.75 * p) * (0.6 + 0.4 * sin(uTime * 2.0 + aSeed * 60.0));
        vSeed = aSeed;
      }`,
    // Square points on purpose: they read as pixels.
    fragmentShader: /* glsl */ `
      uniform vec3 uA;
      uniform vec3 uB;
      varying float vAlpha;
      varying float vSeed;
      void main() {
        gl_FragColor = vec4(mix(uA, uB, step(0.82, vSeed)), vAlpha * 0.85);
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  return new THREE.Points(geo, mat);
}

interface Orbiter {
  obj: THREE.Object3D;
  radius: number;
  speed: number;
  phase: number;
  lift: number;
  spin: THREE.Vector3;
}

export function createHubScene(canvas: HTMLCanvasElement, { lite }: { lite: boolean }): HubScene | null {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: !lite, alpha: true, powerPreference: 'high-performance' });
  } catch {
    return null;
  }
  const dpr = Math.min(window.devicePixelRatio || 1, lite ? 1.25 : 1.5);
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const seg = lite ? 24 : 48;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0.4, 10);

  scene.add(new THREE.AmbientLight(0xffffff, 0.45));
  const key = new THREE.DirectionalLight(PAPER, 1.6);
  key.position.set(-4, 5, 6);
  scene.add(key);
  const coreLight = new THREE.PointLight(BRIGHT, 18, 9, 1.6);
  scene.add(coreLight);

  // Everything tilts together with the pointer.
  const rig = new THREE.Group();
  scene.add(rig);

  // Core
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.85, 0), solid(DEEP, 0.45));
  rig.add(core);
  const shell = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.08, 1)),
    new THREE.LineBasicMaterial({ color: BRIGHT, transparent: true, opacity: 0.45 }),
  );
  rig.add(shell);
  const halo = new THREE.Mesh(new THREE.SphereGeometry(1.45, seg, seg / 2), fresnel(BRIGHT, 2.2, 1.1));
  rig.add(halo);

  // Orbital plane: tilted, carrying broadcast rings and the media objects.
  const plane = new THREE.Group();
  plane.rotation.set(-1.18, 0, 0.22);
  rig.add(plane);

  const ringGeo = new THREE.RingGeometry(0.985, 1, seg * 2);
  const rings = [0, 1, 2].map(() => {
    const m = new THREE.Mesh(ringGeo, glow(BRIGHT, 0));
    plane.add(m);
    return m;
  });
  // Faint orbit guides.
  [2.6, 3.4].forEach((r) => {
    const guide = new THREE.Mesh(new THREE.RingGeometry(r - 0.006, r + 0.006, seg * 3), glow(BRAND, 0.22));
    plane.add(guide);
  });

  const orbiters: Orbiter[] = [
    { obj: penNib(), radius: 3.4, speed: 0.16, phase: 0.2, lift: 0.25, spin: new THREE.Vector3(0.3, 0.7, 0) },
    { obj: browserWindow(), radius: 2.6, speed: 0.22, phase: 1.8, lift: -0.15, spin: new THREE.Vector3(0.25, 0.5, 0) },
    { obj: brandMark(seg), radius: 3.4, speed: 0.16, phase: 3.3, lift: 0.1, spin: new THREE.Vector3(0, 0.8, 0) },
    { obj: filmReel(seg), radius: 2.6, speed: 0.22, phase: 4.9, lift: 0.2, spin: new THREE.Vector3(0, 0, 1.1) },
  ];
  const brandGlow = (orbiters[2].obj.getObjectByName('glow') as THREE.Mesh).material as THREE.MeshBasicMaterial;
  // Service objects live in the rig (not the tilted plane) so they stay upright; their path follows the plane.
  orbiters.forEach((o) => rig.add(o.obj));
  const tmp = new THREE.Vector3();

  const pixels = pixelField(lite ? 450 : 900);
  const pixMat = pixels.material as THREE.ShaderMaterial;
  pixMat.uniforms.uPixelRatio.value = dpr;
  rig.add(pixels);

  // ── State ──
  let progress = 0;
  let progressS = 0;
  let px = 0;
  let py = 0;
  let pxS = 0;
  let pyS = 0;
  let time = 0;
  let enter = 0; // seconds since first frame: drives the float-in
  let stopTick: (() => void) | null = null;
  let wanted = false; // started by the caller (may be held back while the tab is hidden)
  let zBase = 10;

  const resize = () => {
    const parent = canvas.parentElement;
    if (!parent) return;
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Keep the outer orbit (and its objects) inside the frame on narrower stages:
    // at 35° vertical FOV, 12.7 / aspect puts about four units either side of centre.
    zBase = Math.max(10, 12.7 / (w / h));
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize);
  if (canvas.parentElement) ro.observe(canvas.parentElement);
  resize();

  const frame = (dt: number) => {
    time += dt;
    enter += dt;
    progressS = damp(progressS, progress, 4, dt);
    // Without a mouse, a slow sway stands in for the pointer.
    pxS = damp(pxS, px || Math.sin(time * 0.25) * 0.35, 3, dt);
    pyS = damp(pyS, py, 3, dt);

    rig.rotation.y = pxS * 0.4 + (progressS - 0.5) * 0.5;
    rig.rotation.x = pyS * 0.22;
    // Scroll dollies the camera in a little.
    camera.position.z = zBase - progressS * 1.4;
    camera.lookAt(0, 0, 0);

    core.rotation.x += dt * 0.25;
    core.rotation.y += dt * 0.35;
    shell.rotation.y -= dt * 0.12;
    shell.rotation.z += dt * 0.05;
    const pulse = 1 + Math.sin(time * 2.2) * 0.03;
    core.scale.setScalar(pulse);
    coreLight.intensity = 16 + Math.sin(time * 2.2) * 4;

    rings.forEach((ring, i) => {
      const t = (time * 0.32 + i / rings.length) % 1;
      ring.scale.setScalar(1.15 + t * 3.1);
      (ring.material as THREE.MeshBasicMaterial).opacity = (1 - t) * (1 - t) * 0.7;
    });

    orbiters.forEach((o, i) => {
      // Float in: each object glides from wide and small to its orbit, one after another.
      const k = easeOut(clamp((enter - 0.15 - i * 0.12) / 1.3));
      const a = o.phase + time * o.speed;
      tmp.set(Math.cos(a) * o.radius * lerp(1.9, 1, k), Math.sin(a) * o.radius * lerp(1.9, 1, k), o.lift);
      tmp.applyEuler(plane.rotation);
      o.obj.position.copy(tmp);
      o.obj.scale.setScalar(k * 0.95);
      o.obj.rotation.x = Math.sin(time * o.spin.x + i) * 0.4;
      o.obj.rotation.y += dt * o.spin.y;
      o.obj.rotation.z += dt * o.spin.z;
    });

    // The brand mark's ring glows in rhythm.
    brandGlow.opacity = 0.6 + Math.sin(time * 3) * 0.3;

    pixMat.uniforms.uTime.value = time;
    // Pixels assemble as the section scrolls up toward the middle of the screen.
    pixMat.uniforms.uProgress.value = clamp(progressS * 1.8);
    pixels.rotation.y += dt * 0.03;

    renderer.render(scene, camera);
  };

  const tick = () => {
    if (stopTick || document.hidden) return;
    stopTick = subscribe(frame);
  };
  const halt = () => {
    stopTick?.();
    stopTick = null;
  };
  const onVisibility = () => (document.hidden ? halt() : wanted && tick());
  document.addEventListener('visibilitychange', onVisibility);

  const api: HubScene = {
    setProgress(p) {
      progress = p;
    },
    setPointer(x, y) {
      px = x;
      py = y;
    },
    start() {
      wanted = true;
      tick();
    },
    stop() {
      wanted = false;
      halt();
    },
    dispose() {
      api.stop();
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose();
        const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
        mats.forEach((mat) => mat.dispose());
      });
      renderer.dispose();
    },
  };
  return api;
}
