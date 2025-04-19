// scripts/main.js
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.142.0/build/three.module.js';
import { VRButton } from 'https://cdn.jsdelivr.net/npm/three@0.142.0/examples/jsm/webxr/VRButton.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.142.0/examples/jsm/loaders/GLTFLoader.js';

async function start() {
  const video = document.getElementById('camera');
  video.srcObject = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });

  const canvas = document.getElementById('three-canvas');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 1000);
  camera.position.set(0, 1.6, 0);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;

  document.body.appendChild(VRButton.createButton(renderer));

  const light = new THREE.HemisphereLight(0xffffff, 0x444444);
  scene.add(light);

  const loader = new GLTFLoader();
  loader.load('models/dog.glb', gltf => {
    const model = gltf.scene;
    scene.add(model);
  });

  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
  });
}

start();
