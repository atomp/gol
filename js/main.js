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

  // Distribute initial cells randomly
  var random = true;
  var density = 2;

  var Cell = function(x,y) {  // Create a new living cell
    var cell = new THREE.Mesh(
      new THREE.CubeGeometry(10,10,10), 
      new THREE.MeshLambertMaterial(
        {color: 0x999999}
      )
    );

    cell.position.x = x * 10;
    cell.position.y = y * 10;
    scene.add(cell);

    this.kill = function() {
      scene.remove(cell);    
    }
  };

  var randomBoolean = function() {
    return Math.floor(Math.random() * 2) === 1;
  }

  var setCamera = function(deg) { // Set the position of the camera based on degrees round
    var radius = 800;  // Radius for the circle of our camer
    camera.position.x = radius * Math.sin(deg * Math.PI / 180);
    camera.position.z = radius * Math.cos(deg * Math.PI / 180);
    camera.lookAt(new THREE.Vector3((width/2)*10,(height/2)*10,0));
  }

  // Initialise renderer
  var renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight-4);
  renderer.setClearColor(0xffffff);
  document.body.appendChild(renderer.domElement);

  var scene = new THREE.Scene();

  // Initialise camera
  window.camera = new THREE.PerspectiveCamera(25, window.innerWidth/window.innerHeight, 0.1, 1000);
  scene.add(camera);
  camera.position.y = (height/2)*10;
  camera.lookAt(new THREE.Vector3( 0, 0, 0 ));

  // Initialise pointLight
  var pointLight = new THREE.PointLight(0xFFFFFF);
  pointLight.position.x = 10;
  pointLight.position.y = 50;
  pointLight.position.z = 130;
  scene.add(pointLight);

  // Init the cells
  var cells = [];
  for(var i=0; i<width; i++) {
    for(var j=0; j<height; j++) {
      if(cells[i] === undefined) {
        cells.push([]);
      }

      if(random === true) {
        if(randomBoolean() === true) {
          cells[i][j] = new Cell(i, j);
        }
      }
    }
  }

  if(random === false) {
    // Make a spinner
    cells[1][0] = new Cell(1, 0);
    cells[1][1] = new Cell(1, 1);
    cells[1][2] = new Cell(1, 2);

    // Make this weird thing
    cells[6][8] = new Cell(6, 8);
    cells[7][8] = new Cell(7, 8);
    cells[8][8] = new Cell(8, 8);
    cells[5][7] = new Cell(5, 7);
    cells[6][7] = new Cell(6, 7);
    cells[7][7] = new Cell(7, 7); 
  }

  var degrees = 0;
  setCamera(degrees);

  window.tick = function(force) { // boom shake, shake, shake the room
    setTimeout(tick, timeout);
    if(!force && paused) return;
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


// Controls
window.clicked = false;
window.paused = false;
window.mousePos = {};
window.onmousedown = function(e) {
  mousePos.x = e.x;
  mousePos.y = e.y;
  window.clicked = true;
};
window.onmouseup = function() {
  window.clicked = false;
};
window.onmousemove = function(e) {
  if(window.clicked === true) {
    camera.position.x += mousePos.x - e.x;
    camera.position.y += e.y - mousePos.y;
    mousePos.x = e.x;
    mousePos.y = e.y;
  }
};
window.onmousewheel = function(e) {
  if(e.wheelDeltaY > 0) {
    camera.position.z += 10;
  } else if(e.wheelDeltaY < 0) {
    camera.position.z -= 10;
  }
}

document.getElementById('pause').addEventListener('click', function() {
  paused = true;
});
document.getElementById('play').addEventListener('click', function() {
  paused = false;
});
document.getElementById('step').addEventListener('click', function() {
  tick(true);
});
document.getElementById('speedup').addEventListener('click', function() {
  timeout -= 50;
});
document.getElementById('slowdown').addEventListener('click', function() {
  timeout += 50;
});