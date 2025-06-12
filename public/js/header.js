import * as THREE from "https://esm.sh/three";
import {
  OrbitControls
} from 'https://esm.sh/three/examples/jsm/controls/OrbitControls.js';
import {
  EffectComposer
} from 'https://esm.sh/three/examples/jsm/postprocessing/EffectComposer.js';
import {
  RenderPass
} from 'https://esm.sh/three/examples/jsm/postprocessing/RenderPass.js';
import {
  UnrealBloomPass
} from 'https://esm.sh/three/examples/jsm/postprocessing/UnrealBloomPass.js';

const BLACK_HOLE_EVENT_HORIZON_RADIUS = 1.0;
const DISK_INNER_RADIUS = BLACK_HOLE_EVENT_HORIZON_RADIUS + 0.15;
const DISK_OUTER_RADIUS = 5.5;
const LENSING_SPHERE_RADIUS = BLACK_HOLE_EVENT_HORIZON_RADIUS + 0.07;
const GLOW_RADIUS_FACTOR = 1.07;
const PHOTON_SPHERE_RADIUS = BLACK_HOLE_EVENT_HORIZON_RADIUS * 1.5;




const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000004, 0.085);

const camera = new THREE.PerspectiveCamera(
  60, window.innerWidth / window.innerHeight, 0.1, 2000
);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: "high-performance"
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.95;
document.querySelector('header').appendChild(renderer.domElement);

const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.7,
  0.7,
  0.75
);
composer.addPass(bloomPass);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.04;
controls.rotateSpeed = 0.6;
controls.autoRotate = false;
controls.autoRotateSpeed = 0.12;
controls.target.set(0, 0, 0);
controls.minDistance = 2.5;
controls.maxDistance = 100;
controls.enablePan = false;

let autoRotateEnabled = false;
const autoRotateToggle = document.getElementById('autoRotateToggle');
const rotateIconSVG = `<svg class="ui-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>`;





