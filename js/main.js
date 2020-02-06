var sceneWidth;
var sceneHeight;
var camera;
var scene;
var renderer;
var dom;
var sun;
var ground;
var id;
//var orbitControl;
var rollingGroundSphere;
// var heroSphere;

// BB8 model variables
var body, head, headBase, antenna, smallAntenna, eye, parent;
var headGroup;

// Background
var backgroundMesh, backgroundCamera, backgroundScene, backgroundTexture;

// UI
var audio = true;

var rollingSpeed = 0.008;
var heroRollingSpeed;
var worldRadius = 26;
var heroRadius = 0.2;
var sphericalHelper;
var pathAngleValues;
var heroBaseY = 1.8;
var bounceValue = 0.1;
var gravity = 0.005;
var leftLane = -1;
var rightLane = 1;
var middleLane = 0;
var currentLane;
var clock;
var jumping;
var rockReleaseInterval = 0.5;
var lastRockReleaseTime = 0;
var rocksInPath;
var rocksPool;
var particleGeometry;
var particleCount = 20;
var explosionPower = 1.06;
var particles;
//var stats;
var scoreText;
var score;
var highestScore = 0;
var highestScoreText;
var hasCollided;
var hearts = [true, true];
var indexHeart = 1;

function init() {
    // set up the scene
    createScene();

    //call game loop
    update();
}

function createScene() {
    hasCollided = false;
    score = 0;
    rocksInPath = [];
    rocksPool = [];
    clock = new THREE.Clock();
    clock.start();
    heroRollingSpeed = (rollingSpeed * worldRadius / heroRadius) / 5;
    sphericalHelper = new THREE.Spherical();
    pathAngleValues = [1.52, 1.57, 1.62];
    sceneWidth = window.innerWidth;
    sceneHeight = window.innerHeight;
    scene = new THREE.Scene(); //the 3d scene
    scene.fog = new THREE.FogExp2(0x5a302f, 0.14);
    camera = new THREE.PerspectiveCamera(60, sceneWidth / sceneHeight, 0.1, 1000); //perspective camera
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }); //renderer with transparent backdrop
    renderer.shadowMap.enabled = true;//enable shadow
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(sceneWidth, sceneHeight);
    dom = document.getElementById('TutContainer');
    dom.appendChild(renderer.domElement);
    createRocksPool();
    addWorld();
    addBB8();
    addLight();
    addExplosion();

    camera.position.z = 6.5;
    camera.position.y = 2.5;

    window.addEventListener('resize', onWindowResize, false); //resize callback

    document.onkeydown = handleKeyDown;

    highestScoreText = document.getElementById('highestScore');
    scoreText = document.getElementById('score');
    scoreText.innerHTML = "0";
    document.body.appendChild(scoreText);
}

function createCircleTexture(color, size) {
    var matCanvas = document.createElement('canvas');
    matCanvas.width = matCanvas.height = size;
    var matContext = matCanvas.getContext('2d');
    // create texture object from canvas.
    var texture = new THREE.Texture(matCanvas);
    // Draw a circle
    var center = size / 2;
    matContext.beginPath();
    matContext.arc(center, center, size / 2, 0, 2 * Math.PI, false);
    matContext.closePath();
    matContext.fillStyle = color;
    matContext.fill();
    // need to set needsUpdate
    texture.needsUpdate = true;
    // return a texture made from the canvas
    return texture;
}

function addExplosion() {
    particleGeometry = new THREE.Geometry();
    for (var i = 0; i < particleCount; i++) {
        var vertex = new THREE.Vector3();
        particleGeometry.vertices.push(vertex);
    }

    var pMaterial = new THREE.PointsMaterial({
        size: 0.05,
        map: createCircleTexture('#ffffff', 256),
        transparent: true,
        depthWrite: false
    });


    particles = new THREE.Points(particleGeometry, pMaterial);
    scene.add(particles);
    particles.visible = false;
}

