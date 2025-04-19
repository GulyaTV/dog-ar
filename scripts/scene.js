// scripts/scene.js
export function initScene() {
  const canvas = document.getElementById('three-canvas');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(70, window.innerWidth/window.innerHeight, 0.01, 1000);
  camera.position.set(0,1.6,0);
  
  const renderer = new THREE.WebGLRenderer({ canvas, antialias:true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;      // включаем WebXR (VR/AR)
  
  // свет, плоскость‑пол
  scene.add(new THREE.HemisphereLight(0xffffff,0x444444));
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10,10),
    new THREE.MeshPhongMaterial({ color:0x888888 })
  );
  floor.rotation.x = -Math.PI/2;
  scene.add(floor);

  window.addEventListener('resize',()=>{
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
  return { scene, camera, renderer };
}

export function animateScene(renderer, scene, camera) {
  // сюда можно добавлять анимации моделей, взаимодействие XR контроллеров и т.п.
  renderer.render(scene, camera);
}
