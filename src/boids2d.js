// ----------------------------------------------------------------------------------------------------
// Flocking in 2D
//    by Ben Taylor
//
// Demonstrates flocking behavior using "fish" (boids).
// Parameters for cohesion, avoidance, and alignment can be adjusted to get new flocking behavior.
//
// Based on Craig Reynold's 'Boids' program: https://www.red3d.com/cwr/boids/
// Thank you to Daniel Shiffman, whose flocking implementation I referenced in the creation
// of my own: https://processing.org/examples/flocking.html
// ----------------------------------------------------------------------------------------------------

// Import three.js
import * as THREE from 'three';

// Define our camera, scene, and renderer.
let camera, scene, renderer;
// Define the group of fish that will exhibit flocking behavior.
let fishies;

// Number of fish to display.
const numFish = 150;
// The size of each fish.
const fishSize = 7;

// Define the bounds of the animation.
// This includes the margin area that fish should try to avoid with strength according to the boundaryStrength parameter.
const boundaryWidth = 640;
const boundaryHeight = 320;
const boundaryMargin = 10;
const boundaryStrength = 6.5;

// Defines how far away a fish will be able to "see" other fish--used for cohesion.
const cohesionRadius = 40;
const cohesionStrength = 1.5;
// Defines how far away a neighbor needs to be from a fish before the fish matches velocities.
const alignmentRadius = 40;
const alignmentStrength = 1.0;
// Defines the avoidance radius--the area surrounding each fish that other fish will try to avoid.
const avoidanceRadius = 25;
const avoidanceStrength = 4.0;
// Defines the maximum velocity for a fish as well as the maximum force that can be applied in a single frame.
const maxFishSpeed = 4;
const maxFishForce = 0.04;

// Create the state of the scene and start the animation.
init();
animate();

// Sets up all of the parts needed to render the scene.
function init() {
    // Create the camera.
    camera = new THREE.OrthographicCamera(boundaryWidth * -1 + boundaryMargin, boundaryWidth - boundaryMargin, boundaryHeight - boundaryMargin, boundaryHeight * -1 + boundaryMargin, 1, 1000);
    // Adjust the camera's position.
    camera.position.z = 1;

    // Create the scene.
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0B1D51);

    // Function to create a new fish with a random starting position and velocity.
    function newFish(color) {
        // Create the fish mesh, represented by a triangle for now.
        const shape = new THREE.Shape();
        const x = 0;
        const y = 0;
        shape.moveTo(x - fishSize, y - fishSize);
        shape.lineTo(x + fishSize, y - fishSize);
        shape.lineTo(x, y + fishSize * 1.5);
        const geometry = new THREE.ShapeGeometry(shape);
        const material = new THREE.MeshBasicMaterial({color: color});
        const fish = new THREE.Mesh(geometry, material);
        
        // Add the fish to the scene.
        scene.add(fish);

        // Give the fish a random position and velocity in a random direction, as well as zero acceleration.
        fish.position.x = Math.floor(Math.random() * boundaryWidth) * (Math.random() < 0.5 ? -1 : 1);
        fish.position.y = Math.floor(Math.random() * boundaryHeight) * (Math.random() < 0.5 ? -1 : 1);
        let angle = Math.random() * 2 * Math.PI;
        fish.velocity = new THREE.Vector3(Math.cos(angle), Math.sin(angle));
        fish.acceleration = new THREE.Vector3(0, 0, 0);
        fish.rotation.z = Math.atan(fish.velocity.y / fish.velocity.x) - Math.PI / 2 * Math.sign(fish.velocity.x);

        // Return the new fish.
        return fish;
    }

    // Create a list of all the fish in the scene, including a special fish that is colored differently.
    fishies = [];
    for (let i = 0; i < numFish - 1; i++) {
        fishies.push(newFish(0xffffff));
    }
    fishies.push(newFish(0xFCA311));

    // Create the renderer.
    renderer = new THREE.WebGLRenderer({antialias: true, canvas: document.getElementById("canvas")});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);

    // Listen for window resizes.
    window.addEventListener('resize', onWindowResize);
}

