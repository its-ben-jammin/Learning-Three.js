// Import three.js
import * as THREE from 'three';

// Define our camera, scene, and renderer.
let camera, scene, renderer;
// Define the cubes that will be rendered.
let cubes;
// Get the time, used for animation.
const start = Date.now();

// Create the state of the scene and start the animation.
init();
animate();

// Sets up all of the parts needed to render the scene.
function init() {
    // Create the camera.
    const fov = 75;
    const aspect = window.innerWidth / window.innerHeight;
    const near = 1;
    const far = 1000;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    // Adjust the camera's position.
    camera.position.y = 150;
    camera.position.z = 500;

    // Create the scene.
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    // Add some lights to the scene.
    const light1 = new THREE.PointLight(0xfadabb, 1);
    light1.position.set(0, 0, 500);
    scene.add(light1);
    const light2 = new THREE.PointLight(0xfadabb, 0.5);
    light2.position.set(0, 500, 0);
    scene.add(light2);

    // Function to make an instance of a given geometry with the specified color and position.
    function makeInstance(geometry, color, x) {
        const material = new THREE.MeshNormalMaterial({color});
        const object = new THREE.Mesh(geometry, material);
        scene.add(object);
        
        object.position.x = x;
        
        return object;
    }

    // Make some cubes to populate our scene.
    const geometry = new THREE.BoxGeometry(100, 100, 100);
    cubes = [
        makeInstance(geometry, 0x6d3da8, -600),
        makeInstance(geometry, 0x2c5aa3, -300),
        makeInstance(geometry, 0x35cc92, 0),
        makeInstance(geometry, 0xf0e21f, 300),
        makeInstance(geometry, 0xd62d41, 600)
    ];

    // Create the renderer.
    renderer = new THREE.WebGLRenderer({antialias: true, canvas: document.getElementById("canvas")});
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Listen for window resizes.
    window.addEventListener('resize', onWindowResize);
}

// Helper function to adjust camera aspect ratio and renderer size when window size changes.
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Animation control. Continuously calls render() and gets the next frame to display.
function animate() {
    // Request next animation frame.
    requestAnimationFrame(animate);

    // Render the next scene.
    render();
}

// Get the next frame of the animation to render.
function render() {
    let time = Date.now() - start;
    time *= 0.001;

    // Rotate each cube.
    cubes.forEach((cube, ndx) => {
        const speed = 1 + ndx * .4;
        const rot = time * speed;
        cube.rotation.x = rot;
        cube.rotation.y = rot;
        cube.position.y = Math.abs(Math.sin(time * speed)) * 300;
    });

    renderer.render(scene, camera);
}
