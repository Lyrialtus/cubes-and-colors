'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Animation = function () {
  function Animation() {
    _classCallCheck(this, Animation);

    this.scene = new THREE.Scene();
    this.camera = [];
    this.controls = [];
    this.renderer = [];
    this.mouse = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
    this.cubes = new THREE.Group();
    this.allVertices = [];
  }

  _createClass(Animation, [{
    key: 'init',
    value: function init() {
      // For N cubes (from 2 to 8)
      var CUBES_NUM = Math.floor(Math.random() * 7) + 2;

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
      var directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
      directionalLight.position.set(0, 0.5, 1);
      this.scene.add(directionalLight);

      var AmbientLight = new THREE.AmbientLight(0x777777);
      this.scene.add(AmbientLight);

      // Renderer
      this.renderer = new THREE.WebGLRenderer({ alpha: true });
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      var container = document.getElementById('container');
      container.appendChild(this.renderer.domElement);

      // Cubes
      for (var i = 0; i < CUBES_NUM; i++) {
        var _allVertices;

        var cube = new THREE.Group();

        // Positions for the vertices
        var hidden = new THREE.BoxGeometry(10, 10, 10);
        var positions = hidden.vertices;

        // Vertices of the cube
        var cubeVertices = new THREE.Group();

        // Eight spheres in the loop
        for (var _i = 0; _i < positions.length; _i++) {
          var geometry1 = new THREE.SphereGeometry(1, 16, 16);

          // Random colors
          var material1 = new THREE.MeshPhongMaterial({ color: Math.random() * 0xffffff });
          var sphere = new THREE.Mesh(geometry1, material1);
          sphere.position.set(positions[_i].x, positions[_i].y, positions[_i].z);
          cubeVertices.add(sphere);
        }

        // Raycaster will use it
        (_allVertices = this.allVertices).push.apply(_allVertices, _toConsumableArray(cubeVertices.children));

        // Edges of the cube: four cylinders for y-axis
        var geometry2 = new THREE.CylinderGeometry(0.5, 0.5, 10, 32);
        var material2 = new THREE.MeshPhongMaterial({ color: 0x777777 });

        var cylinder = new THREE.Mesh(geometry2, material2); // 1
        cylinder.translateX(5);
        cylinder.translateZ(5);
        var edgesY = new THREE.Group();
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
        var edgesX = edgesY.clone();
        edgesX.rotateZ(Math.PI / 2);

        // Adding edges for z-axis
        var edgesZ = edgesY.clone();
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
      window.addEventListener('resize', this.onWindowResize.bind(this), false);

      // For clicks
      document.addEventListener('mousedown', this.onDocumentMouseDown.bind(this), false);

      // For touches
      document.addEventListener('touchstart', this.onDocumentTouchStart.bind(this), false);
    }
  }, {
    key: 'onWindowResize',
    value: function onWindowResize() {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
  }, {
    key: 'onDocumentTouchStart',
    value: function onDocumentTouchStart(event) {
      event.preventDefault();
      event.clientX = event.touches[0].clientX;
      event.clientY = event.touches[0].clientY;
      this.onDocumentMouseDown(event);
    }
  }, {
    key: 'onDocumentMouseDown',
    value: function onDocumentMouseDown(event) {
      event.preventDefault();
      this.mouse.x = event.clientX / window.innerWidth * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      // Raycasting and coloring
      this.raycaster.setFromCamera(this.mouse, this.camera);
      var intersects = this.raycaster.intersectObjects(this.allVertices);

      if (intersects.length > 0) {
        var col = intersects[0].object.material.color;
        var parentCube = intersects[0].object.parent.parent;
        parentCube.children[1].children[0].material.color.set(col);
      }
    }
  }, {
    key: 'animate',
    value: function animate() {
      requestAnimationFrame(this.animate.bind(this));
      this.render();
    }
  }, {
    key: 'render',
    value: function render() {
      for (var i = 0; i < this.cubes.children.length; i++) {

        // Independent rotation
        this.cubes.children[i].rotation.x += -0.002;
        this.cubes.children[i].rotation.y += -0.002;
        this.cubes.children[i].rotation.z += -0.002;
      }

      this.controls.update();
      this.renderer.render(this.scene, this.camera);
    }
  }]);

  return Animation;
}();

var animation = new Animation();
animation.init();
animation.animate();