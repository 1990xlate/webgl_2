import * as THREE from "./three.js-dev/build/three.module.js";
import { OBJLoader } from "./three.js-dev/examples/jsm/loaders/OBJLoader.js";
import { GUI } from "./three.js-dev/examples/jsm/libs/dat.gui.module.js";
import { StereoEffect } from "./three.js-dev/examples/jsm/effects/StereoEffect.js";


export function example_ieva() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
   const renderer = new THREE.WebGLRenderer();
  const loader = new THREE.TextureLoader();
  const effect = new StereoEffect(renderer);
  const gui = new GUI();
  const gui_container = gui.addFolder("Morph animations");


let params = {
    ball: 0,
    bow: 0,
  };

  let windowHalfX = window.innerWidth/2;
  let windowHalfY = window.innerHeighth/2;

  let is_key_down = false;


  //const geometry = new THREE.SphereGeometry();
   const geometry = new setMorphTargets();
  renderer.setSize(window.innerWidth,window.innerHeight);

  let object;
 
  renderer.setPixelRatio(window.devicePixelRatio);

//light
  const ambientLight = new THREE.AmbientLight(0xfcf3cf, 1);
  scene.add(ambientLight);

//loadmodel+texture
  const manager = new THREE.LoadingManager(loadModel);
  const texture_loader = new THREE.TextureLoader(manager);
  const texture = texture_loader.load('./tex2.jpg');

let uniform = {
time : {value: 1}
  };

//material
const material = new THREE.MeshPhongMaterial({
    color: "#ffcccc",
morphTargets: true,
  });


  const material1 = new THREE.ShaderMaterial({
uniforms: uniform,
    vertexShader: document.getElementById("vertexShader").textContent,
    fragmentShader: document.getElementById("fragmentShader").textContent
  });

//obj
  const object_loader = new OBJLoader(manager);
  object_loader.load('./obj.obj', function (obj) {
    object = obj;
  }, onProgress, onError);


///cube
const cube = new THREE.Mesh(geometry, material);
cube.scale.set(10, 10, 10);
cube.position.z = -40; 
 cube.position.y = 0;
  camera.position.z = 0;

  scene.add(cube);

 
//gui
 gui_container
    .add(params, "ball", 0, 15)
    .step(0.001)
    .onChange(function (value) {
      cube.morphTargetInfluences[0] = value;

    });

     gui_container
    .add(params, "bow", 0, 15)
    .step(0.001)
    .onChange(function (value) {
      cube.morphTargetInfluences[1] = value;

    });

  gui_container.open();

   var i_counter = 0;
  var count_down = false;

//other box
const geometry1 = new THREE.BoxGeometry(20,20,20);
  const cube1 = new THREE.Mesh(geometry1,material1);
  cube1.position.z = -60;    
  cube1.position.y = -20;

  scene.add(cube1);






  //Animation loop
  renderer.setAnimationLoop(function () {

  cube1.rotation.x += Math.PI/180;
  cube1.rotation.y += Math.PI/180;
  cube1.rotation.z += Math.PI/180;
  //cube.morphTargetInfluences[0] = i_counter;
  //cube.morphTargetInfluences[1] = i_counter;
  uniform["time"].vlaue = performance.now() / 1000;

    effect.render(scene,camera);
  });

  document.body.appendChild(renderer.domElement);

  //Functions
  function loadModel() {
   object.traverse(function (child) {
     //traverse
     if (child.isMesh) {
       child.material.map = texture;
   }
    });
   object.scale.set(1,1,1);
    object.position.z = -60;    
    object.position.y = -20;
    object.rotation.x = - Math.PI / 2;

    scene.add(object);

    
  }

  //On progress
  function onProgress(xhr) {
    if (xhr.lengthComputable) {
      const loading_completed = xhr.loaded / xhr.total / 100;
      console.log('Model ' + Math.round(loading_completed, 2) + '% loaded.');
    }
  }

  //On error
  function onError(err) {
    console.log(err);
  }


  function setMorphTargets() {
    const geometry = new THREE.BoxBufferGeometry(1, 1, 1, 32, 32, 32);
    geometry.morphAttributes.position = [];
    const positions = geometry.attributes.position.array;

    const spherePositions = [];
    const twistPositions = [];

    const direction = new THREE.Vector3(1, 0, 0).normalize();
    const vertex = new THREE.Vector3();

    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      const z = positions[i + 2];

      spherePositions.push(
        x * Math.sqrt(1 - (y * y / 2) - (z * z / 2) + (y * y * z * z / 3)),
        y * Math.sqrt(1 - (z * z / 2) - (x * x / 2) + (z * z * x * x / 3)),
        z * Math.sqrt(1 - (x * x / 2) - (y * y / 2) + (x * x * y * y / 3))
      );

      vertex.set(x * 2, y, z);
      vertex
        .applyAxisAngle(direction, (Math.PI * x / 2))
        .toArray(twistPositions, twistPositions.length);

    }

    geometry.morphAttributes.position[0] = new THREE.Float32BufferAttribute(
      spherePositions,
      3
    );
    geometry.morphAttributes.position[1] = new THREE.Float32BufferAttribute(
      twistPositions,
      3
    );

    return geometry;
  }

  document.addEventListener("keydown", function(event){
    let keyCode = event.which;
    let delta = 1;

    if(keyCode ==65){ //a
      object.position.x -=delta;
      
    }

    if(keyCode ==83){ //s
      object.position.y -=delta;
    }

    if(keyCode ==68){ //d
      object.position.x +=delta;
    }

    if(keyCode ==87){ //w
      object.position.y +=delta;
    }
  

  is_key_down = true;
    //console.log(keyCode);
  });
}