function createRocksPool() {
    var maxRocksInPool = 10;
    var newRock;
    for (var i = 0; i < maxRocksInPool; i++) {
        newRock = createRock();
        rocksPool.push(newRock);
    }
}
function handleKeyDown(keyEvent) {
    if (jumping) return;
    var validMove = true;
    if (keyEvent.keyCode === 37) { // LEFT
        if (currentLane === middleLane) {
            currentLane = leftLane;
        } else if (currentLane === rightLane) {
            currentLane = middleLane;
        } else {
            validMove = false;
        }
    } else if (keyEvent.keyCode === 39) { // RIGHT
        if (currentLane === middleLane) {
            currentLane = rightLane;
        } else if (currentLane === leftLane) {
            currentLane = middleLane;
        } else {
            validMove = false;
        }
    } else {
        if (keyEvent.keyCode === 38) { // UP
            bounceValue = 0.1;
            jumping = true;
        }
        validMove = false;
    }
    //heroSphere.position.x=currentLane;
    if (validMove) {
        jumping = true;
        bounceValue = 0.06;
    }
}

function addBB8() {

    var bodyGeometry = new THREE.SphereGeometry(heroRadius, 32, 32);
    var bodyMaterial = new THREE.MeshLambertMaterial({ shading: THREE.FlatShading, color: 0xffffff });


    body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    bodyMaterial.map = THREE.ImageUtils.loadTexture('textures/BB8.png');
    body.receiveShadow = true;
    body.castShadow = true;
    scene.add(body);

    // HEAD COMPONENTS
    var headGeometry = new THREE.SphereGeometry(0.12, 32, 32, 0, 2 * Math.PI, 0, Math.PI / 2);
    var headMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
    headMaterial.map = THREE.ImageUtils.loadTexture('textures/head.png');

    var headBaseGeometry = new THREE.CylinderGeometry(0.12, 0.10, 0.02, 32);
    var headBaseMaterial = new THREE.MeshLambertMaterial({ color: 0xaaaaaa });

    var antennaGeometry = new THREE.CylinderGeometry(0.005, 0.005, 0.11, 32);
    var antennaMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
    antennaMaterial.map = THREE.ImageUtils.loadTexture('textures/antenna.png');

    var smallAntennaGeometry = new THREE.CylinderGeometry(0.004, 0.004, 0.05, 32);
    var smallAntennaMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });

    var eyeGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.05, 32);
    var eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });


    head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 0.195;
    head.rotation.y = -Math.PI / 2 + 0.2;

    headBase = new THREE.Mesh(headBaseGeometry, headBaseMaterial);
    headBase.position.y = 0.18555;

    antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
    antenna.position.y = 0.33;
    antenna.position.x = 0.02;

    smallAntenna = new THREE.Mesh(smallAntennaGeometry, smallAntennaMaterial);
    smallAntenna.position.y = 0.33;
    smallAntenna.position.x = -0.015;

    eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    eye.position.y = 0.25;
    eye.position.z = 0.085;
    eye.rotation.x = 1.2;

    // Setting shadows
    headBase.castShadow = true;
    body.receiveShadow = true;

    headGroup = new THREE.Group();
    headGroup.add(head);
    headGroup.add(headBase);
    headGroup.add(antenna);
    headGroup.add(smallAntenna);
    headGroup.add(eye);

    headGroup.rotation.y = Math.PI;
    headGroup.receiveShadow = true;
    headGroup.castShadow = true;

    body.add(headGroup);

    /*--------------------*/

    jumping = false;

    body.position.y = heroBaseY;
    body.position.z = 4.8;
    currentLane = middleLane;
    body.position.x = currentLane;
}

function addWorld() {
    var sides = 40;
    var tiers = 40;
    var sphereGeometry = new THREE.SphereGeometry(worldRadius, sides, tiers);
    var texture = new THREE.TextureLoader().load('textures/earth.png', function (texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.offset.set(0, 0);
        texture.repeat.set(20, 20);
    });

    var sphereMaterial = new THREE.MeshStandardMaterial({ color: 0xfffafa, shading: THREE.FlatShading, map: texture });

    var vertexIndex;
    var vertexVector = new THREE.Vector3();
    var nextVertexVector = new THREE.Vector3();
    var firstVertexVector = new THREE.Vector3();
    var offset = new THREE.Vector3();
    var currentTier = 1;
    var lerpValue = 0.5;
    var heightValue;
    var maxHeight = 0.07;
     
    rollingGroundSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    rollingGroundSphere.receiveShadow = true;
    rollingGroundSphere.castShadow = false;
    rollingGroundSphere.rotation.z = -Math.PI / 2;
    scene.add(rollingGroundSphere);
    rollingGroundSphere.position.y = -24;
    rollingGroundSphere.position.z = 2;
    addWorldRocks();
}

