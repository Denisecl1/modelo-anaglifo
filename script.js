import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js";
import { FBXLoader } from "https://unpkg.com/three@0.160.0/examples/jsm/loaders/FBXLoader.js";
import { AnaglyphEffect } from "https://unpkg.com/three@0.160.0/examples/jsm/effects/AnaglyphEffect.js";

// ==========================================
// Visualización 3D con Anaglifo y Mixamo
// Desarrollado por: Diana Denise Campos Lozano
// Ingeniería en TIC's
// Tema: Dojo Místico / Paisaje Asiático
// ==========================================

const container = document.getElementById("viewer-container");

// ==========================
// Escena, Atmósfera y Niebla
// ==========================
const scene = new THREE.Scene();
// Color azul noche profundo (inspirado en sombras místicas)
const bgColor = new THREE.Color(0x0a141e); 
scene.background = bgColor;
// Agregamos niebla para dar profundidad y ocultar el horizonte
scene.fog = new THREE.FogExp2(bgColor, 0.12); 

// ==========================
// Cámara
// ==========================
const camera = new THREE.PerspectiveCamera(
  60,
  container.clientWidth / container.clientHeight,
  0.1,
  1000
);
camera.position.set(0, 1.7, 3);
camera.focus = 3.0;

// ==========================
// Renderer
// ==========================
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: false
});
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
// Habilitamos el mapeo de tonos para que las luces brillantes se vean más cinemáticas
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
container.appendChild(renderer.domElement);

// ==========================
// Efecto Anaglifo
// ==========================
const effect = new AnaglyphEffect(renderer);
effect.setSize(container.clientWidth, container.clientHeight);

// Separación cómoda para la vista
if (effect.stereo) {
  effect.stereo.eyeSep = 0.05; 
}

// ==========================
// Controles
// ==========================
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 1, 0);
controls.minDistance = 2;
controls.maxDistance = 10;
controls.maxPolarAngle = Math.PI / 2 + 0.1; // Limita para no ver mucho por debajo del piso
controls.update();

// ==========================
// Iluminación (Estilo Atardecer Asiático)
// ==========================
// Luz base azulada/nocturna
const ambientLight = new THREE.AmbientLight(0x203040, 2.0); 
scene.add(ambientLight);

// Luz cálida principal (simula el sol del atardecer o linternas rojas)
const directionalLight = new THREE.DirectionalLight(0xff7733, 3.5);
directionalLight.position.set(5, 10, 7);
scene.add(directionalLight);

// Luz de relleno fría (simula reflejos del agua o niebla)
const backLight = new THREE.DirectionalLight(0x0088ff, 2.0);
backLight.position.set(-5, 5, -5);
scene.add(backLight);

// ==========================
// Piso (Estilo Piedra Oscura/Patio)
// ==========================
const floorGeometry = new THREE.PlaneGeometry(20, 20); // Piso más grande para la niebla
const floorMaterial = new THREE.MeshStandardMaterial({
  color: 0x0a0c10,
  roughness: 0.1, // Ligeramente reflectante (como piedra pulida o agua estancada)
  metalness: 0.3
});
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.position.y = 0;
scene.add(floor);

// Grid helper (Cambiado a tonos azulados para integrarse en la noche)
const grid = new THREE.GridHelper(20, 20, 0x113355, 0x081522);
grid.position.y = 0.01; // Para evitar que parpadee con el piso
scene.add(grid);

// ==========================
// Cargar modelo FBX (Mixamo)
// ==========================
const loader = new FBXLoader();
let mixer;

loader.load(
  "models/personaje.fbx",
  (fbx) => {
    fbx.scale.set(0.009, 0.009, 0.009);
    fbx.position.set(0, 0, 0);

    fbx.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    scene.add(fbx);

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
// Espíritus/Luciérnagas Mágicas (Esferas)
// ==========================
const floatingSpheres = [];

// NUEVO TAMAÑO: El doble de grandes para que el cerebro fusione los colores
const sphereGeometry = new THREE.SphereGeometry(0.08, 16, 16);

for (let i = 0; i < 40; i++) { // Aumentamos la cantidad ya que son más pequeñas
  const sphereMaterial = new THREE.MeshStandardMaterial({
    color: 0xffaa00, // Color base dorado
    emissive: 0xff4400, // Brillo naranja/rojizo intenso
    emissiveIntensity: 2.0, // Fuerza del brillo
    roughness: 0.2,
    metalness: 0.8
  });

  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

  const posX = (Math.random() - 0.5) * 10;
  const posY = Math.random() * 3 + 0.2;
  const posZ = (Math.random() * 8.0) - 6.0; 

  sphere.position.set(posX, posY, posZ);

  sphere.userData = {
    baseX: sphere.position.x,
    baseY: sphere.position.y,
    // Movimiento serpenteante más errático (como luciérnagas)
    speedX: 0.001 + Math.random() * 0.001,
    speedY: 0.001 + Math.random() * 0.002,
    speedForward: 0.0015 + Math.random() * 0.003, 
    offset: Math.random() * Math.PI * 2      
  };

  scene.add(sphere);
  floatingSpheres.push(sphere);
}

// ==========================
// Reloj y Animación
// ==========================
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();

  if (mixer) mixer.update(delta);

  controls.update();

  const time = Date.now();
  
  floatingSpheres.forEach((sphere) => {
    const data = sphere.userData;

    // Movimiento tipo luciérnaga mágica
    sphere.position.x = data.baseX + Math.sin(time * data.speedX + data.offset) * 0.8;
    sphere.position.y = data.baseY + Math.cos(time * data.speedY + data.offset) * 0.5;
    
    // Avanzan hacia la cámara
   sphere.position.z += data.speedForward;

    // NUEVO LÍMITE: Dejamos que viajen hasta Z = 2.5 (casi chocando con la cámara en Z = 3)
    if (sphere.position.z > 2.5) {
      sphere.position.z = -6.0;
      data.baseX = (Math.random() - 0.5) * 10;
      data.baseY = Math.random() * 3 + 0.2;
    }

    sphere.rotation.x += 0.005;
    sphere.rotation.y += 0.005;
  });

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