var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
var controls = new THREE.OrbitControls( camera );

var renderer = new THREE.WebGLRenderer( {antialias: true} );
renderer.shadowMap.enabled = true; //enable shadow
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor(0xfdb353, 1); 
document.body.appendChild( renderer.domElement );

var stoneGeometry = new THREE.DodecahedronGeometry( 2, 0);
var stoneMaterial = new THREE.MeshLambertMaterial( { color: 0xca9480,shading:THREE.FlatShading  } );
var stone = new THREE.Mesh( stoneGeometry, stoneMaterial );

scene.add(stone);

var sun = new THREE.DirectionalLight( 0xcdc1c5, 0.9);
sun.position.set( 2,2,8 );
sun.castShadow = true;
scene.add(sun);

camera.position.set( 0, 2, 8 );

var animate = function () {
    requestAnimationFrame( animate );				
    stone.rotation.y -= 0.01;
    
    controls.update();
    renderer.render(scene, camera);
};

animate();