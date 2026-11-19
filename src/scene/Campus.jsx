import { useMemo } from 'react';
import * as THREE from 'three';
import { Box, Sign, Walker, canvasTex } from './parts';

const GLASS = '#2b4a63';
function Windows({ pts, face, y, w = 1.4, h = 1.6 }) {
  return pts.map((q, i) => (
    <mesh key={i} position={face === 'z' ? [q, y, -22.94] : [face === 'x-' ? -18.94 : 18.94, y, q]} rotation-y={face === 'z' ? 0 : face === 'x-' ? Math.PI / 2 : -Math.PI / 2}>
      <planeGeometry args={[w, h]} /><meshStandardMaterial color={GLASS} roughness={0.15} metalness={0.5} envMapIntensity={1.1} />
    </mesh>
  ));
}

function Trees() {
  const list = useMemo(() => {
    const out = []; let s = 7; const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    while (out.length < 46) {
      const x = (rnd() - 0.5) * 120, z = (rnd() - 0.5) * 120 - 5;
      if (Math.abs(x) < 7 && z > -20) continue; if (Math.abs(z + 17) < 5) continue;
      if (x > -41 && x < 41 && z > -41 && z < 4) continue; if (Math.abs(z + 5) < 3.5 && Math.abs(x) < 20) continue;
      out.push([x, z, 0.8 + rnd() * 0.7]);
    }
    return out;
  }, []);
  return list.map(([x, z, k], i) => (
    <group key={i} position={[x, 0, z]} scale={k}>
      <mesh position={[0, 1.4, 0]}><cylinderGeometry args={[0.2, 0.32, 2.8, 8]} /><meshStandardMaterial color="#6b4423" roughness={0.95} /></mesh>
      <mesh position={[0, 4, 0]}><icosahedronGeometry args={[1.9, 1]} /><meshStandardMaterial color={i % 3 ? '#2d7a3a' : '#3b8c44'} roughness={0.9} flatShading /></mesh>
    </group>
  ));
}

function Lamp({ x, z }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 2.2, 0]}><cylinderGeometry args={[0.06, 0.08, 4.4, 8]} /><meshStandardMaterial color="#3a3f44" metalness={0.6} roughness={0.4} /></mesh>
      <mesh position={[0, 4.5, 0]}><sphereGeometry args={[0.25, 12, 10]} /><meshStandardMaterial color="#fff2c8" emissive="#fff2c8" emissiveIntensity={1.6} /></mesh>
    </group>
  );
}

