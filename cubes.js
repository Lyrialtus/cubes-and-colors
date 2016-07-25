let scene;
let camera;
let renderer;
let controls;
let raycaster;
let mouse;
let cubes;

init();
animate();

function init() {

  // For N cubes (from 2 to 8, more 8)
  let num = Math.floor(Math.random() * 10) + 2;
  if (num > 7) {
    num = 8;
  }

  // Scene and camera
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.z = 70 + num * 10;

  // Navigation
  controls = new THREE.TrackballControls(camera);
  controls.rotateSpeed = 1.0;
  controls.zoomSpeed = 0.5;
  controls.panSpeed = 0.8;
  controls.noZoom = false;
  controls.noPan = false;
  controls.dynamicDampingFactor = 0.3;

  // Lights
  let directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
  directionalLight.position.set(0, 0.5, 1);
  scene.add(directionalLight);

  let AmbientLight = new THREE.AmbientLight(0x777777);
  scene.add(AmbientLight);

  // Renderer
  renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  let container = document.getElementById('container');
  container.appendChild(renderer.domElement);

  // Cubes
  cubes = new THREE.Group();

  for (let j = 0; j < num; j++) {

    let cube = new THREE.Group();

    // Positions for the vertices
    let hidden = new THREE.BoxGeometry(10, 10, 10);
    let positions = hidden.vertices;

    // Vertices of the cube
    let cubeVertices = new THREE.Group();

    // Eight spheres in the loop
    for (let i = 0; i < positions.length; i++) {
      let geometry1 = new THREE.SphereGeometry(1, 16, 16);

      // Random colors!
      let material1 = new THREE.MeshPhongMaterial({ color: Math.random() * 0xffffff });
      let sphere = new THREE.Mesh(geometry1, material1);
      sphere.position.set(positions[i].x, positions[i].y, positions[i].z);
      cubeVertices.add(sphere);
    }

    // Edges of the cube
    let cubeEdges = new THREE.Group();

    // Four cylinders for y-axis
    let geometry2 = new THREE.CylinderGeometry(0.5, 0.5, 10, 32);
    let material2 = new THREE.MeshPhongMaterial({ color: 0x777777 });

    let cylinder = new THREE.Mesh(geometry2, material2); // 1
    cylinder.translateX(5);
    cylinder.translateZ(5);
    let edgeY = new THREE.Group();
    edgeY.add(cylinder);

    cylinder = cylinder.clone(); // 2
    cylinder.translateZ(-10);
    edgeY.add(cylinder);

    cylinder = cylinder.clone(); // 3
    cylinder.translateX(-10);
    edgeY.add(cylinder);

    cylinder = cylinder.clone(); // 4
    cylinder.translateZ(10);
    edgeY.add(cylinder);

    // Adding edges for x-axis
    let edgeX = edgeY.clone();
    edgeX.rotateZ(Math.PI / 2);

    // Adding edges for z-axis
    let edgeZ = edgeY.clone();
    edgeZ.rotateX(Math.PI / 2);

    // Final composition of the cube
    cubeEdges.add(edgeX, edgeY, edgeZ);
    cube.add(cubeVertices, cubeEdges);

    cube.position.y = Math.random() * 60 - 30;
    cube.position.z = Math.random() * 60 - 30;
    cube.position.x = j * 20 - num * 10;

    cube.rotation.x = Math.random() * 2 * Math.PI;
    cube.rotation.y = Math.random() * 2 * Math.PI;
    cube.rotation.z = Math.random() * 2 * Math.PI;

    cubes.add(cube);
  }

  scene.add(cubes);

  // Useful option
  window.addEventListener('resize', onWindowResize, false);

  // Edge coloring
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();
  document.addEventListener('mousedown', onDocumentMouseDown, false);

  // For touches
  document.addEventListener('touchstart', onDocumentTouchStart, false);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentTouchStart(event) {
  event.preventDefault();
  event.clientX = event.touches[0].clientX;
  event.clientY = event.touches[0].clientY;
  onDocumentMouseDown(event);
}

function onDocumentMouseDown(event) {
  event.preventDefault();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Tricky raycasting!
  raycaster.setFromCamera(mouse, camera);
  let intersect = [];
  let number = [];
  for (let l = 0; l < cubes.children.length; l++) {

    let intersects = raycaster.intersectObject(cubes.children[l].children[0], true);

    if (intersects.length > 0) {
      intersect.push(intersects[0]);
      number.push(l);
    }
  }

  let col;
  if (intersect.length == 1) {
    // Simple case
    col = intersect[0].object.material.color;
    cubes.children[number].children[1].children[0].children[0].material.color.set(col);
  } else if (intersect.length > 1) {
    // Prevention of simultaneous coloring
    if (intersect[0].distance > intersect[1].distance) {
      col = intersect[intersect.length - 1].object.material.color;
      cubes.children[number[number.length - 1]].children[1]
          .children[0].children[0].material.color.set(col);
    } else {
      col = intersect[0].object.material.color;
      cubes.children[number[0]].children[1].children[0].children[0].material.color.set(col);
    }
  }

}

function animate() {
  requestAnimationFrame(animate);
  render();
}

function render() {

  for (let k = 0; k < cubes.children.length; k++) {

    // Independent rotation
    cubes.children[k].rotation.x += -0.002;
    cubes.children[k].rotation.y += -0.002;
    cubes.children[k].rotation.z += -0.002;
  }

  controls.update();
  renderer.render(scene, camera);
}
