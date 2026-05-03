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
// Círculo Mágico (Suelo)
// ==========================
// Creamos un anillo plano
const ringGeometry = new THREE.RingGeometry(1.0, 1.15, 32);
const ringMaterial = new THREE.MeshStandardMaterial({
  color: 0xff4400,
  emissive: 0xff2200,      // Brillo rojo/naranja
  emissiveIntensity: 2.0,  // Fuerza del brillo
  side: THREE.DoubleSide
});
const magicRing = new THREE.Mesh(ringGeometry, ringMaterial);
magicRing.rotation.x = -Math.PI / 2; // Lo acostamos en el piso
magicRing.position.y = 0.02; // Lo subimos un milímetro para que no se empalme con el grid
scene.add(magicRing);

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
// Lluvia de Pétalos (Sakura) con Textura PNG
// ==========================
const petals = [];

// 1. Cargamos tu imagen PNG
const textureLoader = new THREE.TextureLoader();
const petalTexture = textureLoader.load('assets/petalo.png');

// 2. Geometría plana (Ajusta estos números si tu imagen se ve muy estirada o apachurrada)
const petalGeometry = new THREE.PlaneGeometry(0.08, 0.08);

for (let i = 0; i < 70; i++) {
  // 3. Material usando tu textura
  const petalMaterial = new THREE.MeshStandardMaterial({
    map: petalTexture,       // Aplicamos la imagen
    transparent: true,       // Fundamental para que el fondo del PNG sea invisible
    alphaTest: 0.1,          // Ayuda a que los bordes transparentes se recorten limpio
    side: THREE.DoubleSide,  // Para que el pétalo se vea por delante y por detrás
    roughness: 0.8,
    // Le dejamos un brillo muuuy sutil para que resalte en la oscuridad
    emissive: 0xffffff,
    emissiveIntensity: 0.05 
  });

  const petal = new THREE.Mesh(petalGeometry, petalMaterial);

  // Posición inicial aleatoria (arriba en el aire)
  petal.position.set(
    (Math.random() - 0.5) * 12, // X
    Math.random() * 5 + 1,      // Y (Altura)
    (Math.random() - 0.5) * 8 - 2 // Z
  );

  // Rotación inicial aleatoria
  petal.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);

  // Configuramos físicas de caída libre
  petal.userData = {
    speedY: 0.01 + Math.random() * 0.015,  
    speedX: 0.002 + Math.random() * 0.003, 
    speedZ: 0.005 + Math.random() * 0.005, 
    rotSpeedX: Math.random() * 0.02,
    rotSpeedY: Math.random() * 0.02,
    offset: Math.random() * Math.PI * 2
  };

  scene.add(petal);
  petals.push(petal);
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
  
  // 1. Animación de las Esferas
  floatingSpheres.forEach((sphere) => {
    const data = sphere.userData;

    sphere.position.x = data.baseX + Math.sin(time * data.speedX + data.offset) * 0.8;
    sphere.position.y = data.baseY + Math.cos(time * data.speedY + data.offset) * 0.5;
    
    sphere.position.z += data.speedForward;

    if (sphere.position.z > 2.5) {
      sphere.position.z = -6.0;
      data.baseX = (Math.random() - 0.5) * 10;
      data.baseY = Math.random() * 3 + 0.2;
    }

    sphere.rotation.x += 0.005;
    sphere.rotation.y += 0.005;
  });

  // 2. Animación de los pétalos de Sakura (AHORA ADENTRO DE LA FUNCIÓN)
  petals.forEach((petal) => {
    const pData = petal.userData;

    // Caen constantemente
    petal.position.y -= pData.speedY;
    
    // El viento los empuja hacia adelante y los balancea de lado
    petal.position.x += Math.sin(time * pData.speedX + pData.offset) * 0.01;
    petal.position.z += pData.speedZ;

    // Giran sobre sí mismos mientras caen
    petal.rotation.x += pData.rotSpeedX;
    petal.rotation.y += pData.rotSpeedY;

    // BUCLE: Si tocan el suelo (Y < 0) o salen mucho de la pantalla (Z > 3)
    if (petal.position.y < 0 || petal.position.z > 3) {
      petal.position.y = 5 + Math.random() * 2;
      petal.position.x = (Math.random() - 0.5) * 12;
      petal.position.z = (Math.random() - 0.5) * 8 - 3;
    }
  });

  // 3. Render final
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

// ==========================
// Responsive
// ==========================
window.addEventListener("resize", () => {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(container.clientWidth, container.clientHeight);
  effect.setSize(container.clientWidth, container.clientHeight);
});