import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Person, Sign, canvasTex } from './parts';

function Shell({ cx, w, d, floor, wall, tint }) {
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[cx, 0.01, 0]}><planeGeometry args={[w, d]} /><meshStandardMaterial map={floor} roughness={0.32} metalness={0.05} envMapIntensity={0.5} /></mesh>
      <Box p={[cx, 1.7, -d / 2]} s={[w, 3.4, 0.2]} c={wall} /><Box p={[cx, 1.7, d / 2]} s={[w, 3.4, 0.2]} c={wall} />
      <Box p={[cx - w / 2, 1.7, 0]} s={[0.2, 3.4, d]} c={wall} /><Box p={[cx + w / 2, 1.7, 0]} s={[0.2, 3.4, d]} c={wall} />
      <Box p={[cx, 3.45, 0]} s={[w, 0.1, d]} c="#f6f6f1" />
      {[-3, 3].map((x) => <mesh key={x} position={[cx + x, 3.38, 0]}><boxGeometry args={[2.6, 0.04, 1]} /><meshStandardMaterial color="#fffbe9" emissive="#fffbe9" emissiveIntensity={1.4} /></mesh>)}
      {[-3, 3].map((x) => <pointLight key={'l' + x} position={[cx + x, 3, 0]} intensity={9} distance={14} color={tint} />)}
      <Box p={[cx, 1.5, d / 2 - 0.09]} s={[1.5, 3, 0.05]} c="#5b3a22" />
      <Sign lines={['EXIT']} w={0.9} h={0.3} p={[cx, 3.1, d / 2 - 0.1]} ry={Math.PI} bg="#0b5228" fg="#ffffff" />
    </group>
  );
}
const tiles = (a, b, n) => canvasTex(128, 128, (g, W, H) => { g.fillStyle = a; g.fillRect(0, 0, W, H); g.fillStyle = b; g.fillRect(0, 0, W / 2, H / 2); g.fillRect(W / 2, H / 2, W / 2, H / 2); }, [n, n]);

export function Classroom() {
  const floor = useMemo(() => tiles('#d9d2c1', '#cbc3b0', 6), []), lect = useRef();
  useFrame(({ clock }) => { if (lect.current) { lect.current.position.x = 300 + Math.sin(clock.elapsedTime / 1.5) * 0.8; lect.current.rotation.y = Math.sin(clock.elapsedTime / 0.9) * 0.3; } });
  const desks = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
    const x = 296 + c * 2.6, z = -1 + r * 1.8, seat = r === 1 && c === 1;
    if (!seat) desks.push(<Box key={'d' + r + c} p={[x, 0.38, z - 0.5]} s={[1.2, 0.76, 0.5]} c="#a9743f" r={0.55} />);
    desks.push(<Box key={'c' + r + c} p={[x, 0.24, z + 0.1]} s={[0.5, 0.48, 0.5]} c="#2b5d8a" r={0.5} />);
    if (!seat && (r + c) % 2 === 0) desks.push(<Person key={'p' + r + c} p={[x, 0, z + 0.1]} sit ry={Math.PI} c={['#d63b2f', '#2f6fd6', '#f2b705', '#c33a9a'][c]} skin={c % 2 ? '#8a5a38' : '#5a3a24'} />);
  }
  return (
    <group>
      <Shell cx={300} w={12} d={10} floor={floor} wall="#efe6d3" tint="#fff6e0" />
      <Box p={[300, 1.8, -4.85]} s={[5.2, 1.7, 0.08]} c="#f5f5f5" r={0.3} m={0.1} />
      <Sign lines={['GST 101', 'USE OF ENGLISH']} w={4.8} h={1.5} p={[300, 1.8, -4.79]} bg="#f7f7f2" fg="#0b5228" />
      <Box p={[300, 0.12, -3.6]} s={[6, 0.24, 1.6]} c="#8a6a45" />
      <Box p={[303.5, 0.55, -3.9]} s={[1.3, 0.9, 0.6]} c="#a9743f" />
      {[2.2, 3.4].map((y) => <mesh key={y} position={[305.89, y * 0.6 + 0.9, -1]}><boxGeometry args={[0.05, 1.2, 1.8]} /><meshStandardMaterial color="#5aa0d8" roughness={0.1} metalness={0.4} envMapIntensity={1.2} /></mesh>).slice(0, 1)}
      <mesh position={[305.88, 1.9, 2]}><boxGeometry args={[0.05, 1.2, 1.8]} /><meshStandardMaterial color="#5aa0d8" roughness={0.1} metalness={0.4} envMapIntensity={1.2} /></mesh>
      {desks}
      <Person gref={lect} p={[300, 0, -3.6]} c="#1f2b3d" skin="#6b4423" hair="#9a9a9a" />
    </group>
  );
}

export function Cafeteria() {
  const floor = useMemo(() => tiles('#efe2c8', '#e3d2b2', 7), []);
  const tables = [[-297, -0.4], [-303, -0.4], [-297, 2.4], [-303, 2.4]];
  return (
    <group>
      <Shell cx={-300} w={14} d={10} floor={floor} wall="#f7ecd7" tint="#ffe9c2" />
      <Box p={[-300, 0.5, -3.2]} s={[10, 1, 0.8]} c="#7a4a24" r={0.4} /><Box p={[-300, 1.02, -3.2]} s={[10.2, 0.06, 0.95]} c="#2b2b2b" r={0.25} m={0.2} />
      <Sign lines={['MENU', 'Jollof · Afang · Edikang Ikong', 'Plantain · Suya · Zobo']} w={6} h={2.2} p={[-300, 2.3, -4.88]} bg="#f26a1b" fg="#ffffff" />
      {[-302.5, -300, -297.5].map((x, i) => <mesh key={x} position={[x, 1.2, -3.2]}><cylinderGeometry args={[0.22, 0.22, 0.28, 16]} /><meshStandardMaterial color={['#b5441c', '#8a5a1a', '#e5c14a'][i]} roughness={0.7} /></mesh>)}
      <Person p={[-300, 0, -4.1]} c="#ffffff" skin="#5a3a24" hair="#1a1410" />
      {tables.map(([x, z], i) => (
        <group key={i}>
          <Box p={[x, 0.72, z]} s={[1.3, 0.06, 1.3]} c="#b98a58" r={0.4} /><Box p={[x, 0.36, z]} s={[0.12, 0.72, 0.12]} c="#555" m={0.6} />
          <Box p={[x - 0.95, 0.24, z]} s={[0.5, 0.48, 0.5]} c="#0b5228" /><Box p={[x + 0.95, 0.24, z]} s={[0.5, 0.48, 0.5]} c="#0b5228" />
          {i % 2 === 0 && <Person p={[x + 0.95, 0, z]} sit ry={-Math.PI / 2} c={['#2f6fd6', '#d63b2f'][i / 2]} skin="#6b4423" />}
          {i % 2 === 0 && <mesh position={[x + 0.3, 0.77, z]}><cylinderGeometry args={[0.22, 0.2, 0.04, 16]} /><meshStandardMaterial color="#ffffff" /></mesh>}
        </group>
      ))}
    </group>
  );
}
