import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createChair, CHAIR_HEIGHT } from './chair.js';
import { drawWood, woods } from './wood.js';

// 3D-Bühne der Schreinerei: ein Stuhl, der beim Scrollen von Kapitel zu Kapitel wandert, sich im Kapitel
// „Zerlegt“ in seine 14 Teile auflöst und je Holzart (Colorway eiche · nuss · esche) die Maserung wechselt.
//
// Kapitel im HTML tragen [data-chair="hero|zerlegt|holz|kontakt"]. Haltung je Kapitel steht in POSES,
// e = Explosionsgrad (0 zusammen, 1 zerlegt). Abschnitte ohne data-chair haben eine deckende Fläche.

// x: Anteil der halben sichtbaren Breite (0,5 = Mitte der rechten Hälfte)
const POSES = {
  desktop: {
    hero: { x: 0.5, y: -0.05, s: 1.2, rx: 0.2, ry: -0.65, e: 0 },
    zerlegt: { x: -0.5, y: -0.03, s: 0.88, rx: 0.34, ry: 0.6, e: 1 },
    holz: { x: 0.5, y: -0.05, s: 1.2, rx: 0.16, ry: 5.7, e: 0 },
    kontakt: { x: 0.5, y: -0.03, s: 1.05, rx: 0.12, ry: 6.9, e: 0 },
  },
  mobile: {
    hero: { x: 0, y: 0.45, s: 0.66, rx: 0.2, ry: -0.65, e: 0 },
    zerlegt: { x: 0, y: 0.45, s: 0.52, rx: 0.34, ry: 0.6, e: 1 },
    holz: { x: 0, y: 0.45, s: 0.66, rx: 0.16, ry: 5.7, e: 0 },
    kontakt: { x: 0, y: 0.45, s: 0.62, rx: 0.12, ry: 6.9, e: 0 },
  },
};

// Beschriftungen an der zerlegten Ansicht: Teil + Punkt relativ zum Teil
const TAGS = [
  ['sitz', [0.12, 0.012, 0.18], '1 · Sitz'],
  ['bein-hr', [0, 0.28, 0], '2 · Hinterbein'],
  ['zarge-v', [0.19, 0, 0], 'Zapfen'],
  ['lehne', [-0.1, 0.04, 0], '6 · Lehne'],
];