function addLight() {
    var hemisphereLight = new THREE.HemisphereLight(0xfffafa, 0x000000, .9)
    scene.add(hemisphereLight);
    sun = new THREE.DirectionalLight(0xcdc1c5, 0.9);
    sun.position.set(12, 6, 7);
    sun.castShadow = true;
    scene.add(sun);
    //Set up shadow properties for the sun light
    sun.shadow.mapSize.width = 256;
    sun.shadow.mapSize.height = 256;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 50;
}

function addPathRock() {
    var options = [0, 1, 2];
    var lane = Math.floor(Math.random() * 3);
    addRock(true, lane);
    options.splice(lane, 1);
    if (Math.random() > 0.5) {
        lane = Math.floor(Math.random() * 2);
        addRock(true, options[lane]);
    }
}

function addWorldRocks() {
    var numRocks = 36;
    var gap = 6.28 / 36;
    for (var i = 0; i < numRocks; i++) {
        addRock(false, i * gap, true);
        addRock(false, i * gap, false);
    }
}

function addRock(inPath, row, isLeft) {
    var newRock;
    if (inPath) {
        if (rocksPool.length === 0) return;
        newRock = rocksPool.pop();
        newRock.visible = true;
        //console.log("add rock");
        rocksInPath.push(newRock);
        sphericalHelper.set(worldRadius - 0.3, pathAngleValues[row], -rollingGroundSphere.rotation.x + 4);
    } else {
        newRock = createRock();
        var desertAreaAngle = 0; //[1.52,1.57,1.62];
        if (isLeft) {
            desertAreaAngle = 1.68 + Math.random() * 0.1;
        } else {
            desertAreaAngle = 1.46 - Math.random() * 0.1;
        }
        sphericalHelper.set(worldRadius - 0.3, desertAreaAngle, row);
    }
    newRock.position.setFromSpherical(sphericalHelper);
    var rollingGroundVector = rollingGroundSphere.position.clone().normalize();
    var rockVector = newRock.position.clone().normalize();
    newRock.quaternion.setFromUnitVectors(rockVector, rollingGroundVector);
    newRock.rotation.x += (Math.random() * (2 * Math.PI / 10)) + -Math.PI / 10;

    rollingGroundSphere.add(newRock);
}

function createRock() {
    var sides = 10;
    var tiers = 6;

    /* ROCK */
    var rockGeometry = new THREE.DodecahedronGeometry((Math.random() * 0.3) + 0.5, 0);
    var rockMaterial = new THREE.MeshStandardMaterial({ color: 0xca9480, shading: THREE.FlatShading });
    var rock = new THREE.Mesh(rockGeometry, rockMaterial);
    rock.position.y = 0.25;

    /* ROCK 3D */
    var rock3D = new THREE.Object3D();
    rock3D.add(rock);

    return rock3D;
}

function update() {
    // Animation

    if (hearts[0] || hearts[1]) {

        // STILL ONE OR BOTH HEARTS

        rollingGroundSphere.rotation.x += rollingSpeed;
        body.rotation.x -= heroRollingSpeed;
        headGroup.rotation.x += heroRollingSpeed;
        if (body.position.y <= heroBaseY) {
            jumping = false;
            bounceValue = (Math.random() * 0.04) + 0.005;
        }
        body.position.y += bounceValue;
        body.position.x = THREE.Math.lerp(body.position.x, currentLane, 2 * clock.getDelta());
        bounceValue -= gravity;
        if (clock.getElapsedTime() > rockReleaseInterval) {
            clock.start();
            addPathRock();
        }

        score += 0.1;
        scoreText.innerHTML = score.toFixed(1).toString() + " m";
        doRockLogic();
        doExplosionLogic();
    } else {

        // GAME OVER

        if (score > highestScore) {
            highestScore = score;
            highestScoreText.innerHTML = "Record: " + score.toFixed(1).toString() + " m";
        }

        var gameover = document.getElementById('gameover');
        gameover.style.display = "table-cell";
        gameover.style.visibility = "visible";
        gameover.style.opacity = 1;
    }


    render();
    id = requestAnimationFrame(update); // Request next update
}

