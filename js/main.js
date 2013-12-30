(function() {
  // Dimensions the grid
  var height = 30;
  var width = 30;

  var rules = {
    maxNeightbours: 3,
    minNeighbours: 2,
    toBirth: 3,
  }

  window.paused = false;
  
  // Time between ticks
  window.timeout = 500;

  // For camera angles
  window.degrees = 0;
  window.radius = 100;
  window.cameraOffset = width / 2;

  var Cell = function(x,y) {  // Create a new living cell
    var cell = new THREE.Mesh(
      new THREE.CubeGeometry(1,1,1), 
      new THREE.MeshLambertMaterial(
        {color: 0x999999}
      )
    );

    cell.position.x = x;
    cell.position.y = y;
    scene.add(cell);

    this.kill = function() {
      scene.remove(cell);    
    }
  };

  var randomBoolean = function() {
    return Math.floor(Math.random() * 2) === 1;
  }

  window.setCamera = function() { // Set the position of the camera based on degrees round
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


  // Init the cells
  var cells = [];
  for(var i=0; i<width; i++) {
    for(var j=0; j<height; j++) {
      if(cells[i] === undefined) {
        cells.push([]);
      }

      if(randomBoolean() === true) {
        cells[i][j] = new Cell(i, j);
      }
    }
  }

  window.tick = function(force) { // Execute one cycle
    if(!paused && !force) setTimeout(tick, timeout);
    if(paused && !force) return;

    var nextCells = [];
    for(var i=0; i<width; i++) {
      for(var j=0; j<height; j++) {
        if(nextCells[i] === undefined) {
          nextCells.push([]);
        }

        var neighbours = 0;
        if(cells[i-1] !== undefined && cells[i-1][j-1] !== undefined) neighbours++; 
        if(cells[i-1] !== undefined && cells[i-1][j] !== undefined) neighbours++; 
        if(cells[i-1] !== undefined && cells[i-1][j+1] !== undefined) neighbours++; 
        if(cells[i][j-1] !== undefined) neighbours++; 
        if(cells[i][j+1] !== undefined) neighbours++; 
        if(cells[i+1] !== undefined && cells[i+1][j-1] !== undefined) neighbours++; 
        if(cells[i+1] !== undefined && cells[i+1][j] !== undefined) neighbours++; 
        if(cells[i+1] !== undefined && cells[i+1][j+1] !== undefined) neighbours++;

        if(cells[i][j] === undefined) { // This cell is dead :(
          if(neighbours === rules.toBirth) {
            nextCells[i][j] = new Cell(i,j);
          }
        } else { // This cell is alive, will it stay this way? only one way to find out
          if(neighbours > rules.maxNeightbours || neighbours < rules.minNeighbours) {
            cells[i][j].kill();
          } else {
            nextCells[i][j] = cells[i][j];
          }
        }
      }
    }
    cells = nextCells;
  }

  var render = function() { // Draw loop
    requestAnimationFrame(render);
    renderer.render(scene, camera);
  };

  render(); // Kick off draw loop
  tick(); // Kick off ticks

}());