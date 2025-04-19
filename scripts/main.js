import * as THREE       from 'https://cdn.jsdelivr.net/npm/three@0.142.0/build/three.module.js';
import { VRButton }     from 'https://cdn.jsdelivr.net/npm/three@0.142.0/examples/jsm/webxr/VRButton.js';
import { GLTFLoader }   from 'https://cdn.jsdelivr.net/npm/three@0.142.0/examples/jsm/loaders/GLTFLoader.js';
import { initScene, addControllerInteractions, physicsStep } from './scene.js';
import { initGestures } from './gestures.js';
import { openApp1, openApp2, openApp3 } from './apps/app1.js';

async function start() {
  // 1) Камера
  const video = document.getElementById('camera');
  video.srcObject = await navigator.mediaDevices.getUserMedia({ video: { facingMode:'environment' } });

  // 2) Сцена + WebXR + физика
  const { scene, camera, renderer, physicsWorld } = await initScene();

  // VR‑кнопка (теперь определена правильно)
  document.body.appendChild( VRButton.createButton(renderer) );
  renderer.setAnimationLoop(() => {
    physicsStep(1/60, physicsWorld, scene);
    renderer.render(scene, camera);
  });

  // 3) HUD‑кнопки
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

  // 4) Жесты по HUD‑кнопкам
  initGestures(video, (gesture, x, y) => {
    const el = document.elementFromPoint(x, y);
    if (!el || !el.id.startsWith('btn')) return;
    el.classList.add('active');
    setTimeout(()=>el.classList.remove('active'), 200);
    if (el.id==='btn1') openApp1(scene, physicsWorld);
    if (el.id==='btn2') openApp2(scene, physicsWorld);
    if (el.id==='btn3') openApp3(scene, physicsWorld);
  });

  // 5) Контроллеры WebXR (бросаем сферу, можно расширять)
  addControllerInteractions(renderer, scene, physicsWorld);
}

start();
