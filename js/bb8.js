var step = 0;

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
var controls = new THREE.OrbitControls( camera );

var renderer = new THREE.WebGLRenderer( {antialias: true} );
renderer.shadowMap.enabled = true; //enable shadow
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor(0xfdb353, 1); 
document.body.appendChild( renderer.domElement );

/* BODY */

var bodyGeometry = new THREE.SphereGeometry( 2, 32, 32 );
var bodyMaterial = new THREE.MeshLambertMaterial( { color: 0xffffff } );
bodyMaterial.map = THREE.ImageUtils.loadTexture('textures/BB8.png');

var body = new THREE.Mesh( bodyGeometry, bodyMaterial );
body.receiveShadow = true;
	body.castShadow=true;
scene.add( body );

/* HEAD */

var head, headBase, antenna, smallAntenna, eye, parent = body;

// HEAD COMPONENTS
var headGeometry = new THREE.SphereGeometry(1.2, 32, 32, 0, 2*Math.PI, 0, Math.PI/2);
var headMaterial = new THREE.MeshLambertMaterial( { color: 0xffffff } );
headMaterial.map = THREE.ImageUtils.loadTexture('textures/head.png');

var headBaseGeometry = new THREE.CylinderGeometry( 1.2, 1.0, 0.2, 32 );
var headBaseMaterial = new THREE.MeshLambertMaterial( { color: 0xaaaaaa } );

var antennaGeometry = new THREE.CylinderGeometry( 0.05, 0.05, 1.1, 32 );
var antennaMaterial = new THREE.MeshLambertMaterial( { color: 0xffffff } );
antennaMaterial.map = THREE.ImageUtils.loadTexture('textures/antenna.png');

var smallAntennaGeometry = new THREE.CylinderGeometry( 0.04, 0.04, 0.5, 32 );
var smallAntennaMaterial = new THREE.MeshLambertMaterial( { color: 0xffffff } );

var eyeGeometry = new THREE.CylinderGeometry( 0.3, 0.3, 0.5, 32 );
var eyeMaterial = new THREE.MeshBasicMaterial( { color: 0x000000 } );


head = new THREE.Mesh( headGeometry, headMaterial );
head.position.y = 1.95;
head.rotation.y = -Math.PI/2+0.2;

headBase = new THREE.Mesh( headBaseGeometry, headBaseMaterial );
headBase.position.y = 1.8555;

antenna = new THREE.Mesh( antennaGeometry, antennaMaterial );
antenna.position.y = 3.3;
antenna.position.x = 0.2;

smallAntenna = new THREE.Mesh( smallAntennaGeometry, smallAntennaMaterial );
smallAntenna.position.y = 3.3;
smallAntenna.position.x = -0.15;

eye = new THREE.Mesh( eyeGeometry, eyeMaterial );
eye.position.y = 2.5;
eye.position.z = 0.85;
eye.rotation.x = 1.2;

// Setting shadows
headBase.castShadow = true;
body.receiveShadow = true;

var headGroup = new THREE.Group();
headGroup.add(head);
headGroup.add(headBase);
headGroup.add(antenna);
headGroup.add(smallAntenna);
headGroup.add(eye);

parent.add( headGroup );

var sun = new THREE.DirectionalLight( 0xffffff, 0.9);
sun.position.set( 1,2,3 );
sun.castShadow = true;
scene.add(sun);

camera.position.set( 0, 2, 8 );

var animate = function () {
    requestAnimationFrame( animate );				
    body.rotation.x += 0.1;
    headGroup.rotation.x -= 0.1;
    
    step+=0.04;
    body.position.y = ( 0.5*Math.abs(Math.sin(step)));
    
    controls.update();
    renderer.render(scene, camera);
};

animate();