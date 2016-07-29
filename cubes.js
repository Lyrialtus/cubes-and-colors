'use strict';

class Animation {
  constructor() {
    this.scene = new THREE.Scene();
    this.camera = [];
    this.controls = [];
    this.renderer = [];
    this.mouse = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
    this.cubes = new THREE.Group();
    this.allVertices = [];
  }

  init() {

    // For N cubes (from 2 to 8)
    const CUBES_NUM = Math.floor(Math.random() * 7) + 2;

    // Camera
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    this.camera.position.z = 70 + CUBES_NUM * 10;

    // Navigation
    this.controls = new THREE.TrackballControls(this.camera);
    this.controls.rotateSpeed = 1.0;
    this.controls.zoomSpeed = 0.5;
    this.controls.panSpeed = 0.8;
    this.controls.noZoom = false;
    this.controls.noPan = false;
    this.controls.dynamicDampingFactor = 0.3;

    // Lights
    let directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
    directionalLight.position.set(0, 0.5, 1);
    this.scene.add(directionalLight);

    let AmbientLight = new THREE.AmbientLight(0x777777);
    this.scene.add(AmbientLight);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    let container = document.getElementById('container');
    container.appendChild(this.renderer.domElement);

    // Cubes
    for (let i = 0; i < CUBES_NUM; i++) {

      let cube = new THREE.Group();

      // Positions for the vertices
      let hidden = new THREE.BoxGeometry(10, 10, 10);
      let positions = hidden.vertices;

      // Vertices of the cube
      let cubeVertices = new THREE.Group();

      // Eight spheres in the loop
      for (let i = 0; i < positions.length; i++) {
        let geometry1 = new THREE.SphereGeometry(1, 16, 16);

        // Random colors
        let material1 = new THREE.MeshPhongMaterial({ color: Math.random() * 0xffffff });
        let sphere = new THREE.Mesh(geometry1, material1);
        sphere.position.set(positions[i].x, positions[i].y, positions[i].z);
        cubeVertices.add(sphere);
      }

      // Raycaster will use it
      this.allVertices.push(...cubeVertices.children);

      // Edges of the cube: four cylinders for y-axis
      let geometry2 = new THREE.CylinderGeometry(0.5, 0.5, 10, 32);
      let material2 = new THREE.MeshPhongMaterial({ color: 0x777777 });

      let cylinder = new THREE.Mesh(geometry2, material2); // 1
      cylinder.translateX(5);
      cylinder.translateZ(5);
      let edgesY = new THREE.Group();
      edgesY.add(cylinder);

      cylinder = cylinder.clone(); // 2
      cylinder.translateZ(-10);
      edgesY.add(cylinder);

      cylinder = cylinder.clone(); // 3
      cylinder.translateX(-10);
      edgesY.add(cylinder);

      cylinder = cylinder.clone(); // 4
      cylinder.translateZ(10);
      edgesY.add(cylinder);

      // Adding edges for x-axis
      let edgesX = edgesY.clone();
      edgesX.rotateZ(Math.PI / 2);

      // Adding edges for z-axis
      let edgesZ = edgesY.clone();
      edgesZ.rotateX(Math.PI / 2);

      // Final composition of the cube
      cube.add(cubeVertices, edgesX, edgesY, edgesZ);

      cube.position.y = Math.random() * 60 - 30;
      cube.position.z = Math.random() * 60 - 30;
      cube.position.x = i * 20 - CUBES_NUM * 10;

      cube.rotation.x = Math.random() * 2 * Math.PI;
      cube.rotation.y = Math.random() * 2 * Math.PI;
      cube.rotation.z = Math.random() * 2 * Math.PI;

      this.cubes.add(cube);
    }

    this.scene.add(this.cubes);

    // Useful option
    window.addEventListener('resize', this.onWindowResize, false);

    // For clicks
    document.addEventListener('mousedown', this.onDocumentMouseDown, false);

    // For touches
    document.addEventListener('touchstart', this.onDocumentTouchStart, false);
  }

  onWindowResize() {
    animation.camera.aspect = window.innerWidth / window.innerHeight;
    animation.camera.updateProjectionMatrix();
    animation.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  onDocumentTouchStart(event) {
    event.preventDefault();
    event.clientX = event.touches[0].clientX;
    event.clientY = event.touches[0].clientY;
    animation.onDocumentMouseDown(event);
  }

  onDocumentMouseDown(event) {
    event.preventDefault();

    animation.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    animation.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Raycasting and coloring
    animation.raycaster.setFromCamera(animation.mouse, animation.camera);
    let intersects = animation.raycaster.intersectObjects(animation.allVertices);

    if (intersects.length > 0) {
      let col = intersects[0].object.material.color;
      let parentCube = intersects[0].object.parent.parent;
      parentCube.children[1].children[0].material.color.set(col);
    }
  }

  animate() {
    requestAnimationFrame(animation.animate);
    animation.render();
  }

  render() {

    for (let i = 0; i < this.cubes.children.length; i++) {

      // Independent rotation
      this.cubes.children[i].rotation.x += -0.002;
      this.cubes.children[i].rotation.y += -0.002;
      this.cubes.children[i].rotation.z += -0.002;
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}

let animation = new Animation();
animation.init();
animation.animate();
