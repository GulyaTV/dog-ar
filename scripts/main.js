// scripts/main.js
import { initScene, animateScene } from './scene.js';
import { initGestures } from './gestures.js';
import { openApp1, openApp2, openApp3 } from './apps/app1.js';

async function start() {
  // 1. Камера
  const video = document.getElementById('camera');
  video.srcObject = await navigator.mediaDevices.getUserMedia({ video:{ facingMode:'environment' } });
  
  // 2. Three.js + WebXR
  const { scene, camera, renderer } = initScene();
  document.body.appendChild(VRButton.createButton(renderer));
  
  // 3. HUD-кнопки в DOM
  const hud = document.getElementById('hud');
  ['App 1','App 2','App 3'].forEach((label,i) => {
    const btn = document.createElement('div');
    btn.className = 'hud-btn';
    btn.id = `btn${i+1}`;
    btn.style.top  = `${10 + i*12}%`;
    btn.style.left = `80%`;
    btn.textContent = label;
    hud.appendChild(btn);
  });

  // 4. Инициализируем жесты
  initGestures(video, (gesture, x, y) => {
    // на «pinch» или «tap» — проверяем, что попали в HUD-кнопку
    const el = document.elementFromPoint(x, y);
    if (!el || !el.id.startsWith('btn')) return;
    el.classList.add('active');
    setTimeout(()=>el.classList.remove('active'),200);
    // вызов приложения
    if (el.id==='btn1') openApp1(scene, camera);
    if (el.id==='btn2') openApp2(scene, camera);
    if (el.id==='btn3') openApp3(scene, camera);
  });

  // 5. Запуск рендера
  renderer.setAnimationLoop(() => animateScene(renderer, scene, camera));
}

start();