export default function Campus() {
  const grass = useMemo(() => canvasTex(256, 256, (g, W, H) => {
    g.fillStyle = '#5c9a47'; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 1800; i++) { g.fillStyle = `hsla(${95 + Math.random() * 25},${40 + Math.random() * 20}%,${28 + Math.random() * 18}%,.45)`; g.fillRect(Math.random() * W, Math.random() * H, 2, 3); }
  }, [60, 60]), []);
  const asphalt = useMemo(() => canvasTex(128, 128, (g, W, H) => {
    g.fillStyle = '#4a4f54'; g.fillRect(0, 0, W, H); for (let i = 0; i < 700; i++) { g.fillStyle = `rgba(${Math.random() < .5 ? 255 : 0},${Math.random() < .5 ? 255 : 0},0,.04)`; g.fillRect(Math.random() * W, Math.random() * H, 2, 2); }
  }, [3, 20]), []);
  const flat = (x, z, w, d, c, y = 0.02, map) => (
    <mesh rotation-x={-Math.PI / 2} position={[x, y, z]} receiveShadow><planeGeometry args={[w, d]} />{map ? <meshStandardMaterial map={map} roughness={0.85} /> : <meshStandardMaterial color={c} roughness={0.9} />}</mesh>
  );
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} receiveShadow><planeGeometry args={[300, 300]} /><meshStandardMaterial map={grass} roughness={1} /></mesh>
      {flat(0, 26, 8, 88, '#4a4f54', 0.02, asphalt)}
      {flat(0, -17, 120, 6, '#4a4f54', 0.021)}
      {flat(0, 26, 0.18, 88, '#f2f2f2', 0.03)}
      {flat(0, -20, 30, 5, '#cfc3ae', 0.025)}
      {flat(-11.5, -5, 15, 2.6, '#cfc3ae', 0.025)}{flat(11.5, -5, 15, 2.6, '#cfc3ae', 0.025)}

      {/* Administration block: brick with green roof and the university seal */}
      <Box p={[0, 5, -30]} s={[26, 10, 14]} c="#b5573c" r={0.9} />
      <Box p={[0, 10.8, -30]} s={[29, 1.6, 16]} c="#2f6b4f" r={0.6} m={0.2} />
      <Box p={[0, 12.5, -30]} s={[18, 2, 10]} c="#2f6b4f" r={0.6} m={0.2} />
      <Box p={[0, 5.5, -22.9]} s={[11, 9, 0.2]} c="#efe3cf" />
      <Sign lines={['UNIVERSITY OF UYO', 'ADMINISTRATION']} w={10} h={3.4} p={[0, 6.4, -22.78]} bg="#efe3cf" fg="#7a2d1a" />
      <Windows pts={[-11, -8.5, 8.5, 11]} face="z" y={3.2} /><Windows pts={[-11, -8.5, 8.5, 11]} face="z" y={7.6} />
      <Box p={[0, 1.4, -22.8]} s={[3, 2.8, 0.3]} c="#2b1d14" />
      {[-5, -2.5, 2.5, 5].map((x) => <Box key={x} p={[x, 2.6, -21.2]} s={[0.5, 5.2, 0.5]} c="#efe3cf" />)}
      <Box p={[0, 5.4, -21.2]} s={[13, 0.5, 3]} c="#efe3cf" />

      {/* Lecture Theatre 1 */}
      <Box p={[-28, 3, -5]} s={[18, 6, 12]} c="#e6d9c0" r={0.9} /><Box p={[-28, 6.4, -5]} s={[19, 0.8, 13]} c="#2f6b4f" r={0.6} m={0.2} />
      {[0, 1, 2, 3].map((i) => <Box key={i} p={[-18.9, 3, -9.5 + i * 3.4 + (i > 1 ? 1 : 0)]} s={[0.25, 6, 0.9]} c="#8a3b2e" />)}
      <Box p={[-18.95, 1.5, -5]} s={[0.3, 3, 2.2]} c="#2b1d14" />
      <Sign lines={['LECTURE THEATRE 1']} w={9} h={1.5} p={[-18.8, 4.8, -5]} ry={-Math.PI / 2} bg="#2f6b4f" fg="#ffffff" />
      <Windows pts={[-9.4, -7.4, -2.6, -0.6]} face="x-" y={3.4} />

      {/* Student cafeteria */}
      <Box p={[28, 2.5, -5]} s={[18, 5, 12]} c="#f4d9b0" r={0.9} /><Box p={[28, 5.4, -5]} s={[19, 0.8, 13]} c="#f26a1b" r={0.5} />
      <Box p={[18.95, 1.5, -5]} s={[0.3, 3, 2.2]} c="#2b1d14" />
      <Box p={[17.6, 3.4, -5]} s={[3.4, 0.3, 5.4]} c="#f26a1b" />
      <Sign lines={['STUDENT CAFETERIA']} w={9} h={1.5} p={[18.8, 4.2, -5]} ry={Math.PI / 2} bg="#f26a1b" fg="#ffffff" />
      <Windows pts={[-9.4, -7.4, -2.6, -0.6]} face="x+" y={3} />
      {[-9, -1].map((z) => (
        <group key={z} position={[15.5, 0, z]}>
          <mesh position={[0, 0.75, 0]}><cylinderGeometry args={[0.7, 0.7, 0.06, 20]} /><meshStandardMaterial color="#f7f1e4" /></mesh>
          <mesh position={[0, 0.38, 0]}><cylinderGeometry args={[0.06, 0.06, 0.75, 8]} /><meshStandardMaterial color="#555" /></mesh>
          <mesh position={[0, 2.2, 0]}><coneGeometry args={[1.5, 0.7, 12]} /><meshStandardMaterial color="#0b5228" /></mesh>
          <mesh position={[0, 1.2, 0]}><cylinderGeometry args={[0.03, 0.03, 2, 6]} /><meshStandardMaterial color="#777" /></mesh>
        </group>
      ))}

      {/* Main gate sign */}
      <Box p={[-7, 1.5, 46]} s={[0.4, 3, 0.4]} c="#8a8f94" m={0.5} r={0.4} />
      <mesh position={[-7, 4.3, 46]}><torusGeometry args={[2.35, 0.14, 12, 48]} /><meshStandardMaterial color="#1c1c1c" roughness={0.5} /></mesh>
      <Sign lines={['UNIVERSITY OF UYO', 'NIGERIA', 'Unity, Learning and Service']} w={4.6} h={4.6} p={[-7, 4.3, 45.98]} bg="#ffffff" fg="#111111" round />

      {[22, 38, 54].flatMap((z) => [[-5.5, z], [5.5, z]]).map(([x, z]) => <Lamp key={x + '_' + z} x={x} z={z} />)}
      {[-6, 6].map((x) => <Lamp key={x} x={x} z={-14} />)}
      <Trees />
      <Walker a={[-3, 32]} b={[-3, -14]} c="#d63b2f" speed={1.0} />
      <Walker a={[3, -14]} b={[3, 36]} c="#2f6fd6" speed={1.2} offset={4} />
      <Walker a={[-4, -5]} b={[-17, -5]} c="#f2b705" speed={0.9} offset={2} />
      <Walker a={[17, -5]} b={[4, -5]} c="#c33a9a" speed={1.0} offset={6} />
      <Walker a={[-30, -17]} b={[30, -17]} c="#2fa67a" speed={1.3} offset={9} />
    </group>
  );
}
