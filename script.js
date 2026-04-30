import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js";
import { FBXLoader } from "https://unpkg.com/three@0.160.0/examples/jsm/loaders/FBXLoader.js";
import { AnaglyphEffect } from "https://unpkg.com/three@0.160.0/examples/jsm/effects/AnaglyphEffect.js";

// ==========================
// Escena, cámara y renderer
// ==========================
const container = document.getElementById("viewer-container");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050505);

const camera = new THREE.PerspectiveCamera(
  60,
  container.clientWidth / container.clientHeight,
  0.1,
  1000
);
camera.position.set(0, 1.8, 5);

// Renderer base
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: false
});
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

// ==========================
// Efecto Anaglifo
// ==========================
const effect = new AnaglyphEffect(renderer);
effect.setSize(container.clientWidth, container.clientHeight);

// ==========================
// Controles
// ==========================
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 1, 0);
controls.minDistance = 2;
controls.maxDistance = 10;
controls.update();

// ==========================
// Iluminación
// ==========================
const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(5, 10, 7);
scene.add(directionalLight);

const backLight = new THREE.DirectionalLight(0xffffff, 1);
backLight.position.set(-5, 5, -5);
scene.add(backLight);

// ==========================
// Piso
// ==========================
const floorGeometry = new THREE.PlaneGeometry(20, 20);
const floorMaterial = new THREE.MeshStandardMaterial({
  color: 0x222222,
  roughness: 0.8,
  metalness: 0.2
});
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.position.y = 0;
scene.add(floor);

// ==========================
// Grid helper
// ==========================
const grid = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
scene.add(grid);

// ==========================
// Cargar modelo FBX (Mixamo)
// ==========================
const loader = new FBXLoader();
let mixer;

loader.load(
  "models/personaje.fbx",
  (fbx) => {
    fbx.scale.set(0.01, 0.01, 0.01);
    fbx.position.set(0, 0, 0);

    // Sombras y materiales
    fbx.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    scene.add(fbx);

    // Animación
    if (fbx.animations.length > 0) {
      mixer = new THREE.AnimationMixer(fbx);
      const action = mixer.clipAction(fbx.animations[0]);
      action.play();
    }
  },
  (xhr) => {
    console.log(`Cargando modelo: ${(xhr.loaded / xhr.total) * 100}%`);
  },
  (error) => {
    console.error("Error al cargar el modelo FBX:", error);
  }
);

// ==========================
// Reloj
// ==========================
const clock = new THREE.Clock();

// ==========================
// Animación
// ==========================
function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();

  if (mixer) mixer.update(delta);

  controls.update();

  // Render con efecto anaglifo
  effect.render(scene, camera);
}

animate();

// ==========================
// Responsive
// ==========================
window.addEventListener("resize", () => {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(container.clientWidth, container.clientHeight);
  effect.setSize(container.clientWidth, container.clientHeight);
});