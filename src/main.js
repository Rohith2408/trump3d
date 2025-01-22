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
let trump,text,trumpplane,whitehouse,aeroplane;
let models=[];
const mixers = []; 
const popups=[
  {id:0,title:"Early Life",body:"Family: Trump is the fourth of five children of Fred and Mary Trump. His father was a successful real estate developer in New York City, which would heavily influence Trump’s future endeavors. • Family: Trump is the fourth of five children of Fred and Mary Trump. His father was a successful real estate developer in New York City, which would heavily influence Trump’s future endeavors.Trump attended the New York Military Academy during his teenage years and later graduated from the Wharton School of the University of Pennsylvania with a degree in economics."},
  {id:1,title:"Media Career",body:"The Apprentice: In 2004, Trump became a household name as the host of The Apprentice, a reality TV show where contestants competed for a job in his organization. His catchphrase, “You’re fired,” became a cultural phenomenon.Cameos: Trump made frequent appearances in pop culture, including movies like Home Alone 2: Lost in New York and WWE events."},
  {id:2,title:"Political Career",body:"Presidential Campaign: In 2015, Trump announced his candidacy for president as a Republican, running on themes of nationalism, immigration reform, and economic populism. His slogan, “Make America Great Again” (MAGA), became iconic.2016 Election: Trump defeated Hillary Clinton in a stunning political upset, becoming the 45th president of the United States.Presidency: His term (2017–2021) was marked by significant controversies, policy shifts, and events, including:Tax reform and deregulation.A hardline stance on immigration, including the controversial travel bans.A trade war with China.Two impeachments: one over alleged pressure on Ukraine to investigate political rivals and another over the January 6 Capitol riot.2020 Election: Trump lost reelection to Joe Biden but refused to concede, claiming widespread voter fraud—a claim that led to intense political polarization and the Capitol riot."},
  {id:3,title:"Post Presidency",body:"Cultural Impact: Trump remains a polarizing figure, celebrated by supporters for his outsider status and criticized by opponents for his rhetoric and policies.Media Presence: He continues to influence Republican politics and remains a dominant figure in American media and culture."}
]
//const popupState

//Define mobile controls
initMobileControls();

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const clock = new THREE.Clock();
let mixer,mixer2,mixer3,mixer4,mixer5;

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

// Create an arrow helper for the ray
const arrowHelper = new THREE.ArrowHelper(
  new THREE.Vector3(), // Direction (initially zero)
  new THREE.Vector3(), // Origin (initially zero)
  5, // Length of the arrow
  0xff0000 // Color
);
//scene.add(arrowHelper);

// Create camera 
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(-1, 0.95, 4); 
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

//setup popup


//world
loadWorld()

let speed = 0;
let rotation=0;
let speedDelta=0.02//0.015;
let rotationDelta=0.008//0.006;

window.addEventListener('mousedown',onDocumentMouseDown,false);

function createVideoScreen(){
  const video = document.createElement('video');
  video.src = "/assets/trumpshoot.mov"; // Replace with your video file
  video.loop = true;
  video.muted = false; 
  video.play();
  const videoTexture = new THREE.VideoTexture(video);
  const videoMaterial = new THREE.MeshBasicMaterial({ map: videoTexture });
  const geometry = new THREE.PlaneGeometry(16, 9); // 16:9 aspect ratio
  const screen = new THREE.Mesh(geometry, videoMaterial);
  screen.scale.set(1, 1, 1); // Adjust the screen size
  screen.position.set(-1.2,10,35);
  screen.rotation.set(0,3.14,0)
  scene.add(screen);
}

