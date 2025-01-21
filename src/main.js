import * as THREE from 'three';
import { Sky } from 'three/addons/objects/Sky.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';


// Create scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xaaaaaa);
scene.environment = null;
const GLTFloader = new GLTFLoader();
const FBXloader = new FBXLoader();
const layoutDimensions={width:100,height:100}
const playerBoundary={top:50,bottom:50,left:50,right:50};
let trump;

//Define mobile controls
initMobileControls();

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const clock = new THREE.Clock();
let mixer;

//sky
const sun = new THREE.Vector3();
const sky = new Sky();
sky.scale.setScalar(45000);
scene.add(sky);
loadSky()

//lighting
const spotLight = new THREE.SpotLight(0xffffff, 1, 100, Math.PI / 4, 0.1, 2);
const directionalLight = new THREE.DirectionalLight(0xffffff, 10);  // Intensity set to 1 for normal lighting
const ambientLight = new THREE.AmbientLight(0x404040); // Color of the light (hex code)
loadLighting()

// Create camera 
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0.85, 0); 
// camera.lookAt(0, 0, 0);

// Create renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a cube (green color)
const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 }); 
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
cube.position.set(0, 0, 0)
//scene.add(cube);

//world
loadWorld()

let speed = 0;
let rotation=0;
let speedDelta=0.02//0.015;
let rotationDelta=0.008//0.006;

window.addEventListener('mousedown',onDocumentMouseDown,false);

function onMouseMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function checkIntersection() {
  raycaster.updateMatrixWorld();
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(trump);
  if (intersects.length > 0) {
    onHover();
  }
}

function onDocumentMouseDown( event ) {
  event.preventDefault();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(trump);
  if (intersects.length > 0) {
    console.log("yes")
    window.open('https://www.donaldjtrump.com', '_blank');
  }

}

function onHover() {
  console.log("Hovered over the cube!");
  
}

document.addEventListener('keydown', (event) => {
    switch (event.key) {
      case 'w': 
      case 'ArrowUp': 
        speed=1;
        break;
      case 's': 
      case 'ArrowDown': 
        speed=-1;
        break;
      case 'a': 
      case 'ArrowLeft':
        rotation=1;
        break;
      case 'd': 
      case 'ArrowRight': 
        rotation=-1;
        break;
    }
  });
  
  document.addEventListener('keyup', (event) => {
    switch (event.key) {
      case 'w':
        case 'ArrowUp': 
        case 's':
        case 'ArrowDown': 
        speed=0;
        break;
      case 'a':
        case 'ArrowLeft':
        case 'd':
        case 'ArrowRight':
        rotation=0;
        break;
    }
  });

  const offset = new THREE.Vector3(0, 2, 3);
  animate();

function animate() {
  requestAnimationFrame(animate);
  //thirdPerson();
  mixer?.update(clock.getDelta());
  firstPerson();
  //checkIntersection();
  // Render the scene and camera
  renderer.render(scene, camera);
}

function firstPerson(){
  camera.rotation.set(0,camera.rotation.y+(3.14*rotationDelta*rotation),0);
  const forwardVector = new THREE.Vector3();  // Default forward vector in local space
  camera.getWorldDirection(forwardVector);  // Transform to world space
  forwardVector.normalize();
  camera.position.add(forwardVector.multiplyScalar(speed*speedDelta));
  checkBoundaries()
  //console.log(camera.position);
}

function checkBoundaries(){
  if(camera.position.x<-17)
  {
      camera.position.x=-17;
  }
  if(camera.position.x>16)
  {
      camera.position.x=16;
  }
  if(camera.position.z<-4)
  {
      camera.position.z=-4;
  }
  if(camera.position.z>20)
  {
      camera.position.z=20;
  }
}

function thirdPerson(){
  cube.rotation.set(0,cube.rotation.y+(3.14*rotationDelta*rotation),0);
  const forwardVector = new THREE.Vector3();  // Default forward vector in local space
  cube.getWorldDirection(forwardVector);  // Transform to world space
  forwardVector.normalize();
  cube.position.add(forwardVector.multiplyScalar(speed*speedDelta));
  console.log(speed,rotation);
  camera.position.copy(cube.position).add(offset);
  camera.lookAt(cube.position);
  updateCameraPosition();
}

function updateCameraPosition() {
  // Get the forward vector of the cube in world space
  const forwardVector = new THREE.Vector3(0, 0, -1);  // Default forward vector in local space
  cube.getWorldDirection(forwardVector);  // Transform to world space

  // Set the camera's position slightly behind the cube (relative to its forward vector)
  const cameraOffset = new THREE.Vector3(0, 2, -5);  // Offset behind and above the cube
  camera.position.copy(cube.position).add(forwardVector.multiplyScalar(cameraOffset.z));
  camera.position.y += cameraOffset.y;

  // Make the camera look at the cube
  camera.lookAt(cube.position);
}

function loadGLTFModel(path,position,rotation,scale){
    GLTFloader.load(
      path, 
      (gltf) => {
        let object=gltf.scene;
        scene.add(object);
        object.position.set(position.x,position.y,position.z);
        rotation?object.rotation.set(rotation.x,rotation.y,rotation.z):null;
        object.scale.set(scale,scale,scale);
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded'); 
      },
      (error) => {
        console.error('An error occurred:', error); 
      }
    );
}

