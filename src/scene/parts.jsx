import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function Box({ p, s, c = '#cccccc', r = 0.8, m = 0, e = 0.5 }) {
  return <mesh position={p}><boxGeometry args={s} /><meshStandardMaterial color={c} roughness={r} metalness={m} envMapIntensity={e} /></mesh>;
}

export function canvasTex(w, h, draw, repeat) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
  return t;
}

export function Sign({ lines, w, h, p, ry = 0, bg, fg, round }) {
  const map = useMemo(() => canvasTex(512, Math.round((512 * h) / w), (g, W, H) => {
    g.fillStyle = bg; g.fillRect(0, 0, W, H); g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle';
    lines.forEach((t, i) => { g.font = `700 ${H * (lines.length > 1 ? 0.15 : 0.4)}px Fredoka, sans-serif`; g.fillText(t, W / 2, (H * (i + 1)) / (lines.length + 1)); });
  }), []); // eslint-disable-line
  return <mesh position={p} rotation-y={ry}>{round ? <circleGeometry args={[w / 2, 48]} /> : <planeGeometry args={[w, h]} />}<meshBasicMaterial map={map} /></mesh>;
}

const Mt = ({ c, r = 0.85 }) => <meshStandardMaterial color={c} roughness={r} />;
export function Person({ p = [0, 0, 0], c = '#3366cc', skin = '#7a4b2a', hair = '#1a1410', sit = false, ry = 0, gref }) {
  const y = sit ? -0.3 : 0;
  return (
    <group ref={gref} position={p} rotation-y={ry}>
      {sit ? <mesh position={[0, 0.5, 0.15]}><boxGeometry args={[0.34, 0.14, 0.42]} /><Mt c="#2a2f45" /></mesh>
        : <>
          <mesh position={[-0.09, 0.4, 0]}><boxGeometry args={[0.14, 0.8, 0.16]} /><Mt c="#2a2f45" /></mesh>
          <mesh position={[0.09, 0.4, 0]}><boxGeometry args={[0.14, 0.8, 0.16]} /><Mt c="#2a2f45" /></mesh>
        </>}
      <mesh position={[0, y + 1.1, 0]}><boxGeometry args={[0.4, 0.6, 0.22]} /><Mt c={c} /></mesh>
      <mesh position={[-0.27, y + 1.08, 0]}><boxGeometry args={[0.11, 0.55, 0.14]} /><Mt c={c} /></mesh>
      <mesh position={[0.27, y + 1.08, 0]}><boxGeometry args={[0.11, 0.55, 0.14]} /><Mt c={c} /></mesh>
      <mesh position={[0, y + 1.55, 0]}><sphereGeometry args={[0.14, 16, 12]} /><Mt c={skin} r={0.6} /></mesh>
      <mesh position={[0, y + 1.6, -0.015]}><sphereGeometry args={[0.15, 16, 12, 0, 6.3, 0, 1.25]} /><Mt c={hair} /></mesh>
    </group>
  );
}

export function Walker({ a, b, speed = 1.1, c, offset = 0, skin }) {
  const g = useRef(); const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
  useFrame(({ clock }) => {
    const t = (clock.elapsedTime * speed + offset) % (2 * L), fwd = t < L, k = fwd ? t / L : 2 - t / L;
    g.current.position.set(a[0] + (b[0] - a[0]) * k, Math.abs(Math.sin(clock.elapsedTime * speed * 5 + offset)) * 0.04, a[1] + (b[1] - a[1]) * k);
    const s = fwd ? 1 : -1; g.current.rotation.y = Math.atan2(s * (b[0] - a[0]), s * (b[1] - a[1]));
  });
  return <Person gref={g} p={[a[0], 0, a[1]]} c={c} skin={skin} />;
}
