// Import three.js
import * as THREE from 'three';
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// Define our camera, scene, and renderer.
let camera, scene, renderer, controls, composer;

// Define a list of functions to plot.
let plotList = [];

// Create some of our constants (for now).
const dx = 0.08;
const dy = 0.5;
const bounds = 10;

// Create the state of the scene and then plot points.
init();
plot();
animate();

function init() {
    // Create the renderer.
    renderer = new THREE.WebGLRenderer({antialias: true, canvas: document.getElementById("canvas")});
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Create the camera.
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    // Create the camera controls.
    controls = new OrbitControls(camera, renderer.domElement);
    controls.autoRotate = true;
    // Adjust the camera's position.
    camera.position.set(bounds, bounds / 2, bounds);
    camera.lookAt(0, 0, 0);
    controls.update();

    // Create the scene.
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // Create the effect composer.
    composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass();
    composer.addPass(renderPass);
    composer.addPass(bloomPass);

    // Listen for window resizes.
    window.addEventListener('resize', onWindowResize);
}

// Helper function to adjust camera aspect ratio and renderer size when window size changes.
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Represents the equation that will be used to graph all points. Returns the z value, constrained to the bounds.
// Change this function to get different graphs.
function f(x, y) {
    let z = Math.cos(x) - Math.sin(y);
    //let z = Math.sqrt(5 - Math.pow(x, 2) - Math.pow(y, 2));
    return Math.min(Math.max(z, -bounds), bounds);
}

// Go ahead and plot all of our points.
function plot() {
    // Define the material used in the lines (really just changing the color).
    const lineMaterial = new THREE.LineBasicMaterial({color: 0xffffff});

    // Iterate through all possible x and y values given the bounds and dx/dy.
    for (let y = -bounds; y <= bounds; y += dy) {
        for (let x = -bounds + dx, prevPoint = new THREE.Vector3(-bounds, f(-bounds, y), y); x <= bounds; x += dx) {
            // Get the z value for the current x value and create a point.
            let z = f(x, y);
            let point = new THREE.Vector3(x, z, y);

            // If this point and the previous point are both at the boundary, then just ignore (to avoid straight lines at bounds).
            if (!(Math.abs(z) == bounds && Math.abs(prevPoint.y) == bounds)) {
                // Create the line between the previous point and the current point.
                const points = [point, prevPoint];
                const geometry = new THREE.BufferGeometry().setFromPoints(points);
                const line = new THREE.Line(geometry, lineMaterial);
                scene.add(line);
            }

            // Update the previous point.
            prevPoint = point;
        }
    }
}

// Animate so that we can use camera controls.
function animate() {
    requestAnimationFrame(animate);
	controls.update();
	composer.render();
}
