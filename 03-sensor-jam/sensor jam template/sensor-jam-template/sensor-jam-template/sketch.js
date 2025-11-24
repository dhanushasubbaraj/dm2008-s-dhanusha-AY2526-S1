let port; // Serial Communication port
let connectBtn;

let sensorVal, circleSize, circleColor;

function setup() {
  createCanvas(windowWidth, windowHeight);
  port = createSerial(); // creates the Serial Port

  // Connection helpers
  connectBtn = createButton("Connect to Arduino");
  connectBtn.position(20, 20);
  connectBtn.mousePressed(connectBtnClick);

  circleSize = 100;
  circleColor = color(255)
}

function draw() {
  background(30);
  
  // Receive data from Arduino
  if (port.opened()) {
    sensorVal = port.readUntil("\n");
    // Only log data that has information, not empty signals
    if (sensorVal && sensorVal.trim().length > 0) {
      let dist = parseFloat(sensorVal);
      if (!isNaN(dist)){
        circleSize = map(dist, 2, 400, 400, 50, true);
        let hue = map(dist, 2, 400, 0, 200, true);
        circleColor = color(hue, 100, 255);

        drawingContext.shadowBlur = map(dist, 2, 400, 40, 0, true);
        drawingContext.shadowColor = color(hue, 100, 255);
      }
    }
  }

  colorMode(HSB);
  fill(circleColor);
  noStroke();
  ellipse(width / 2, height / 2, circleSize);
}

// DO NOT REMOVE THIS FUNCTION
function connectBtnClick(e) {
  // If port is not already open, open on click,
  // otherwise close the port
  if (!port.opened()) {
    port.open(9600); // opens port with Baud Rate of 9600
    e.target.innerHTML = "Disconnect Arduino";
    e.target.classList.add("connected");
  } else {
    port.close();
    e.target.innerHTML = "Connect to Arduino";
    e.target.classList.remove("connected");
  }
}







