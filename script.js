import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js";
import { FBXLoader } from "https://unpkg.com/three@0.160.0/examples/jsm/loaders/FBXLoader.js";
import { AnaglyphEffect } from "https://unpkg.com/three@0.160.0/examples/jsm/effects/AnaglyphEffect.js";

// ==========================================
// Visualización 3D con Anaglifo y Mixamo
// Desarrollado por: Diana Denise Campos Lozano
// Ingeniería en TIC's
// ==========================================

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
camera.position.set(0, 1.7, 3);

// El enfoque en 3.0 convierte al personaje en el "cristal de tu monitor"
camera.focus = 3.0;

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

// AJUSTE CLAVE PARA LA VISTA: 
// Bajamos la separación a 0.020. Esto cura la "visión doble" 
// y hace que la escena sea súper cómoda de mirar por largo rato.
if (effect.stereo) {
  effect.stereo.eyeSep = 0.020; 
}

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
const floorGeometry = new THREE.PlaneGeometry(10, 10);
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
const grid = new THREE.GridHelper(10, 10, 0x444444, 0x222222);
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
// Esferas flotantes (Movimiento Dinámico)
// ==========================
const floatingSpheres = [];
const sphereGeometry = new THREE.SphereGeometry(0.15, 32, 32);

for (let i = 0; i < 25; i++) {
  const sphereMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0x222222,
    roughness: 0.4,
    metalness: 0.3
  });

  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

  // Asignamos una posición base controlada
  const posX = (Math.random() - 0.5) * 8;
  const posY = Math.random() * 3 + 0.5;
  // Posición base en Z ligeramente detrás o justo en el personaje
  const posZ = (Math.random() * 2.0) - 1.5; 

  sphere.position.set(posX, posY, posZ);

  // Configuramos el comportamiento único de cada esfera
  sphere.userData = {
    baseX: sphere.position.x,
    baseY: sphere.position.y,
    baseZ: sphere.position.z,
    // Velocidad de movimiento (más lenta para el eje Z para que parezca que viajan)
    speedX: 0.0004 + Math.random() * 0.0004,
    speedY: 0.0006 + Math.random() * 0.0006,
    speedZ: 0.0003 + Math.random() * 0.0003, // Muy lento hacia adelante/atrás
    // Amplitud Z: Define qué tanto viajan hacia el usuario. 
    // Al sumar la baseZ + zAmplitude, algunas lograrán rebasar la pantalla (Z > 0)
    zAmplitude: 0.8 + Math.random() * 1.2, 
    offset: Math.random() * Math.PI * 2      
  };

  scene.add(sphere);
  floatingSpheres.push(sphere);
}

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

  const time = Date.now();
  
  floatingSpheres.forEach((sphere) => {
    const data = sphere.userData;

    // Movimiento orgánico
    sphere.position.x = data.baseX + Math.sin(time * data.speedX + data.offset) * 1.2;
    sphere.position.y = data.baseY + Math.sin(time * data.speedY + data.offset) * 0.8;
    
    // NUEVO MOVIMIENTO EN Z: 
    // Ahora oscilan profundamente, viniendo hacia la cámara y retrocediendo,
    // dando un efecto real de "viaje espacial" interactivo con la pantalla.
    sphere.position.z = data.baseZ + Math.sin(time * data.speedZ + data.offset) * data.zAmplitude;

    sphere.rotation.x += 0.002;
    sphere.rotation.y += 0.002;
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