function loadFBXModel(path,position,rotation,scale){
  FBXloader.load(
    path, 
    (object) => {
      scene.add(object)
      object.position.set(position.x,position.y,position.z);
      rotation?object.rotation.set(rotation.x,rotation.y,rotation.z):null;
      object.scale.set(scale,scale,scale);
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total * 100) + '% loaded'); 
    },
    (error) => {
      console.error('An error occurred:', error); 
    }
  );
}


function loadWorld(){
  //loadCliffs();
  //loadTrees();
  loadGLTFModel('./assets/models/whitehouse.gltf',{x:0,y:0,z:0},undefined,1)
  loadGLTFModel('./assets/models/plane.gltf',{x:0,y:0,z:0},undefined,1)
  loadGLTFModel('./assets/models/walls.gltf',{x:0,y:0,z:0},undefined,1)
  loadTrump('./assets/models/trump.glb',{x:-2.2,y:0,z:-8},undefined,0.8)
  loadFlag('./assets/models/flag.glb',{x:-2.25,y:1,z:-11},undefined,1)
  //loadFBXModel('./assets/models/model.fbx',{x:0,y:0,z:0},undefined,0.05)
}

function loadSky(){
// Sky material and light settings
const skyUniforms = sky.material.uniforms;
skyUniforms['turbidity'].value = 2;  // Cloudiness
skyUniforms['rayleigh'].value = 2;    // Rayleigh scattering (affects blue sky color)
skyUniforms['mieCoefficient'].value = 0.005;  // Mie scattering (affects haziness)
skyUniforms['mieDirectionalG'].value = 0.8;   // Sun direct scattering

const theta = Math.PI / 2 - Math.PI / 12;  // Elevation angle (lower for dimmer sun)
const phi = 2 * Math.PI;  // Azimuthal angle (full circle)

sun.x =4
sun.y = 1
sun.z = 2
sky.material.uniforms['sunPosition'].value = sun;
}

function loadLighting(){
  directionalLight.position.set(sun.x, sun.y, sun.z).normalize();
  directionalLight.castShadow = true; 
  directionalLight.intensity=14;
  ambientLight.position.set(-10,20,2)
  ambientLight.intensity=10
  scene.add(directionalLight);
  scene.add(ambientLight);
  spotLight.position.set(-1, 0, -2);
  spotLight.target.position.set(-1, 1,-3);
  spotLight.intensity=100;
  //scene.add(spotLight);
  const spotLightHelper = new THREE.SpotLightHelper(spotLight);
  const sunHelper=new THREE.DirectionalLightHelper(directionalLight);
  //scene.add(sunHelper);
  //scene.add(spotLightHelper);
}

function loadTrump(path,position,rotation,scale){
  GLTFloader.load(
    path, 
    (gltf) => {
      trump=gltf.scene;
      const animations = gltf.animations;
      scene.add(trump);
      mixer=new THREE.AnimationMixer(trump);
      if (animations && animations.length > 0) {
      animations.forEach((clip) => {
        if (clip.name === "Armature|mixamo.com|Layer0") {
          mixer.clipAction(clip).play();
        } 
      })};
      trump.position.set(position.x,position.y,position.z);
      rotation?trump.rotation.set(rotation.x,rotation.y,rotation.z):null;
      trump.scale.set(scale,scale,scale);
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total * 100) + '% loaded'); 
    },
    (error) => {
      console.error('An error occurred:', error); 
    }
  );
}

function loadFlag(path,position,rotation,scale){
  GLTFloader.load(
    path, 
    (gltf) => {
      let object=gltf.scene;
      const animations = gltf.animations;
      scene.add(object);
      mixer=new THREE.AnimationMixer(object);
      if (animations && animations.length > 0) {
      animations.forEach((clip) => {
        console.log(clip)
        if (clip.name === "Armature|mixamo.com|Layer0_Armature") {
          mixer.clipAction(clip).play();
        } 
      })};
      object.position.set(position.x,position.y,position.z);
      rotation?object.rotation.set(rotation.x,rotation.y,rotation.z):null;
      object.scale.set(scale,scale,scale);
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total * 100) + '% loaded'); 
    },
    (error) => {
      console.error('An error occurred:', error); 
    }
  );
}

function initMobileControls(){
  let wKey=document.getElementById("w");
  wKey.addEventListener("mousedown",()=>speed=1);
  wKey.addEventListener("pointerdown",()=>speed=1);
  wKey.addEventListener("mouseup",()=>speed=0);
  let sKey=document.getElementById("s");
  sKey.addEventListener("mousedown",()=>speed=-1);
  sKey.addEventListener("mouseup",()=>speed=0);
  let aKey=document.getElementById("a");
  aKey.addEventListener("mousedown",()=>rotation=1);
  aKey.addEventListener("mouseup",()=>rotation=0);
  let dKey=document.getElementById("d");
  dKey.addEventListener("mousedown",()=>rotation=-1);
  dKey.addEventListener("mouseup",()=>rotation=0);
}

