(function() {
  // Dimensions the grid
  var height = 45;
  var width = 90;

  // Constants for cells to live or die
  var rules = {
    maxNeightbours: 3,
    minNeighbours: 2,
    toBirth: 3,
  }

  // true if the simulation is paused
  window.paused = false;
  
  // Time between ticks
  window.timeout = 500;

  // For camera angles
  window.degrees = 0;
  window.radius = 150;
  window.cameraOffset = width / 2;

  // 0 Sized geometry to merge with
  window.geo = new THREE.CubeGeometry(0, 0, 0);

  var Cell = function(x,y) {  // Create a new living cell
    var cell = new THREE.Mesh(
      new THREE.CubeGeometry(1, 1, 1), 
      new THREE.MeshLambertMaterial(
        {color: 0x999999}
      )
    );

    cell.position.x = x;
    cell.position.y = y;

    THREE.GeometryUtils.merge(geo, cell);
  };

  // Returns true or false, true (1 / chance) times
  var randomBoolean = function(chance) {
    if(chance === undefined) chance = 2;
    return Math.floor(Math.random() * chance) === 0;
  }

  // Set the position of the camera based on degrees round
  window.setCamera = function() { 
    camera.position.x = cameraOffset + (radius * Math.sin(degrees * Math.PI / 180));
    camera.position.z = radius * Math.cos(degrees * Math.PI / 180);
    camera.lookAt(new THREE.Vector3(cameraOffset, camera.position.y, 0));
  }


  var scene = new THREE.Scene();

  // Initialise renderer
  var renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight-4);
  renderer.setClearColor(0xffffff);
  document.body.appendChild(renderer.domElement);

  // Initialise camera
  window.camera = new THREE.PerspectiveCamera(25, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.y = height/2;
  setCamera();
  scene.add(camera);

  // Initialise pointLight
  var pointLight = new THREE.PointLight(0xFFFFFF);
  pointLight.position.x = width / 2;
  pointLight.position.y = height / 2;
  pointLight.position.z = 100;
  scene.add(pointLight);


  // Initialise the cells randomly
  var cells = [];
  for(var i=0; i<width; i++) {
    for(var j=0; j<height; j++) {
      if(cells[i] === undefined) {
        cells.push([]);
      }

      if(randomBoolean(8) === true) {
        cells[i][j] = new Cell(i, j);
      }
    }
  }


  // Execute one cycle
  window.tick = function(force) {
    if(!paused && !force) setTimeout(tick, timeout);
    if(paused && !force) return;

    window.geo = new THREE.CubeGeometry(0, 0, 0);

    var nextCells = [];
    for(var i=0; i<width; i++) {
      for(var j=0; j<height; j++) {
        if(nextCells[i] === undefined) {
          nextCells.push([]);
        }

        // Count up the number of neighbours
        var neighbours = 0;
        if(cells[i-1] !== undefined && cells[i-1][j-1] !== undefined) neighbours++; 
        if(cells[i-1] !== undefined && cells[i-1][j] !== undefined) neighbours++; 
        if(cells[i-1] !== undefined && cells[i-1][j+1] !== undefined) neighbours++; 
        if(cells[i][j-1] !== undefined) neighbours++; 
        if(cells[i][j+1] !== undefined) neighbours++; 
        if(cells[i+1] !== undefined && cells[i+1][j-1] !== undefined) neighbours++; 
        if(cells[i+1] !== undefined && cells[i+1][j] !== undefined) neighbours++; 
        if(cells[i+1] !== undefined && cells[i+1][j+1] !== undefined) neighbours++;

        if(cells[i][j] === undefined) { // This cell is dead
          if(neighbours === rules.toBirth) {
            nextCells[i][j] = new Cell(i,j);
          }
        } else { // This cell is alive
          if(neighbours <= rules.maxNeightbours && neighbours >= rules.minNeighbours) {
            nextCells[i][j] = new Cell(i,j);
          }
        }
      }
    }
    cells = nextCells;

    // Remove the old mesh and add this new one
    scene.remove(window.mesh);
    window.mesh = new THREE.Mesh(
      geo, 
      new THREE.MeshLambertMaterial(
        {color: 0x999999}
      )
    );
    scene.add(mesh);
  }

  var render = function() { // Draw loop
    requestAnimationFrame(render);
    renderer.render(scene, camera);
  }

  render(); // Kick off draw loop
  tick(); // Kick off ticks

}());