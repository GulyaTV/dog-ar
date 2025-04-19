// scripts/apps/app1.js
export function openApp1(scene, camera) {
  // Пример: добавляем 3D‑модель или панель
  const geo = new THREE.BoxGeometry(0.3,0.3,0.3);
  const mat = new THREE.MeshStandardMaterial({ color:0xff0000 });
  const cube = new THREE.Mesh(geo, mat);
  cube.position.set(0,1.5,-1);
  scene.add(cube);
  // Здесь можно загружать glTF‑модель, открывать мини‑игру и т.д.
}
export function openApp2(scene,camera){ /* … */ }
export function openApp3(scene,camera){ /* … */ }
