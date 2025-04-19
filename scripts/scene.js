// scripts/scene.js
import * as THREE     from 'https://cdn.jsdelivr.net/npm/three@0.142.0/build/three.module.js';

export async function initScene() {
  // подгружаем Ammo.js
  await Ammo();

  // физический мир
  const collisionConfig = new Ammo.btDefaultCollisionConfiguration();
  const dispatcher      = new Ammo.btCollisionDispatcher(collisionConfig);
  const broadphase      = new Ammo.btDbvtBroadphase();
  const solver          = new Ammo.btSequentialImpulseConstraintSolver();
  const physicsWorld    = new Ammo.btDiscreteDynamicsWorld(dispatcher, broadphase, solver, collisionConfig);
  physicsWorld.setGravity( new Ammo.btVector3(0,-9.8,0) );

  // Three.js сцена
  const canvas   = document.getElementById('three-canvas');
  const scene    = new THREE.Scene();
  const camera   = new THREE.PerspectiveCamera(70, window.innerWidth/window.innerHeight, 0.01, 1000);
  camera.position.set(0,1.6,0);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias:true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;

  // свет и пол
  scene.add(new THREE.HemisphereLight(0xffffff,0x444444));
  const floorMat = new THREE.MeshPhongMaterial({ color:0x888888 });
  const floorGeo = new THREE.PlaneGeometry(10,10);
  const floor    = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI/2;
  scene.add(floor);

  // добавляем физику пола
  addRigidBody(floor, physicsWorld, 0);

  window.addEventListener('resize',()=>{
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  return { scene, camera, renderer, physicsWorld };
}

// шаг физики + синхронизация мешей
export function physicsStep(dt, physicsWorld, scene) {
  physicsWorld.stepSimulation(dt, 10);

  scene.traverse(obj => {
    if (obj.userData.physicsBody) {
      const ms = obj.userData.physicsBody.getMotionState();
      if (ms) {
        let tm = new Ammo.btTransform();
        ms.getWorldTransform(tm);
        const p = tm.getOrigin(), q = tm.getRotation();
        obj.position.set(p.x(), p.y(), p.z());
        obj.quaternion.set(q.x(), q.y(), q.z(), q.w());
      }
    }
  });
}

// helper
function addRigidBody(mesh, world, mass=1) {
  const shape = new Ammo.btBoxShape(new Ammo.btVector3(
    mesh.scale.x * mesh.geometry.parameters.width  /2,
    mesh.scale.y * mesh.geometry.parameters.height /2,
    mesh.scale.z * mesh.geometry.parameters.depth  /2
  ));
  const transform = new Ammo.btTransform();
  transform.setIdentity();
  transform.setOrigin(new Ammo.btVector3(mesh.position.x, mesh.position.y, mesh.position.z));
  const motionState = new Ammo.btDefaultMotionState(transform);
  const localInertia = new Ammo.btVector3(0,0,0);
  shape.calculateLocalInertia(mass, localInertia);
  const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
  const body   = new Ammo.btRigidBody(rbInfo);
  world.addRigidBody(body);
  mesh.userData.physicsBody = body;
}

// контроллеры WebXR: бросок сферы
export function addControllerInteractions(renderer, scene, physicsWorld) {
  const controller = renderer.xr.getController(0);
  controller.addEventListener('selectstart', () => {
    // создаём сферу и добавляем физику
    const radius = 0.05;
    const mat = new THREE.MeshStandardMaterial({ color:0x0077ff });
    const sphereGeo = new THREE.SphereGeometry(radius, 16, 16);
    const sphere = new THREE.Mesh(sphereGeo, mat);
    controller.add(sphere);
    sphere.position.set(0,0, -0.2);
    scene.add(sphere);

    addRigidBody(sphere, physicsWorld, 1);
    // снимаем привязку через секунду и даём импульс
    setTimeout(()=>{
      scene.attach(sphere);
      const body = sphere.userData.physicsBody;
      const impulse = new Ammo.btVector3(0,0, -5);
      body.setLinearVelocity(impulse);
    }, 1000);
  });
  renderer.xr.getCamera();  
  renderer.xr.addEventListener('sessionstart', ()=>{
    renderer.xr.getSession().inputSources.forEach(src => {
      if (src.targetRayMode === 'tracked-pointer') {
        const grip = renderer.xr.getControllerGrip(0);
        grip.add(controller);
        scene.add(grip);
      }
    });
  });
}
