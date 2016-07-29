'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var scene = void 0;
var camera = void 0;
var renderer = void 0;
var controls = void 0;
var raycaster = void 0;
var mouse = void 0;
var cubes = void 0;

var Animation = function () {
  function Animation() {
    _classCallCheck(this, Animation);
  }

  _createClass(Animation, [{
    key: 'init',
    value: function init() {

      // For N cubes (from 2 to 8)
      var CUBES_NUM = Math.floor(Math.random() * 7) + 2;

      // Scene and camera
      scene = new THREE.Scene();

      camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
      camera.position.z = 70 + CUBES_NUM * 10;

      // Navigation
      controls = new THREE.TrackballControls(camera);
      controls.rotateSpeed = 1.0;
      controls.zoomSpeed = 0.5;
      controls.panSpeed = 0.8;
      controls.noZoom = false;
      controls.noPan = false;
      controls.dynamicDampingFactor = 0.3;

      // Lights
      var directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
      directionalLight.position.set(0, 0.5, 1);
      scene.add(directionalLight);

      var AmbientLight = new THREE.AmbientLight(0x777777);
      scene.add(AmbientLight);

      // Renderer
      renderer = new THREE.WebGLRenderer({ alpha: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      var container = document.getElementById('container');
      container.appendChild(renderer.domElement);

      // Cubes
      cubes = new THREE.Group();

      for (var i = 0; i < CUBES_NUM; i++) {

        var cube = new THREE.Group();

        // Positions for the vertices
        var hidden = new THREE.BoxGeometry(10, 10, 10);
        var positions = hidden.vertices;

        // Vertices of the cube
        var cubeVertices = new THREE.Group();

        // Eight spheres in the loop
        for (var _i = 0; _i < positions.length; _i++) {
          var geometry1 = new THREE.SphereGeometry(1, 16, 16);

          // Random colors!
          var material1 = new THREE.MeshPhongMaterial({ color: Math.random() * 0xffffff });
          var sphere = new THREE.Mesh(geometry1, material1);
          sphere.position.set(positions[_i].x, positions[_i].y, positions[_i].z);
          cubeVertices.add(sphere);
        }

        // Edges of the cube
        var cubeEdges = new THREE.Group();

        // Four cylinders for y-axis
        var geometry2 = new THREE.CylinderGeometry(0.5, 0.5, 10, 32);
        var material2 = new THREE.MeshPhongMaterial({ color: 0x777777 });

        var cylinder = new THREE.Mesh(geometry2, material2); // 1
        cylinder.translateX(5);
        cylinder.translateZ(5);
        var edgeY = new THREE.Group();
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
        var edgeX = edgeY.clone();
        edgeX.rotateZ(Math.PI / 2);

        // Adding edges for z-axis
        var edgeZ = edgeY.clone();
        edgeZ.rotateX(Math.PI / 2);

        // Final composition of the cube
        cubeEdges.add(edgeX, edgeY, edgeZ);
        cube.add(cubeVertices, cubeEdges);

        cube.position.y = Math.random() * 60 - 30;
        cube.position.z = Math.random() * 60 - 30;
        cube.position.x = i * 20 - CUBES_NUM * 10;

        cube.rotation.x = Math.random() * 2 * Math.PI;
        cube.rotation.y = Math.random() * 2 * Math.PI;
        cube.rotation.z = Math.random() * 2 * Math.PI;

        cubes.add(cube);
      }

      scene.add(cubes);

      // Useful option
      window.addEventListener('resize', this.onWindowResize, false);

      // Edge coloring
      raycaster = new THREE.Raycaster();
      mouse = new THREE.Vector2();
      document.addEventListener('mousedown', this.onDocumentMouseDown, false);

      // For touches
      document.addEventListener('touchstart', this.onDocumentTouchStart, false);
    }
  }, {
    key: 'onWindowResize',
    value: function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
  }, {
    key: 'onDocumentTouchStart',
    value: function onDocumentTouchStart(event) {
      event.preventDefault();
      event.clientX = event.touches[0].clientX;
      event.clientY = event.touches[0].clientY;
      onDocumentMouseDown(event);
    }
  }, {
    key: 'onDocumentMouseDown',
    value: function onDocumentMouseDown(event) {
      event.preventDefault();
      mouse.x = event.clientX / window.innerWidth * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      // Tricky raycasting!
      raycaster.setFromCamera(mouse, camera);
      var intersect = [];
      var number = [];
      for (var i = 0; i < cubes.children.length; i++) {

        var intersects = raycaster.intersectObject(cubes.children[i].children[0], true);

        if (intersects.length > 0) {
          intersect.push(intersects[0]);
          number.push(i);
        }
      }

      var col = void 0;
      if (intersect.length === 1) {
        // Simple case
        col = intersect[0].object.material.color;
        cubes.children[number].children[1].children[0].children[0].material.color.set(col);
      } else if (intersect.length > 1) {
        // Prevention of simultaneous coloring
        if (intersect[0].distance > intersect[1].distance) {
          col = intersect[intersect.length - 1].object.material.color;
          cubes.children[number[number.length - 1]].children[1].children[0].children[0].material.color.set(col);
        } else {
          col = intersect[0].object.material.color;
          cubes.children[number[0]].children[1].children[0].children[0].material.color.set(col);
        }
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

      for (var i = 0; i < cubes.children.length; i++) {

        // Independent rotation
        cubes.children[i].rotation.x += -0.002;
        cubes.children[i].rotation.y += -0.002;
        cubes.children[i].rotation.z += -0.002;
      }

      controls.update();
      renderer.render(scene, camera);
    }
  }]);

  return Animation;
}();

var animation = new Animation();
animation.init();
animation.animate();