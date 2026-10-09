import { useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

// Studiolicht wie auf der Website: Raum-Umgebung für Spiegelungen + ein Streiflicht.
// Die Umgebung wird sofort beim ersten Rendern gesetzt (nicht in useEffect), sonst fehlt sie im ersten Standbild.
export const Studio3D: React.FC = () => {
  const { gl, scene } = useThree();
  useMemo(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
  }, [gl, scene]);
  return <directionalLight position={[3, 4, 2]} intensity={1.6} />;
};
