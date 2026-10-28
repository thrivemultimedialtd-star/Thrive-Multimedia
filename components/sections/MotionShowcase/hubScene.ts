// The WebGL media hub: a glowing core that emits broadcast rings, media objects on tilted
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

// ── Media objects (each about one unit across, facing +z) ──
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

function cameraLens(seg: number) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.08, 10, seg), solid(DEEP, 0.15)));
  const inner = new THREE.Mesh(new THREE.TorusGeometry(0.29, 0.035, 8, seg), solid(BRIGHT, 0.6));
  inner.position.z = 0.04;
  g.add(inner);
  const glass = new THREE.Mesh(
    new THREE.CircleGeometry(0.3, seg),
    new THREE.MeshStandardMaterial({ color: INK, metalness: 0.9, roughness: 0.08 }),
  );
  glass.position.z = 0.02;
  g.add(glass);
  const glint = new THREE.Mesh(new THREE.RingGeometry(0.12, 0.15, 24, 1, 0.4, 1.3), glow(PAPER, 0.8));
  glint.position.z = 0.05;
  g.add(glint);
  return g;
}

function studioMic(seg: number) {
  const g = new THREE.Group();
  const head = new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 0.22, 6, seg / 2), solid(DEEP, 0.15));
  head.position.y = 0.18;
  g.add(head);
  const grille = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.16, 0.22, 6, seg / 3),
    new THREE.MeshBasicMaterial({ color: BRIGHT, wireframe: true, transparent: true, opacity: 0.35 }),
  );
  grille.position.y = 0.18;
  g.add(grille);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.32, 8), solid(BRAND));
  stem.position.y = -0.18;
  g.add(stem);
  // The pop filter: a glowing ring in front of the capsule.
  const pop = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.012, 6, seg), glow(BRIGHT, 0.85));
  pop.position.set(0, 0.18, 0.24);
  pop.name = 'pop';
  g.add(pop);
  const popFill = new THREE.Mesh(new THREE.CircleGeometry(0.26, seg), glow(BRIGHT, 0.12));
  popFill.position.set(0, 0.18, 0.24);
  popFill.name = 'popFill';
  g.add(popFill);
  return g;
}

function headphones(seg: number) {
  const g = new THREE.Group();
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.04, 8, seg, Math.PI), solid(BRIGHT, 0.4));
  g.add(band);
  const cupGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.1, seg / 2);
  for (const side of [-1, 1]) {
    const cup = new THREE.Mesh(cupGeo, solid(DEEP, 0.15));
    cup.rotation.z = Math.PI / 2;
    cup.position.set(side * 0.32, -0.04, 0);
    g.add(cup);
  }
  return g;
}

function playButton(seg: number) {
  const g = new THREE.Group();
  const tri = new THREE.Shape();
  tri.moveTo(-0.13, -0.17);
  tri.lineTo(0.2, 0);
  tri.lineTo(-0.13, 0.17);
  tri.closePath();
  const play = new THREE.Mesh(
    new THREE.ExtrudeGeometry(tri, { depth: 0.08, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 2 }),
    solid(BRIGHT, 0.7),
  );
  play.position.z = -0.04;
  g.add(play);
  g.add(new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.03, 8, seg), solid(BRAND, 0.3)));
  return g;
}

function equaliser() {
  const g = new THREE.Group();
  const geo = new THREE.BoxGeometry(0.08, 1, 0.08);
  geo.translate(0, 0.5, 0); // grow from the base
  for (let i = 0; i < 5; i++) {
    const bar = new THREE.Mesh(geo, solid(i % 2 ? BRAND : BRIGHT, 0.5));
    bar.position.set((i - 2) * 0.13, -0.3, 0);
    bar.scale.y = 0.4;
    bar.name = 'bar';
    g.add(bar);
  }
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
    { obj: filmReel(seg), radius: 3.4, speed: 0.16, phase: 0.2, lift: 0.25, spin: new THREE.Vector3(0, 0, 1.1) },
    { obj: cameraLens(seg), radius: 2.6, speed: 0.22, phase: 1.5, lift: -0.15, spin: new THREE.Vector3(0.3, 0.6, 0) },
    { obj: studioMic(seg), radius: 3.4, speed: 0.16, phase: 2.3, lift: 0.1, spin: new THREE.Vector3(0, 0.7, 0) },
    { obj: headphones(seg), radius: 2.6, speed: 0.22, phase: 3.6, lift: 0.2, spin: new THREE.Vector3(0, 0.8, 0.1) },
    { obj: playButton(seg), radius: 3.4, speed: 0.16, phase: 4.4, lift: -0.2, spin: new THREE.Vector3(0, 0.9, 0) },
    { obj: equaliser(), radius: 2.6, speed: 0.22, phase: 5.4, lift: 0, spin: new THREE.Vector3(0, 0.5, 0) },
  ];
  // Media objects live in the rig (not the tilted plane) so they stay upright; their path follows the plane.
  orbiters.forEach((o) => rig.add(o.obj));
  const tmp = new THREE.Vector3();

  const pixels = pixelField(lite ? 700 : 1800);
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
    // Keep the whole system in frame on narrow screens.
    zBase = w / h < 1 ? 10 / Math.max(w / h, 0.62) : 10;
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

    // Rhythm for the equaliser and the mic's pop filter.
    const eq = orbiters[5].obj.children;
    eq.forEach((bar, j) => {
      bar.scale.y = 0.25 + Math.abs(Math.sin(time * (3 + j * 0.7) + j)) * 0.55;
    });
    const mic = orbiters[2].obj;
    const popGlow = 0.6 + Math.sin(time * 3) * 0.3;
    ((mic.getObjectByName('pop') as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = popGlow;
    ((mic.getObjectByName('popFill') as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = popGlow * 0.15;

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