// Helper function to adjust camera aspect ratio and renderer size when window size changes.
function onWindowResize() {
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
    // Logic for updating the position of each fish and rendering them.
    fishies.forEach((fish) => {
        // Compute the forces to apply to the fish, then scale them accordingly.
        let cohesionForce = cohesion(fish);
        let avoidanceForce = avoid(fish);
        let alignmentForce = align(fish);
        //let boundaryForce = boundaries(fish);
        cohesionForce.multiplyScalar(cohesionStrength);
        avoidanceForce.multiplyScalar(avoidanceStrength);
        alignmentForce.multiplyScalar(alignmentStrength);
        //boundaryForce.multiplyScalar(boundaryStrength);

        // Update fish acceleration, velocity, position, and rotation.
        // Acceleration
        fish.acceleration.add(cohesionForce);
        fish.acceleration.add(avoidanceForce);
        fish.acceleration.add(alignmentForce);
        //fish.acceleration.add(boundaryForce);
        // Velocity
        fish.velocity.add(fish.acceleration);
        fish.velocity.clampScalar(-maxFishSpeed, maxFishSpeed);
        // Position
        fish.position.add(fish.velocity);
        // Rotation
        fish.rotation.z = Math.atan(fish.velocity.y / fish.velocity.x) - Math.PI / 2 * Math.sign(fish.velocity.x);
        
        // Reset fish acceleration.
        fish.acceleration.multiplyScalar(0);

        // If the fish just crossed a boundary, move them to the opposite side.
        if (fish.position.x > boundaryWidth || fish.position.x < -boundaryWidth) {
            fish.position.x *= -1;
        }
        if (fish.position.y > boundaryHeight || fish.position.y < -boundaryHeight) {
            fish.position.y *= -1;
        }
    });

    renderer.render(scene, camera);
}

// Ensure that fish stay within bounds. (Unused currently)
function boundaries(fish) {
    let steer = new THREE.Vector3(0, 0, 0);
    if (fish.position.x - boundaryMargin < -boundaryWidth) {
        steer.add(new THREE.Vector3(1, 0, 0));
    }
    if (fish.position.x + boundaryMargin > boundaryWidth) {
        steer.add(new THREE.Vector3(-1, 0, 0));
    }
    if (fish.position.y + boundaryMargin > boundaryHeight) {
        steer.add(new THREE.Vector3(0, -1, 0));
    }
    if (fish.position.y - boundaryMargin < -boundaryHeight) {
        steer.add(new THREE.Vector3(0, 1, 0));
    }
    steer.clampScalar(-maxFishForce, maxFishForce);
    return steer;
}

// Coherence implementation--steer fish toward the average position of all its neighbors.
function cohesion(fish) {
    let count = 0;
    let sum = new THREE.Vector3(0, 0, 0);
    fishies.forEach((other) => {
        let dist = fish.position.distanceTo(other.position);
        if (dist > 0 && dist < cohesionRadius + (fishSize * 2)) {
            // Add the other fish's position to the positional sum.
            count++;
            sum.add(other.position);
        }
    });
    // If we need to steer to align with neighbors, then calculate the force to apply.
    if (count > 0) {
        // Find the average position to move towards.
        sum.divideScalar(count);
        // Find the direction that the fish wants to move.
        let desired = sum.sub(fish.position);
        // Turn this into a velocity vector.
        desired.normalize();
        desired.multiplyScalar(maxFishSpeed);

        // Calculate the steering force to apply, which is just the desired velocity minus the current velocity.
        let steer = desired.sub(fish.velocity);
        steer.clampScalar(-maxFishForce, maxFishForce);
        return steer;
    }
    else {
        return sum;
    }
}

// Avoidance implementation--steer fish away from one another when they get too close.
function avoid(fish) {
    let count = 0;
    let steer = new THREE.Vector3(0, 0, 0);
    fishies.forEach((other) => {
        // Get the distance between the fish and possible neighbors.
        let dist = fish.position.distanceTo(other.position);
        // If the neighbor is close enough, then avoid it.
        if (dist > 0 && dist < avoidanceRadius) {
            // Compute the difference between the two fish's positions.
            let diff = new THREE.Vector3().subVectors(fish.position, other.position);
            diff.normalize();
            diff.divideScalar(dist);
            steer.add(diff);
            count++;
        }
    });
    // Get the average steering vector.
    if (count > 0) {
        steer.divideScalar(count);
    }

    // If the magnitude of the steering vector is not zero, then compute the force to apply.
    let mag = Math.sqrt(Math.pow(steer.x, 2) + Math.pow(steer.y, 2) + Math.pow(steer.z, 2));
    if (mag > 0) {
        steer.normalize();
        steer.multiplyScalar(maxFishSpeed);
        steer.sub(fish.velocity);
        steer.clampScalar(-maxFishForce, maxFishForce);
    }
    return steer;
}

// Alignment implementation--maintain velocity consistent with neighbors.
function align(fish) {
    let count = 0;
    let sum = new THREE.Vector3(0, 0, 0);
    fishies.forEach((other) => {
        let dist = fish.position.distanceTo(other.position);
        if (dist > 0 && dist < alignmentRadius) {
            // Add the other fish's velocity to the total sum.
            count++;
            sum.add(other.velocity);
        }
    });
    if (count > 0) {
        sum.divideScalar(count);
        sum.normalize();
        sum.multiplyScalar(maxFishSpeed);
        let steer = sum.sub(fish.velocity);
        steer.clampScalar(-maxFishForce, maxFishForce);
        return steer;
    }
    return sum;
}
