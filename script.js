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

// Mantenemos la niebla con el color azul noche para no perder la atmósfera
scene.fog = new THREE.FogExp2(0x0a141e, 0.12); 

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
  alpha: true // Enciende la transparencia del canvas
});
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

// ¡IMPORTANTE! Asegura que el canvas 3D esté por encima de la luna HTML
renderer.domElement.style.position = "relative";
renderer.domElement.style.zIndex = "10"; 

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
const ambientLight = new THREE.AmbientLight(0x203040, 2.0); 
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xff7733, 3.5);
directionalLight.position.set(5, 10, 7);
scene.add(directionalLight);

const backLight = new THREE.DirectionalLight(0x0088ff, 2.0);
backLight.position.set(-5, 5, -5);
scene.add(backLight);

// ==========================
// Piso (Estilo Piedra Oscura/Patio)
// ==========================
const floorGeometry = new THREE.PlaneGeometry(20, 20); 
const floorMaterial = new THREE.MeshStandardMaterial({
  color: 0x0a0c10,
  roughness: 0.1, 
  metalness: 0.3
});
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.position.y = 0;
scene.add(floor);

const grid = new THREE.GridHelper(20, 20, 0x113355, 0x081522);
grid.position.y = 0.01; 
scene.add(grid);

// ==========================
// Círculo Mágico (Suelo)
// ==========================
const ringGeometry = new THREE.RingGeometry(1.0, 1.15, 32);
const ringMaterial = new THREE.MeshStandardMaterial({
  color: 0xff4400,
  emissive: 0xff2200,      
  emissiveIntensity: 2.0,  
  side: THREE.DoubleSide
});
const magicRing = new THREE.Mesh(ringGeometry, ringMaterial);
magicRing.rotation.x = -Math.PI / 2; 
magicRing.position.y = 0.02; 
scene.add(magicRing);

// ==========================
// Luna en el cielo (Fija en el mundo 3D)
// ==========================
const moonLoader = new THREE.TextureLoader();
const moonTexture = moonLoader.load('assets/luna.png');

// Hacemos un plano grande para la luna
const moonGeometry = new THREE.PlaneGeometry(15, 15);
const moonMaterial = new THREE.MeshBasicMaterial({
  map: moonTexture,
  transparent: true,
  fog: false // Para que la niebla oscura no la tape
});

const moon = new THREE.Mesh(moonGeometry, moonMaterial);

// La colocamos muy atrás en el fondo (Z = -25), arriba (Y = 12) y a la izquierda (X = -10)
moon.position.set(-10, 12, -25);

// Hacemos que la luna "mire" hacia el centro del escenario para que no se vea plana al girar
moon.lookAt(0, 0, 0);

scene.add(moon);

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
const sphereGeometry = new THREE.SphereGeometry(0.08, 16, 16);

for (let i = 0; i < 40; i++) { 
  const sphereMaterial = new THREE.MeshStandardMaterial({
    color: 0xffaa00, 
    emissive: 0xff4400, 
    emissiveIntensity: 2.0, 
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
const textureLoader = new THREE.TextureLoader();
const petalTexture = textureLoader.load('assets/petalo.png');
const petalGeometry = new THREE.PlaneGeometry(0.08, 0.08);

for (let i = 0; i < 70; i++) {
  const petalMaterial = new THREE.MeshStandardMaterial({
    map: petalTexture,       
    transparent: true,       
    alphaTest: 0.1,          
    side: THREE.DoubleSide,  
    roughness: 0.8,
    emissive: 0xffffff,
    emissiveIntensity: 0.05 
  });

  const petal = new THREE.Mesh(petalGeometry, petalMaterial);

  petal.position.set(
    (Math.random() - 0.5) * 12, 
    Math.random() * 5 + 1,      
    (Math.random() - 0.5) * 8 - 2 
  );

  petal.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);

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
// Vegetación (Árboles y Ramas 2D)
// ==========================
const textureLoader2 = new THREE.TextureLoader();

// --- 1. LOS TRES ÁRBOLES DEL FONDO ---
const arbolTexture = textureLoader2.load('assets/arbol.png');
// Hacemos el plano grande para que el árbol se vea imponente
const arbolGeometry = new THREE.PlaneGeometry(8, 8); 
const arbolMaterial = new THREE.MeshBasicMaterial({
  map: arbolTexture,
  transparent: true,
  alphaTest: 0.1, // Recorta perfectamente los bordes del PNG
  side: THREE.DoubleSide,
  fog: true // Queremos que la niebla oscura los afecte para dar profundidad
});

// Posiciones para los 3 árboles (Atrás y separados)
const posicionesArboles = [
  { x: 0, z: -8 },   // Árbol central (justo detrás del personaje)
  { x: -6, z: -10 }, // Árbol izquierdo (más atrás)
  { x: 6, z: -9 }    // Árbol derecho
];

posicionesArboles.forEach(pos => {
  const arbol = new THREE.Mesh(arbolGeometry, arbolMaterial);
  arbol.position.set(pos.x, 3.5, pos.z); // La altura (Y=3.5) alinea el tronco al piso
  scene.add(arbol);
});


// --- 2. LAS RAMAS EN LAS ESQUINAS (AJUSTADAS) ---
// ==========================
// Rama en Esquina Superior Derecha (Fija)
// ==========================
const textureLoaderVegetacion = new THREE.TextureLoader();
const ramaTexture = textureLoaderVegetacion.load('assets/rama.png');

// La hacemos un poco más pequeña (de 7x7 a 5x5)
const ramaGeometry = new THREE.PlaneGeometry(5, 5); 

const ramaMaterial = new THREE.MeshBasicMaterial({
  map: ramaTexture,
  transparent: true,
  side: THREE.DoubleSide,
  fog: false // Para que mantenga su color nítido frente a la luna
});

const ramaDer = new THREE.Mesh(ramaGeometry, ramaMaterial);

// POSICIONAMIENTO:
// X = 4.5 (Más a la derecha)
// Y = 3.8 (Un poco más arriba para que no tape al personaje)
// Z = 1.5 (Mantiene el efecto de profundidad hacia el usuario)
ramaDer.position.set(-4, 2, -1);

// Rotamos un poco la rama para que parezca que "cae" desde la esquina
ramaDer.rotation.z = -0.2; 
// Invertimos en Y para que apunte hacia el centro
ramaDer.rotation.y = Math.PI; 

scene.add(ramaDer);




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

  // 2. Animación de los pétalos de Sakura
  petals.forEach((petal) => {
    const pData = petal.userData;

    petal.position.y -= pData.speedY;
    
    petal.position.x += Math.sin(time * pData.speedX + pData.offset) * 0.01;
    petal.position.z += pData.speedZ;

    petal.rotation.x += pData.rotSpeedX;
    petal.rotation.y += pData.rotSpeedY;

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
// Responsive (¡Ya solo hay uno!)
// ==========================
window.addEventListener("resize", () => {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(container.clientWidth, container.clientHeight);
  effect.setSize(container.clientWidth, container.clientHeight);
});