function onDocumentMouseDown( event ) {
  event.preventDefault();
  setRaycast(event);
  const targetObjects = [];
  models.forEach((model) => {
  if(model.handleClick){
      model.model.traverse((child) => {
        if (child.isMesh) {
          child.modelId=model.id
          targetObjects.push(child);
        }
      })
    }
  })
  const intersects = raycaster.intersectObjects(targetObjects, true);
  console.log("innn",intersects.map((item)=>item.object.modelId));
  if(intersects.length>0){
    let model=models.find((item)=>item.id==intersects[0].object.modelId);
    model.handleClick();
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
  createVideoScreen()
  animate();

function animate() {
  requestAnimationFrame(animate);
  handlerHover();
  handleAnimations();
  firstPerson();
  handleAeroplane()
  renderer.render(scene, camera);
}

function handleAeroplane(){
  let trumpplane=models.find((model)=>model.id=="aeroplane")?.model
  if(trumpplane)
  {
    if(trumpplane.position.x>-150 && trumpplane.position.x<100)
    {
      trumpplane.position.x-=0.25;
    }
    else
    {
      trumpplane.position.x=99
    }
  } 
}

function showPopup(id){
  console.log("ppp",popups[id]);
  document.getElementById("popup-wrapper").style.transform="scale(1)";
  document.getElementById("popup-title").textContent=popups[id].title
  document.getElementById("popup-body").textContent=popups[id].body
}

function handleAnimations(){
  const delta = clock.getDelta();
  models.forEach((model) => {
    if (model.mixer) {
      model.mixer.update(delta);
    }
  });
}

function handlerHover(){
  const targetObjects = [];
  models.forEach((model) => {
  if(model.isHoverable){
      model.model.traverse((child) => {
        if (child.isMesh) {
          targetObjects.push(child);
        }
      })
    }
  })
  const intersects = raycaster.intersectObjects(targetObjects, true);
  if (intersects.length > 0) {
    intersects.forEach((intersect) => {
      const material = intersect.object.material;
      if (material && material.isMeshStandardMaterial) {
        material.emissive.set(material.color); 
        material.emissiveIntensity = 0.5; 
      }
    });
  } 
  else {
    targetObjects.forEach((obj) => {
      const material = obj.material;
      if (material && material.isMeshStandardMaterial) {
        material.emissive.set(material.color); 
        material.emissiveIntensity = 0.35;
      }
    });
  }
}

function firstPerson(){
  camera.rotation.set(0,camera.rotation.y+(3.14*rotationDelta*rotation),0);
  const forwardVector = new THREE.Vector3();  // Default forward vector in local space
  camera.getWorldDirection(forwardVector);  // Transform to world space
  forwardVector.normalize();
  camera.position.add(forwardVector.multiplyScalar(speed*speedDelta));
  raycaster.setFromCamera(mouse, camera);
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


function loadWorld(){
  //loadTrumpPlane('./assets/models/trumpplane.glb',{x:99,y:30,z:-40},{x:0,y:80,z:0},1)
  // loadWhiteHouse('./assets/models/whitehouse2.gltf',{x:0,y:0,z:0},undefined,1)
  //loadGLTFModel('./assets/models/plane.glb',{x:0,y:0,z:0},undefined,1)
  //loadGLTFModel()
  // loadGLTFModel('./assets/models/patch.gltf',{x:0,y:0,z:0},undefined,1)
  loadModelGLTF("aeroplane",'./assets/models/trumpplane.glb',{x:99,y:30,z:-40},{x:0,y:80,z:0},1);
  loadModelGLTF("patch",'./assets/models/plane.glb',{x:0,y:0,z:0},undefined,1);
  loadModelGLTF("walls",'./assets/models/walls.gltf',{x:0,y:0,z:0},undefined,1);
  loadModelGLTF("patch",'./assets/models/patch.gltf',{x:0,y:0,z:0},undefined,1,1);
  loadModelGLTF("ground",'./assets/models/plane2.gltf',{x:0,y:0,z:0},undefined,1,1,undefined,()=>window.open('https://www.trump.com/lifestyle/aviation', '_blank'));
  loadModelGLTF("whitehouse",'./assets/models/whitehouse2.gltf',{x:0,y:0,z:0},undefined,1,3,undefined,()=>window.open("https://www.whitehouse.gov", '_blank'),true);
  loadModelGLTF("trump",'./assets/models/trump.glb',{x:-1.5,y:0,z:-8},undefined,0.8,0,"Armature|mixamo.com|Layer0",()=>window.open("https://www.donaldjtrump.com", '_blank'));
  loadModelGLTF("text",'./assets/models/text.glb',{x:0,y:0,z:0},undefined,1,1,"rotate");
  loadModelGLTF("flag",'./assets/models/flag.glb',{x:-1.4,y:1,z:-11},undefined,1,2,"Armature|mixamo.com|Layer0_Armature");
  loadModelGLTF("frame1",'./assets/models/Frames/frame1.glb',{x:-4,y:0,z:-4},undefined,0.4,1,"Action",()=>showPopup(0),false);
  loadModelGLTF("frame2",'./assets/models/Frames/frame2.glb',{x:-3,y:0,z:-4},undefined,0.4,1,"Action",()=>showPopup(1),false);
  loadModelGLTF("frame3",'./assets/models/Frames/frame3.glb',{x:-1,y:0,z:-4},undefined,0.4,1,"Action",()=>showPopup(2),false);
  loadModelGLTF("frame4",'./assets/models/Frames/frame4.glb',{x:-1,y:0,z:-4},undefined,0.4,1,"Action",()=>showPopup(3),false);
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

function setRaycast(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
}

window.addEventListener('mousemove', setRaycast);

function initMobileControls(){
  let wKey=document.getElementById("w");
  wKey.addEventListener("mousedown",()=>speed=1);
  wKey.addEventListener("pointerdown",()=>speed=1);
  wKey.addEventListener("mouseup",()=>speed=0);
  wKey.addEventListener("pointerup",()=>speed=0);
  let sKey=document.getElementById("s");
  sKey.addEventListener("mousedown",()=>speed=-1);
  sKey.addEventListener("pointerdown",()=>speed=-1);
  sKey.addEventListener("mouseup",()=>speed=0);
  sKey.addEventListener("pointerup",()=>speed=0);
  let aKey=document.getElementById("a");
  aKey.addEventListener("mousedown",()=>rotation=1);
  aKey.addEventListener("pointerdown",()=>rotation=1);
  aKey.addEventListener("mouseup",()=>rotation=0);
  aKey.addEventListener("pointerup",()=>rotation=0);
  let dKey=document.getElementById("d");
  dKey.addEventListener("mousedown",()=>rotation=-1);
  dKey.addEventListener("pointerdown",()=>rotation=-1);
  dKey.addEventListener("mouseup",()=>rotation=0);
  dKey.addEventListener("pointerup",()=>rotation=0);
}

function loadModelGLTF(id,url, position,rotation, scale, index,animationName,handleClick,isHoverable) {
  const loader = new GLTFLoader();
  let model;
  loader.load(url, (gltf) => {
    model = gltf.scene;
    model.name=id;
    model.position.set(position.x,position.y,position.z);
    rotation?model.rotation.set(rotation.x,rotation.y,rotation.z):null;
    model.scale.set(scale, scale, scale);
    scene.add(model);
    const mixer = gltf.animations.length > 0 && animationName ? new THREE.AnimationMixer(model) : null;
    if (mixer) {
      gltf.animations.forEach((clip) => {
        console.log(id,clip);
        if (clip.name ===animationName) {
          const action = mixer.clipAction(clip);
          action.setLoop(THREE.LoopRepeat, Infinity); 
          action.play();
        } 
      })
      const action = mixer.clipAction(gltf.animations[0]);
      action.play();
      //objects[index] = { model, mixer };
    }
    models.push({id:id,model:model,mixer:mixer,handleClick:handleClick,isHoverable:isHoverable})
  });
}