const starGeometry = new THREE.BufferGeometry();
const starCount = 45000;
const starPositions = new Float32Array(starCount * 3);
const starColors = new Float32Array(starCount * 3);
const starSizes = new Float32Array(starCount);
const starAlphas = new Float32Array(starCount);
const starFieldRadius = 1200;
const baseColor = new THREE.Color(0xffffff);
const blueColor = new THREE.Color(0xaaddff);
const yellowColor = new THREE.Color(0xffffaa);
const redColor = new THREE.Color(0xffcccc);
for (let i = 0; i < starCount; i++) {
  const i3 = i * 3;
  const goldenRatio = (1 + Math.sqrt(5)) / 2;
  const theta = 2 * Math.PI * i / goldenRatio;
  const phi = Math.acos(1 - 2 * (i + 0.5) / starCount);
  const radius = Math.cbrt(Math.random()) * starFieldRadius;
  starPositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
  starPositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
  starPositions[i3 + 2] = radius * Math.cos(phi);
  const starColor = baseColor.clone();
  const colorType = Math.random();
  let colorIntensity = Math.random() * 0.4 + 0.6;
  if (colorType < 0.5) {
    starColor.lerp(blueColor, Math.random() * 0.3);
  } else if (colorType < 0.85) {
    starColor.lerp(yellowColor, Math.random() * 0.2);
    colorIntensity *= 0.9;
  } else {
    starColor.lerp(redColor, Math.random() * 0.15);
    colorIntensity *= 0.8;
  }
  starColor.multiplyScalar(colorIntensity);
  starColors[i3] = starColor.r;
  starColors[i3 + 1] = starColor.g;
  starColors[i3 + 2] = starColor.b;
  const sizeVariation = Math.random();
  if (sizeVariation > 0.997) {
    starSizes[i] = THREE.MathUtils.randFloat(1.5, 2.2);
  } else if (sizeVariation > 0.98) {
    starSizes[i] = THREE.MathUtils.randFloat(0.8, 1.5);
  } else {
    starSizes[i] = THREE.MathUtils.randFloat(0.3, 0.8);
  }
  const distFactor = Math.min(1.0, radius / starFieldRadius);
  starSizes[i] *= (1.0 - distFactor * 0.3);
  starAlphas[i] = Math.random() * 0.5 + 0.5;
}
starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
starGeometry.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));
starGeometry.setAttribute('alpha', new THREE.BufferAttribute(starAlphas, 1));
const starMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uTime: {
      value: 0.0
    },
    uDiskEchoActive: {
      value: 0.0
    },
    uDiskEchoIntensity: {
      value: 0.0
    }
  },
  vertexShader: `
        attribute float size;
        attribute float alpha;
        varying vec3 vColor;
        varying float vAlpha;
        uniform float uDiskEchoActive;
        uniform float uDiskEchoIntensity;
        
        void main() {
            vColor = color;
            vAlpha = alpha;
            
            vec3 adjustedPosition = position;
            if (uDiskEchoActive > 0.0) {
                float distFromCenter = length(position);
                float pushFactor = uDiskEchoIntensity * 0.025 * smoothstep(50.0, 300.0, distFromCenter);
                adjustedPosition = position * (1.0 + pushFactor);
            }
            
            vec4 mvPosition = modelViewMatrix * vec4(adjustedPosition, 1.0);
            gl_PointSize = size * (350.0 / -mvPosition.z) * (1.0 + uDiskEchoIntensity * 0.35);
            gl_Position = projectionMatrix * mvPosition;
        }`,
  fragmentShader: `
        uniform float uTime;
        uniform float uDiskEchoIntensity;
        varying vec3 vColor;
        varying float vAlpha;
        
        void main() {
            float r = length(gl_PointCoord - vec2(0.5, 0.5));
            float baseAlpha = 1.0 - smoothstep(0.45, 0.5, r);
            if (baseAlpha < 0.01) discard;
            
            float twinkleSpeed = vAlpha * 1.5 + 0.5 + uDiskEchoIntensity * 4.0;
            float twinkleRange = 0.15 + uDiskEchoIntensity * 0.4;
            float twinkle = sin(uTime * twinkleSpeed + vAlpha * 10.0) * twinkleRange + 0.9;
            
            vec3 finalColor = vColor * twinkle * (1.0 + uDiskEchoIntensity * 0.9);
            
            gl_FragColor = vec4(finalColor, baseAlpha * vAlpha * (1.0 + uDiskEchoIntensity * 0.45));
        }`,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  transparent: true,
  vertexColors: true
});
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

const textureLoader = new THREE.TextureLoader();
const logoTexture = textureLoader.load('/logo/logotransparant.png');

const logoMaterial = new THREE.SpriteMaterial({
  map: logoTexture,
  transparent: true
});

const logoSprite = new THREE.Sprite(logoMaterial);
logoSprite.scale.set(2.7, 2.7, 2.7); // taille du logo
logoSprite.position.set(0, 0, 0); // centre
scene.add(logoSprite);

// 1. Soleil : disque lumineux (plane + ShaderMaterial)
// --- Création du soleil (sunMesh) ---

// --- Création du matériau shader pour le soleil et la corona ---

const sunShaderMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uColorStart: { value: new THREE.Color("rgb(255, 0, 67)") },
    uColorEnd: { value: new THREE.Color("rgb(0, 7, 185)") },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    uniform float uTime;
    uniform vec3 uColorStart;
    uniform vec3 uColorEnd;

    float hash(vec2 p){
      return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453);
    }
    float noise(vec2 p){
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f*f*(3.0-2.0*f);
      return mix(mix(hash(i), hash(i+vec2(1.0,0.0)), u.x),
                 mix(hash(i+vec2(0.0,1.0)), hash(i+vec2(1.0,1.0)), u.x), u.y);
    }
    float fbm(vec2 p) {
      float total = 0.0;
      float amplitude = 0.5;
      for(int i=0; i<5; i++) {
        total += amplitude * noise(p);
        p *= 2.0;
        amplitude *= 0.5;
      }
      return total;
    }

    void main() {
      vec2 uv = vUv * 2.0 - 1.0;
      float dist = length(uv);

      vec2 dir = normalize(vec2(0.829, 0.559));
      float grad = clamp(dot(vUv, dir), 0.0, 1.0);
      vec3 color = mix(uColorStart, uColorEnd, grad);

      float turbulence = fbm(uv * 3.0 + uTime * 0.3);
      float intensity = smoothstep(0.5, 0.45, dist) * turbulence;

      gl_FragColor = vec4(color, intensity);
    }
  `,
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  side: THREE.DoubleSide,
});

// Clone pour corona en changeant juste l’uniform uTime (si tu veux différents effets)

const coronaShaderMaterial = sunShaderMaterial.clone();
coronaShaderMaterial.fragmentShader = `
  varying vec2 vUv;
  uniform float uTime;
  uniform vec3 uColorStart;
  uniform vec3 uColorEnd;

  float hash(vec2 p){
    return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453);
  }
  float noise(vec2 p){
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f*f*(3.0-2.0*f);
    return mix(mix(hash(i), hash(i+vec2(1.0,0.0)), u.x),
               mix(hash(i+vec2(0.0,1.0)), hash(i+vec2(1.0,1.0)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float total = 0.0;
    float amplitude = 0.5;
    for(int i=0; i<5; i++) {
      total += amplitude * noise(p);
      p *= 2.0;
      amplitude *= 0.5;
    }
    return total;
  }

  void main() {
    vec2 uv = vUv * 2.0 - 1.0;
    float dist = length(uv);
    float corona = smoothstep(1.0, 0.7, dist);

    float turbulence = fbm(uv * 3.0 + uTime * 0.5);
    float intensity = corona * turbulence;

    vec2 dir = normalize(vec2(0.829, 0.559));
    float grad = clamp(dot(vUv, dir), 0.0, 1.0);
    vec3 color = mix(uColorStart, uColorEnd, grad);

    gl_FragColor = vec4(color, intensity);
  }
`;

// --- Création des sprites ---

const sunSprite = new THREE.Sprite(sunShaderMaterial);
sunSprite.scale.set(6, 6, 1);
sunSprite.position.set(0, 0, -0.1);
scene.add(sunSprite);

// création du coronaSprite (sprite 2D)
const coronaSprite = new THREE.Sprite(coronaShaderMaterial);
coronaSprite.scale.set(3.2, 3.2, 1);
coronaSprite.position.set(0, 0, -0.15);
scene.add(coronaSprite);

const blackHoleGeometry = new THREE.SphereGeometry(BLACK_HOLE_EVENT_HORIZON_RADIUS, 64, 32);


const blackHoleMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uTexture: { value: logoTexture },
    uTime: { value: 0.0 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D uTexture;
    uniform float uTime;
    varying vec2 vUv;

    void main() {
      vec3 gradientColor = mix(vec3(1.0, 0.0, 0.26), vec3(0.0, 0.03, 0.72), vUv.y); // dégradé rose -> bleu
      vec4 logo = texture2D(uTexture, vUv);

      float pulse = 0.8 + 0.2 * sin(uTime * 4.0); // lumière pulsante

      vec3 finalColor = mix(gradientColor, logo.rgb, logo.a); // fond dégradé + logo

      // Glow néon pulsant sur les bords
      float edge = smoothstep(0.95, 1.0, length(vUv - 0.5) * 2.0);
      vec3 glow = mix(vec3(1.0, 0.0, 0.4), vec3(0.0, 0.03, 0.72), vUv.y) * (1.0 - edge) * 0.8 * pulse;

      gl_FragColor = vec4(finalColor + glow, 1.0);
    }
  `,
  transparent: true
});



const blackHole = new THREE.Mesh(blackHoleGeometry, blackHoleMaterial);



let lastRippleTime = -Infinity;
const RIPPLE_COOLDOWN = 0.5;
let diskEchoIntensity = 0.0;
let diskEchoActive = false;
let diskEchoStartTime = 0;
const DISK_ECHO_DURATION = 2.8;

function triggerDiskEcho() {
  const currentTime = clock.getElapsedTime();
  if (currentTime - lastRippleTime < RIPPLE_COOLDOWN) {
    return;
  }
  lastRippleTime = currentTime;
  diskEchoStartTime = currentTime;
  diskEchoActive = true;

  diskMaterial.uniforms.uRippleActive.value = 1.0;
  diskMaterial.uniforms.uRippleStartTime.value = currentTime;

  diskMaterial.uniforms.uPrimaryWaveColor.value.copy(themes[currentThemeName].primaryWave).multiplyScalar(3.0);
  diskMaterial.uniforms.uSecondaryWaveColor.value.copy(themes[currentThemeName].secondaryWave).multiplyScalar(2.7);
  diskMaterial.uniforms.uTertiaryWaveColor.value.copy(themes[currentThemeName].tertiaryWave).multiplyScalar(2.4);

  glowMaterial.uniforms.uDiskEchoColor.value.copy(themes[currentThemeName].primaryWave).multiplyScalar(1.8);

  bloomPass.strength = 1.3;
  bloomPass.threshold = 0.60;
}

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function onPointerDown(event) {
  if (event.target.closest('.ui-panel')) return;
  if (event.isPrimary === false && event.pointerType !== 'touch') return;
  let x, y;
  if (event.touches && event.touches.length > 0) {
    x = event.touches[0].clientX;
    y = event.touches[0].clientY;
  } else {
    x = event.clientX;
    y = event.clientY;
  }
  pointer.x = (x / window.innerWidth) * 2 - 1;
  pointer.y = -(y / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObject(blackHole, false);
  if (intersects.length > 0) triggerDiskEcho();
}
renderer.domElement.addEventListener('pointerdown', onPointerDown, false);



setTimeout(() => {
  const info = document.getElementById('info');
  if (info) info.style.opacity = '0';
}, 7000);

let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
    bloomPass.resolution.set(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  }, 150);
});

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const elapsedTime = clock.getElapsedTime();
  // blackHoleMaterial.uniforms.uTime.value = elapsedTime;

  const deltaTime = clock.getDelta();




  starMaterial.uniforms.uTime.value = elapsedTime;



  if (diskEchoActive) {

  
    starMaterial.uniforms.uDiskEchoActive.value = diskEchoActive ? 1.0 : 0.0;
    starMaterial.uniforms.uDiskEchoIntensity.value = diskEchoIntensity;
  


  }

  controls.update();
  stars.rotation.y += deltaTime * 0.004;
  stars.rotation.x += deltaTime * 0.0015;
 



  // Rotation du soleil et de la corona
  sunSprite.material.uniforms.uTime.value = elapsedTime;
  coronaSprite.material.uniforms.uTime.value = elapsedTime;

  composer.render(deltaTime);
}

function initialCameraAnimation() {
  const startPosition = new THREE.Vector3(0, 15, 18);
  const endPosition = new THREE.Vector3(0, 5, 8);
  const duration = 4500;
  const startTime = Date.now();
  camera.position.copy(startPosition);
  controls.enabled = false;

  function updateCamera() {
    const elapsed = Date.now() - startTime;
    if (elapsed < duration) {
      const progress = elapsed / duration;
      const t = 1 - Math.pow(1 - progress, 5);
      camera.position.lerpVectors(startPosition, endPosition, t);
      controls.target.set(0, 0, 0);
      requestAnimationFrame(updateCamera);
    } else {
      camera.position.copy(endPosition);
      controls.target.set(0, 0, 0);
      controls.enabled = true;
    }
  }
  updateCamera();
}


  initialCameraAnimation();
  animate();