export async function initChairScene(stage, { reduced }) {
  const probe = document.createElement('canvas');
  if (!(probe.getContext('webgl2') || probe.getContext('webgl'))) {
    document.documentElement.classList.add('no-webgl');
    return;
  }

  // ---------- Renderer, Szene, Licht
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  // Neutral statt ACES: Holzfarben bleiben satt und kippen nicht ins Gelbliche
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 0.95;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  stage.append(renderer.domElement);

  const scene = new THREE.Scene();
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.9;

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  camera.position.set(0, 0.35, 3.2);
  camera.lookAt(0, 0, 0);

  // Streiflicht von links oben: Kanten und Maserung bekommen Tiefe
  const key = new THREE.DirectionalLight(0xfff4e6, 1.5);
  key.position.set(-3, 4, 2.5);
  scene.add(key);

  // ---------- Holz: eine Textur je Holzart, gemalt auf Canvas
  const textures = Object.fromEntries(
    Object.keys(woods).map((k) => {
      const t = new THREE.CanvasTexture(drawWood(document.createElement('canvas'), k));
      t.colorSpace = THREE.SRGBColorSpace;
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.anisotropy = renderer.capabilities.getMaxAnisotropy();
      return [k, t];
    }),
  );
  const startWood = woods[document.documentElement.dataset.colorway] ? document.documentElement.dataset.colorway : 'eiche';
  let current = startWood;
  const material = new THREE.MeshStandardMaterial({ map: textures[current], roughness: 0.58, metalness: 0, envMapIntensity: 0.85 });

  // ---------- Stuhl: rig (Kapitel-Haltung) > tiltGroup (Neigung, Maus) > spinGroup (Drehung) > Stuhl
  const chair = createChair(material);
  chair.group.position.y = -CHAIR_HEIGHT / 2;
  const rig = new THREE.Group();
  const tiltGroup = new THREE.Group();
  const spinGroup = new THREE.Group();
  spinGroup.add(chair.group);
  tiltGroup.add(spinGroup);
  rig.add(tiltGroup);
  scene.add(rig);

  // Weicher Kontaktschatten als Radialverlauf (ruhig und billig)
  const shadowCanvas = Object.assign(document.createElement('canvas'), { width: 128, height: 128 });
  const sctx = shadowCanvas.getContext('2d');
  const grad = sctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(0,0,0,0.26)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  sctx.fillStyle = grad;
  sctx.fillRect(0, 0, 128, 128);
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(0.95, 0.75),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(shadowCanvas), transparent: true, depthWrite: false }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -CHAIR_HEIGHT / 2 - 0.004;
  tiltGroup.add(shadow);

  // ---------- Beschriftungen (nur Desktop, rein dekorativ: die Stückliste steht im HTML)
  const tagLayer = Object.assign(document.createElement('div'), { className: 'chair-tags' });
  stage.append(tagLayer);
  const tags = TAGS.map(([part, offset, text]) => {
    const el = Object.assign(document.createElement('span'), { className: 'chair-tag', textContent: text });
    tagLayer.append(el);
    return { el, part: chair.byName[part], offset: new THREE.Vector3(...offset) };
  });
  const v = new THREE.Vector3();

  // ---------- Größe
  const resize = () => {
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();
  new ResizeObserver(resize).observe(stage);

  // ---------- Haltung je Kapitel, an den Scrollweg gekoppelt
  const pose = { ...POSES.desktop.hero };
  const spin = { y: 0 };
  const halfWidth = () => Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z * camera.aspect;
  let desktop = true;

  const mm = gsap.matchMedia();
  mm.add({ desktop: '(min-width: 900px)', mobile: '(max-width: 899px)' }, (ctx) => {
    desktop = ctx.conditions.desktop;
    const set = desktop ? POSES.desktop : POSES.mobile;
    const sections = gsap.utils.toArray('[data-chair]');
    Object.assign(pose, set[sections[0]?.dataset.chair || 'hero']);
    if (reduced) {
      // Ohne Bewegung: Haltung springt pro Kapitel um – im Kapitel „Zerlegt“ steht der Stuhl zerlegt still
      sections.forEach((section) =>
        ScrollTrigger.create({
          trigger: section,
          start: 'top 50%',
          end: 'bottom 50%',
          onToggle: (self) => self.isActive && Object.assign(pose, set[section.dataset.chair]),
        }),
      );
      return;
    }
    sections.slice(1).forEach((section, i) => {
      gsap.fromTo(pose, { ...set[sections[i].dataset.chair] }, {
        ...set[section.dataset.chair],
        ease: 'power1.inOut',
        immediateRender: false,
        // Haltung ist erreicht, wenn der Abschnitt oben anliegt – dort rastet die Seite ein (data-snap)
        scrollTrigger: { trigger: section, start: 'top bottom', end: 'top top', scrub: 0.6 },
      });
    });
  });

  // Ankommen: Stuhl setzt sich beim Laden aus seinen Teilen zusammen
  const intro = { e: reduced ? 0 : 1, lift: reduced ? 0 : 0.25 };
  if (!reduced) {
    gsap.to(intro, { e: 0, duration: 2.2, ease: 'expo.inOut', delay: 0.2 });
    gsap.to(intro, { lift: 0, duration: 2.4, ease: 'expo.out', delay: 0.2 });
    gsap.from(spin, { y: -1.2, duration: 2.6, ease: 'expo.out', delay: 0.2 });
  }

  // ---------- Maus: Stuhl dreht sich leicht zum Zeiger
  const tilt = { x: 0, y: 0 };
  if (!reduced && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const tx = gsap.quickTo(tilt, 'x', { duration: 1.2, ease: 'power3.out' });
    const ty = gsap.quickTo(tilt, 'y', { duration: 1.2, ease: 'power3.out' });
    window.addEventListener('pointermove', (e) => {
      tx((e.clientY / innerHeight - 0.5) * 0.12);
      ty((e.clientX / innerWidth - 0.5) * 0.4);
    });
  }

  // ---------- Holzart über Colorway: halbe Drehung, in der Mitte wechselt die Maserung
  document.addEventListener('colorway', (e) => {
    const next = e.detail.name;
    if (!woods[next] || next === current) return;
    current = next;
    if (reduced) {
      material.map = textures[next];
      return;
    }
    gsap.killTweensOf(spin);
    const base = Math.round(spin.y / Math.PI) * Math.PI;
    gsap.to(spin, {
      y: base + Math.PI,
      duration: 1.2,
      ease: 'signature',
      onUpdate() {
        if (this.progress() > 0.35 && material.map !== textures[next]) material.map = textures[next];
      },
    });
  });

  // ---------- Takt
  const chapters = Array.from(document.querySelectorAll('[data-chair]'));
  const lastChapter = chapters.at(-1);
  const worldPerPx = () => (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z) / innerHeight;
  const clock = new THREE.Clock();

  gsap.ticker.add(() => {
    if (document.hidden) return;
    // Liegt kein Stuhl-Kapitel im Bild (deckende Abschnitte), nicht rendern
    if (!chapters.some((c) => {
      const r = c.getBoundingClientRect();
      return r.top < innerHeight && r.bottom > 0;
    })) return;

    const t = clock.getElapsedTime();
    const e = Math.max(pose.e, intro.e);
    chair.setExplode(e);
    rig.position.set(pose.x * halfWidth(), pose.y + intro.lift + (reduced ? 0 : Math.sin(t * 0.8) * 0.012), 0);
    // Letztes Kapitel: der Stuhl steht im Abschnitt und scrollt mit ihm herein und wieder hinaus
    const lastTop = lastChapter ? lastChapter.getBoundingClientRect().top : innerHeight;
    if (lastTop < innerHeight) rig.position.y -= lastTop * worldPerPx();
    rig.scale.setScalar(pose.s);
    tiltGroup.rotation.set(pose.rx + tilt.x, 0, 0);
    spinGroup.rotation.y = pose.ry + spin.y + tilt.y;
    shadow.material.opacity = 1 - Math.min(1, e * 0.6 + intro.lift * 3);
    renderer.render(scene, camera);

    // Beschriftungen folgen den Teilen, sichtbar erst weit zerlegt
    const show = desktop ? gsap.utils.clamp(0, 1, (pose.e - 0.7) / 0.3) : 0;
    tagLayer.style.opacity = show;
    if (show > 0) {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      tags.forEach(({ el, part, offset }) => {
        part.localToWorld(v.copy(offset)).project(camera);
        el.style.transform = `translate(${((v.x + 1) / 2) * w}px, ${((1 - v.y) / 2) * h}px)`;
      });
    }
  });

  ScrollTrigger.refresh();
}
