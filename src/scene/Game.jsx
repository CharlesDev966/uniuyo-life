import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import * as game from '../game/life';
import { LEVELS, createComposer, initialQuality, markShadows, saveQuality, toast as gfxToast } from '../three/post';
import { setState } from '../store';
import Campus from './Campus';
import { Classroom, Cafeteria } from './Interiors';

export default function Game() {
  const { gl, scene, camera } = useThree();
  const size = useThree((s) => s.size);
  const statics = useRef();
  const quality = useRef(initialQuality());

  useMemo(() => {
    const sky = document.createElement('canvas'); sky.width = 4; sky.height = 256;
    const g = sky.getContext('2d'), grd = g.createLinearGradient(0, 0, 0, 256); grd.addColorStop(0, '#5fa8e6'); grd.addColorStop(0.6, '#bfe0f5'); grd.addColorStop(1, '#e6f3f8'); g.fillStyle = grd; g.fillRect(0, 0, 4, 256);
    const st = new THREE.CanvasTexture(sky); st.colorSpace = THREE.SRGBColorSpace;
    scene.background = st; scene.fog = new THREE.Fog('#cfe6f3', 40, 120);
    scene.environment = new THREE.PMREMGenerator(gl).fromScene(new RoomEnvironment(), 0.04).texture;
    camera.rotation.order = 'YXZ'; camera.near = 0.05; camera.far = 160; camera.updateProjectionMatrix();
    gl.shadowMap.enabled = true; gl.shadowMap.type = THREE.PCFSoftShadowMap; gl.shadowMap.autoUpdate = false;
  }, [gl, scene, camera]);

  const applyQuality = (q, w, h) => {
    if (game.world.composer) { game.world.composer.dispose?.(); game.world.composer = null; }
    if (q === 'low') gl.toneMapping = THREE.NoToneMapping;
    else { gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.0; game.world.composer = createComposer(gl, scene, camera, w, h); game.world.composer.bloom.enabled = q === 'high'; }
  };

  useLayoutEffect(() => {
    game.world.camera = camera;
    const detach = game.attachInput(gl.domElement);
    setState({ phase: 'intro' });
    applyQuality(quality.current, size.width, size.height);
    const onKey = (e) => {
      if (e.code !== 'KeyG' || e.repeat) return;
      const next = LEVELS[(LEVELS.indexOf(quality.current) + 1) % LEVELS.length]; quality.current = next; saveQuality(next);
      applyQuality(next, size.width, size.height); gfxToast(`Graphics: ${next[0].toUpperCase() + next.slice(1)} (press G to change)`);
    };
    addEventListener('keydown', onKey);
    return () => { detach(); removeEventListener('keydown', onKey); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl, camera]);

  useEffect(() => { const c = game.world.composer; if (c) { c.setPixelRatio(gl.getPixelRatio()); c.setSize(size.width, size.height); } }, [gl, size]);

  // The campus is static, so the shadow map is baked once the scene has built (and again as late meshes appear).
  useEffect(() => {
    const bake = () => { if (statics.current) markShadows(statics.current); gl.shadowMap.needsUpdate = true; };
    const ids = [150, 700, 2000, 5000].map((ms) => setTimeout(bake, ms));
    return () => ids.forEach(clearTimeout);
  }, [gl]);

  useFrame((_, dt) => {
    game.frame(dt);
    gl.autoClear = false;
    if (game.world.composer) game.world.composer.render(dt); else { gl.clear(); gl.render(scene, camera); }
  }, 1);

  return (
    <>
      <hemisphereLight args={['#ffffff', '#8aa57a', 1.15]} />
      <ambientLight intensity={0.2} />
      <directionalLight
        position={[25, 40, 30]} intensity={1.5} castShadow shadow-mapSize={[4096, 4096]} shadow-bias={-0.0003} shadow-normalBias={0.04}
        shadow-camera-left={-48} shadow-camera-right={48} shadow-camera-top={48} shadow-camera-bottom={-48} shadow-camera-near={5} shadow-camera-far={120}
      />
      <group ref={statics}><Campus /></group>
      <Classroom /><Cafeteria />
    </>
  );
}