function doRockLogic() {
    var oneRock;
    var rockPos = new THREE.Vector3();
    var rocksToRemove = [];
    rocksInPath.forEach(function (element, index) {
        oneRock = rocksInPath[index];
        rockPos.setFromMatrixPosition(oneRock.matrixWorld);
        if (rockPos.z > 6 && oneRock.visible) { // Gone out of our view zone
            rocksToRemove.push(oneRock);
        } else { // Check collision
            if (rockPos.distanceTo(body.position) <= 0.6 && !hasCollided) {
                console.log("hit");
                hasCollided = true;
                explode();

                // BB-8 health management
                heartsLogic();
                indexHeart = 0;
            } else if (rockPos.distanceTo(body.position) > 0.6 && rockPos.distanceTo(body.position) <= 0.7) {
                hasCollided = false;
            }
        }
    });
    var fromWhere;
    rocksToRemove.forEach(function (element, index) {
        oneRock = rocksToRemove[index];
        fromWhere = rocksInPath.indexOf(oneRock);
        rocksInPath.splice(fromWhere, 1);
        rocksPool.push(oneRock);
        oneRock.visible = false;
        console.log("remove rock");
    });
}

function heartsLogic() {
    hearts[indexHeart] = false;
    document.getElementById("heart2").style.visibility = "hidden";
    if (!hearts[0]) {
        console.log("heart 1 removed");
        document.getElementById("heart1").style.visibility = "hidden";
    }
}

function doExplosionLogic() {
    if (!particles.visible) return;
    for (var i = 0; i < particleCount; i++) {
        particleGeometry.vertices[i].multiplyScalar(explosionPower);
    }
    if (explosionPower > 1.005) {
        explosionPower -= 0.001;
    } else {
        particles.visible = false;
    }
    particleGeometry.verticesNeedUpdate = true;
}

function explode() {
    particles.position.y = 2;
    particles.position.z = 4.8;
    particles.position.x = body.position.x;
    for (var i = 0; i < particleCount; i++) {
        var vertex = new THREE.Vector3();
        vertex.x = -0.2 + Math.random() * 0.4;
        vertex.y = -0.2 + Math.random() * 0.4;
        vertex.z = -0.2 + Math.random() * 0.4;
        particleGeometry.vertices[i] = vertex;
    }
    explosionPower = 1.07;
    particles.visible = true;
}

function render() {
    renderer.render(scene, camera); //draw
}

function onWindowResize() {
    //resize & align
    sceneHeight = window.innerHeight;
    sceneWidth = window.innerWidth;
    renderer.setSize(sceneWidth, sceneHeight);
    camera.aspect = sceneWidth / sceneHeight;
    camera.updateProjectionMatrix();
}

function restartGame() {
    dom.removeChild(renderer.domElement);
    cancelAnimationFrame(id);

    rollingSpeed = 0.008;
    worldRadius = 26;
    heroRadius = 0.2;
    heroBaseY = 1.8;
    bounceValue = 0.1;
    gravity = 0.005;
    leftLane = -1;
    rightLane = 1;
    middleLane = 0;
    rockReleaseInterval = 0.5;
    lastRockReleaseTime = 0;
    particleCount = 20;
    explosionPower = 1.06;
    hearts[0] = true;
    hearts[1] = true;
    indexHeart = 1;

    document.getElementById("heart1").style.visibility = "visible";
    document.getElementById("heart2").style.visibility = "visible";

    init();
}

document.getElementById("audioIcon").onclick = function () {
    audio = !audio;
    if (audio) {
        this.setAttribute("src", "images/audio.png");
        document.getElementById("audio").play()
    } else {
        this.setAttribute("src", "images/no-audio.png");
        document.getElementById("audio").pause()
    }
}

document.getElementById("tryagain").onclick = function () {
    var gameover = document.getElementById('gameover');
    gameover.removeAttribute("style");
    restartGame();
}