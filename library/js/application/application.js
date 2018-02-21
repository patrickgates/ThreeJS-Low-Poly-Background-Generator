var camera, scene, renderer,
light1, light2, light3, mouseLight,
loader, mesh, stats, controls, points;

var mouse = new THREE.Vector3();

var mouseLightPow = 10;
var lightZ = 25;
var lightInt = 1;
var lightDist = 300;

// Height but slightly larger to let the mesh break out of bounds
// creates a larger than screen effect
var height = 150*window.innerWidth / window.innerHeight;
var width = 150;

// Used for calculating light multiplier
var realH = 100*window.innerWidth / window.innerHeight;
var realW = 100;

// Used for x and y light position multipliers
var lightMultX = realH/2;
var lightMultY = realW/2;

init();
animate();

// SETUP THE SCENE AND ELEMENTS
function init() {
  var container = document.getElementById( 'container' );
  
  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
  camera.position.set( 0, 0, 120 );
  
  // Add Orbit Controls
  //controls = new THREE.OrbitControls( camera );
  //controls.addEventListener( 'change', render );
  
  scene = new THREE.Scene();
  
  scene.add( new THREE.AmbientLight( 0x00020 ) );
  
  // ADD THE MOVING LIGHTS
  light1 = new THREE.PointLight( 0x80ff80, lightInt, lightDist );
  light1.position.set(0, 0, lightZ);
  scene.add( light1 );
  
  light2 = new THREE.PointLight( 0xff2020, lightInt, lightDist );
  light2.position.set(0, 0, lightZ);
  scene.add( light2 );
  
  light3 = new THREE.PointLight( 0xff8000, lightInt, lightDist );
  light3.position.set(0, 0, lightZ);
  scene.add( light3 );
  
  
  
  // ADD TRACKERS SPRITES TO EACH LIGHT
  /*var PI2 = Math.PI * 2;
  var program = function ( context ) {
    
    context.beginPath();
    context.arc( 0, 0, 0.5, 0, PI2, true );
    context.fill();
    
  };
  
  var sprite = new THREE.Sprite( new THREE.SpriteCanvasMaterial( { color: 0x80ff80, program: program } ) );
  light1.add( sprite );
  
  var sprite = new THREE.Sprite( new THREE.SpriteCanvasMaterial( { color: 0xff2020, program: program } ) );
  light2.add( sprite );
  
  var sprite = new THREE.Sprite( new THREE.SpriteCanvasMaterial( { color: 00xff8000, program: program } ) );
  light3.add( sprite );*/
  

  
  // CREATE A RANDOM TRIANGULATED MESH
  // Create Points
  noise.seed(Math.random());
  
  points = [];
  
  for (var i = 0; i < 100; i++) {
    var x = (Math.random()*height) - (height/2);
    var y = (Math.random()*width) - (width/2);
    var z = noise.perlin2(x/100, y/100) * 10;
    
    points.push([x, y, z]);
  }
  
  triangulate(points);
  
  
  // SETUP RENDERER
  renderer = new THREE.CanvasRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  container.appendChild( renderer.domElement );
  
  // Add resize listener
  window.addEventListener( 'resize', onWindowResize, false );
  
  // ADD STATS
  //stats = new Stats();
  //document.getElementById( 'container' ).appendChild(stats.dom);

  // CREATE THE MOUSE LIGHT
  // Setup and add light to scene
  mouseLight = new THREE.PointLight( 0xffffff, 0, 300 );
  scene.add(mouseLight);

  // On mouse move update the "mousePos" var to the current mouse position in world
  var mousePos;  
  addEventListener("mousemove", function(event) {
    mouseLight.power = mouseLightPow;
    
    mouse.set(
      ( event.clientX / window.innerWidth ) * 2 - 1,   //x
      -( event.clientY / window.innerHeight ) * 2 + 1,  //y
      0.5
    );
    
    mouse.unproject( camera );
    
    var dir = mouse.sub( camera.position ).normalize();
    
    var distance = - camera.position.z / dir.z;
    
    mousePos = camera.position.clone().add( dir.multiplyScalar( distance ) );
    
    // Set mouse light to the new mouse position
    mouseLight.position.set(mousePos.x, mousePos.y, 10);
  });
  
  
  // ON CLICK ADD A NEW POINT, REMOVE OLD MESH, AND THEN RE-TRIANGULATE
  addEventListener("click", function(event) {
    scene.remove( mesh );
    
    var x = -mousePos.x;
    var y = mousePos.y;
    var z = noise.perlin2(x/100, y/100) * 10;
    
    points.push([x, y, z]);
    
    triangulate(points);
  });
}



// RECREATE MESH FOR NEW WINDOW SIZES SO MESH EDGES AREN'T EXPOSED ON RESIZE
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  
  renderer.setSize( window.innerWidth, window.innerHeight );
  
  scene.remove( mesh );
  triangulate(points);
}



// OUR GLOBAL ANIMATE FUNCTION
function animate() {
  requestAnimationFrame( animate );
  //stats.begin();
  render();
  //stats.end();
}



// OUR GLOBAL RENDER FUNCTION
function render() {
  var time = Date.now() * 0.0005;
  
  if (mouseLight.power > 0)
    mouseLight.power -= 0.1;
  
  //controls.update();
  
  // Move lights based on simple time based calculations
  // (stolen from original three.js example source material)
  light1.position.x = Math.sin( time * 0.7 ) * lightMultX;
  light1.position.y = Math.cos( time * 0.5 ) * lightMultY;
  
  light2.position.x = Math.cos( time * 0.3 ) * lightMultX;
  light2.position.y = Math.sin( time * 0.5 ) * lightMultY;
  
  light3.position.x = Math.sin( time * 0.7 ) * lightMultX;
  light3.position.y = Math.cos( time * 0.3 ) * lightMultY;
  
  renderer.render( scene, camera );
}



// USE A DELAUNAY TRIANGULATION ALGORITHM TO TRIANGULATE AN 2D ARRAY OF POINTS
// THEN ADD THAT MESH TO THE SCENE, MORE LIKE AN INIT MESH FUNCTION
function triangulate(points) {
  // Triangulate
  var delaunay = new Delaunator(points);
  
  // Create Faces
  var geometry = new THREE.Geometry();
  
  for (i = 0; i < points.length; i++) {
    geometry.vertices.push(new THREE.Vector3( points[i][0], points[i][1], points[i][2] ));
  }
  
  for (i = 0; i < delaunay.triangles.length; i+=3) {
    geometry.faces.push( new THREE.Face3( delaunay.triangles[i], delaunay.triangles[i+1], delaunay.triangles[i+2] ) );
  }
  
  geometry.computeFaceNormals();

  // Set our material
  var mat = new THREE.MeshLambertMaterial( { color: 0xffffff, overdraw: 0.5 });
  
  // Create our mesh
  mesh = new THREE.Mesh( geometry, mat );
  
  // Flip the mesh the correct way
  // (probably could avoid this if I did things more properly)
  // (resources, shmresources)
  mesh.rotation.y = Math.PI;
  
  // Add mesh to scene
  scene.add( mesh );
}