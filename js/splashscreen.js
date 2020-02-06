var domStart, scene, startSceneWidth, startSceneHeight, cameraStart, renderer, stars = [], directionalLight, xWing, idStart, done;
var scale, t = 0;

function initStart() {

    startSceneWidth = window.innerWidth;
    startSceneHeight = window.innerHeight;

    // Camera
    cameraStart = new THREE.PerspectiveCamera(45, startSceneWidth / startSceneHeight, 1, 1000);
    cameraStart.position.z = 5;

    window.addEventListener('resize', onWindowResizeStart, false);

    // Scene
    scene = new THREE.Scene();

    // Renderer
    renderer = new THREE.WebGLRenderer();
    
    // Set the size of the renderer
    renderer.setSize(startSceneWidth, startSceneHeight);
    domStart = document.getElementById('TutContainer');
    
    // Add the renderer to the html document body
    domStart.appendChild(renderer.domElement);
    
    // Add a light in the scene
    directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 3, -20);
    directionalLight.lookAt(new THREE.Vector3(0, 0, 0));
    scene.add(directionalLight);


}

function onWindowResizeStart() {
    // Resize & align
    startSceneHeight = window.innerHeight;
    startSceneWidth = window.innerWidth;
    renderer.setSize(startSceneWidth, startSceneHeight);
    cameraStart.aspect = startSceneWidth / startSceneHeight;
    cameraStart.updateProjectionMatrix();
}

function addXWing() {
    var objectLoader = new THREE.ObjectLoader();
    objectLoader.load("models/x-wing/star-wars-x-wing.json", function (obj) {
        xWing = obj;

        xWing.scale.x = xWing.scale.y = xWing.scale.z = 0.08;
        xWing.position.z = 2;
        xWing.position.y = -0.8;
        xWing.rotation.x = Math.PI;
        scene.add(xWing);
    });
}


function addSphere() {

    // The loop will move from z position of -1000 to z position 1000, adding a random particle at each position. 
    for (var z = -1000; z < 1000; z += 5) {

        // Make a sphere 
        var geometry = new THREE.SphereGeometry(0.3, 32, 32)
        var material = new THREE.MeshBasicMaterial({ color: 0xffffff });
        var sphere = new THREE.Mesh(geometry, material)

        // Random x and y positions between -500 and 500
        sphere.position.x = Math.random() * 1000 - 500;
        sphere.position.y = Math.random() * 1000 - 500;

        // z position to where it is in the loop
        sphere.position.z = z;

        
        sphere.scale.x = sphere.scale.y = 2;

        scene.add(sphere);

        stars.push(sphere);
    }
}

function animateStars() {

    // Loop through each star
    for (var i = 0; i < stars.length; i++) {
        star = stars[i];
        star.position.z += i / 25;
        if (star.position.z > 1000) star.position.z -= 2000;
    }

}

function animateXWing() {
    if (typeof (xWing) != "undefined") {
        scale = 2 / (3 - Math.cos(2 * t));
        xWing.position.x = 0.2 * scale * Math.cos(t);
        xWing.position.y = -0.8 + 0.2 * scale * Math.sin(2 * t) / 2;
    }
    t += 0.005;
    checkLoading();
}

function renderStart() {
    idStart = requestAnimationFrame(renderStart);
    renderer.render(scene, cameraStart);
    animateStars();
    animateXWing();
}

function startGame() {
    // Delete the current animation frame and starts the game
    domStart.removeChild(renderer.domElement);
    cancelAnimationFrame(idStart);
    init();
    
    // The game UI is now visible
    document.body.style.backgroundImage = "url(images/background.jpg);";
    document.getElementById("audioContainer").removeAttribute("style");
    document.getElementById("healthContainer").removeAttribute("style");
    document.getElementById("gameover-outer").removeAttribute("style");
    document.getElementById("score").removeAttribute("style");
    document.getElementById("highestScore").removeAttribute("style");
    document.getElementById("startContainer").style.display = "none";
    document.getElementById("audio").src = "music/Cantina%20Theme.mp3";
}

initStart();
addSphere();
addXWing();
renderStart();

function checkLoading() {
    // Waits for the X-Wing to be loaded in order to show the game logo
    if (typeof (xWing) != "undefined" && !done) {
        document.getElementById("logo").style.marginTop = "10%";
        document.getElementById("logo").style.visibility = "visible";
        document.getElementById("logo").style.opacity = 1;
        document.getElementById("delayed").style.visibility = "visible";
        document.getElementById("delayed").style.opacity = 1;
        done = true;
    }
}

document.getElementById("startButton").onclick = function () {
    startGame();
}