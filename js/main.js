(function() {
  // Constants for cells to live or die
  var rules = {
    maxNeightbours: 3,
    minNeighbours: 2,
    toBirth: 3,
  }

  // Dimensions the grid
  var consts = {
    height: 45,
    width: 90
  }

  // Camera variables modified by user input
  window.view = {
    degrees: 0,
    radius: 150,
    offset: consts.width/2
  };

  // 0 Sized geometry to merge with
  var geo = new THREE.CubeGeometry(0, 0, 0);

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
    camera.position.x = view.offset + (view.radius * Math.sin(view.degrees * Math.PI / 180));
    camera.position.z = view.radius * Math.cos(view.degrees * Math.PI / 180);
    camera.lookAt(new THREE.Vector3(view.offset, camera.position.y, 0));
  }


  var scene = new THREE.Scene();

  // Initialise renderer
  var renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight-4);
  renderer.setClearColor(0xffffff);
  document.body.appendChild(renderer.domElement);

  // Initialise camera
  window.camera = new THREE.PerspectiveCamera(25, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.y = consts.height/2;
  setCamera();
  scene.add(camera);

  // Initialise pointLight
  var pointLight = new THREE.PointLight(0xFFFFFF);
  pointLight.position.x = consts.width / 2;
  pointLight.position.y = consts.height / 2;
  pointLight.position.z = 100;
  scene.add(pointLight);


  window.sim = {  // Simulation logic
    paused: false,  // True if the simulation is paused
    timeout: 500, // Time between ticks
    cells: [],  // 2D array of cells
    mesh: null, // merged mesh of cells
    init: function(density) {  // Initialise the game of life with random cells
      for(var i=0; i<consts.width; i++) {
        for(var j=0; j<consts.height; j++) {
          if(sim.cells[i] === undefined) {
            sim.cells.push([]);
          }

          if(randomBoolean(density) === true) {
            sim.cells[i][j] = new Cell(i, j);
          }
        }
      }
    },
    tick: function(force) { // Execute one cycle
      if(!sim.paused && !force) setTimeout(sim.tick, sim.timeout);
      if(sim.paused && !force) return;

      geo = new THREE.CubeGeometry(0, 0, 0);

      var nextCells = [];
      for(var i=0; i<consts.width; i++) {
        for(var j=0; j<consts.height; j++) {
          if(nextCells[i] === undefined) {
            nextCells.push([]);
          }

          // Count up the number of neighbours
          var neighbours = 0;
          if(sim.cells[i-1] !== undefined && sim.cells[i-1][j-1] !== undefined) neighbours++; 
          if(sim.cells[i-1] !== undefined && sim.cells[i-1][j] !== undefined) neighbours++; 
          if(sim.cells[i-1] !== undefined && sim.cells[i-1][j+1] !== undefined) neighbours++; 
          if(sim.cells[i][j-1] !== undefined) neighbours++; 
          if(sim.cells[i][j+1] !== undefined) neighbours++; 
          if(sim.cells[i+1] !== undefined && sim.cells[i+1][j-1] !== undefined) neighbours++; 
          if(sim.cells[i+1] !== undefined && sim.cells[i+1][j] !== undefined) neighbours++; 
          if(sim.cells[i+1] !== undefined && sim.cells[i+1][j+1] !== undefined) neighbours++;

          if(sim.cells[i][j] === undefined) { // This cell is dead
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
      sim.cells = nextCells;

      // Remove the old mesh and add this new one
      scene.remove(sim.mesh);
      sim.mesh = new THREE.Mesh(
        geo, 
        new THREE.MeshLambertMaterial(
          {color: 0x999999}
        )
      );
      scene.add(sim.mesh);
    }
  };
  

  var render = function() { // Draw loop
    requestAnimationFrame(render);
    renderer.render(scene, camera);
  }

  sim.init(7);
  sim.tick(); // Kick off ticks
  render(); // Kick off draw loop
}());