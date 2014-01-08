//////////////////////////////////////////////////////////////
// Logic for controlling the camera and speed of the cycles //
//////////////////////////////////////////////////////////////
(function() {
  window.clicked = false;
  window.mousePos = {};
  sim.paused = false;

  /* Mouse controls for the camera */
  document.getElementsByTagName('canvas')[0].addEventListener('mousedown', function(e) {
    mousePos.x = e.x;
    mousePos.y = e.y;
    window.clicked = true;
  });
  window.onmouseup = function() {
    window.clicked = false;
  };
  window.onmousemove = function(e) {
    if(window.clicked === true) {
      camera.position.x += (mousePos.x - e.x) / 20;
      view.offset += (mousePos.x - e.x) / 20;
      camera.position.y += (e.y - mousePos.y) / 20;
      mousePos.x = e.x;
      mousePos.y = e.y;
    }
  };
  window.onmousewheel = function(e) {
    if(e.wheelDeltaY > 0) {
      view.radius -= 2;
    } else if(e.wheelDeltaY < 0) {
      view.radius += 2;
    }
    setCamera();
  }

  /* Settings bar event listeners */
  document.getElementById('pause').addEventListener('click', function() {
    sim.paused = true;
  });
  document.getElementById('play').addEventListener('click', function() {
    sim.paused = false;
    sim.tick();
  });
  document.getElementById('step').addEventListener('click', function() {
    sim.tick(true);
  });
  document.getElementById('speedup').addEventListener('click', function() {
    sim.timeout -= 50;
  });
  document.getElementById('slowdown').addEventListener('click', function() {
    sim.timeout += 50;
  });
  document.getElementById('rotateleft').addEventListener('click', function() {
    view.degrees += 10;
    setCamera();
  });
  document.getElementById('rotateright').addEventListener('click', function() {
    view.degrees -= 10;
    setCamera();
  });
}());