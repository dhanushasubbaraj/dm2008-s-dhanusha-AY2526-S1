let colorBtn, sizeSlider, shapeSelect, rotSlider, strokeChk, strokeSlider;
let shapeColor, bgA, bgB, t = 0;

function setup() {
  let cnv = createCanvas(640, 400);
  cnv.style("display", "block");
  cnv.style("margin", "40px auto"); 

  noStroke();
  textFont("Helvetica, Arial, sans-serif");


  shapeColor = color(random(255), random(255), random(255));
  bgA = color(255, 180, 200);
  bgB = color(180, 200, 255);


  const panel = createDiv();
  panel.position(20, 20);
  panel.style("padding", "18px 20px");
  panel.style("width", "230px");
  panel.style("background", "rgba(255,255,255,0.8)");
  panel.style("border-radius", "16px");
  panel.style("box-shadow", "0 8px 30px rgba(0,0,0,0.1)");
  panel.style("backdrop-filter", "blur(8px)");
  panel.style("font-family", "Helvetica, sans-serif");
  panel.style("color", "#333");
  panel.style("line-height", "1.4");


  const title = createElement("h2", "Shape Lab");
  title.parent(panel);
  title.style("margin", "0 0 6px 0");
  title.style("font-size", "18px");
  title.style("color", "#222");


  const subtitle = createP("Tweak your shape’s color, size, and style in real time.");
  subtitle.parent(panel);
  subtitle.style("margin", "0 0 12px 0");
  subtitle.style("font-size", "12px");
  subtitle.style("color", "#666");


  colorBtn = createButton("Randomize Color");
  colorBtn.parent(panel);
  colorBtn.mousePressed(() => {
    shapeColor = color(random(255), random(255), random(255));
  });
  colorBtn.style("width", "100%");
  colorBtn.style("padding", "10px");
  colorBtn.style("border", "none");
  colorBtn.style("border-radius", "10px");
  colorBtn.style("margin", "8px 0 16px 0");
  colorBtn.style("cursor", "pointer");
  colorBtn.style("background", "linear-gradient(90deg, #89f7fe, #66a6ff)");
  colorBtn.style("color", "#fff");
  colorBtn.style("font-weight", "600");
  colorBtn.style("transition", "transform 0.15s ease");
  colorBtn.mouseOver(() => colorBtn.style("transform", "scale(1.05)"));
  colorBtn.mouseOut(() => colorBtn.style("transform", "scale(1)"));


  makeLabel(panel, "Size");
  sizeSlider = createSlider(20, 220, 110, 1);
  sizeSlider.parent(panel);
  styleSlider(sizeSlider);

  makeLabel(panel, "Rotation");
  rotSlider = createSlider(0, 360, 20, 1);
  rotSlider.parent(panel);
  styleSlider(rotSlider);

  
  makeLabel(panel, "Shape");
  shapeSelect = createSelect();
  shapeSelect.parent(panel);
  shapeSelect.option("ellipse");
  shapeSelect.option("rect");
  shapeSelect.option("triangle");
  shapeSelect.style("width", "100%");
  shapeSelect.style("padding", "8px 10px");
  shapeSelect.style("border-radius", "10px");
  shapeSelect.style("border", "1px solid #ccc");
  shapeSelect.style("background", "#fafafa");
  shapeSelect.style("font-size", "13px");
  shapeSelect.style("color", "#333");
  shapeSelect.style("margin-bottom", "12px");
  shapeSelect.style("outline", "none");
  shapeSelect.style("cursor", "pointer");
  shapeSelect.mouseOver(() => shapeSelect.style("background", "#f0f0f0"));
  shapeSelect.mouseOut(() => shapeSelect.style("background", "#fafafa"));


const strokeRow = createDiv();
strokeRow.parent(panel);
strokeRow.style("display", "flex");
strokeRow.style("align-items", "center");
strokeRow.style("gap", "10px");
strokeRow.style("width", "100%");


const chkWrap = createDiv();
chkWrap.parent(strokeRow);
chkWrap.style("display", "flex");
chkWrap.style("align-items", "center");
chkWrap.style("gap", "6px");
chkWrap.style("white-space", "nowrap"); 


strokeChk = createCheckbox("", false);
strokeChk.parent(chkWrap);

const outlineLbl = createSpan("Outline");
outlineLbl.parent(chkWrap);
outlineLbl.style("font-size", "12px");
outlineLbl.style("font-weight", "600");
outlineLbl.style("color", "#444");


strokeSlider = createSlider(0, 12, 3, 1);
strokeSlider.parent(strokeRow);
styleSlider(strokeSlider);
strokeSlider.style("flex", "1");      
strokeSlider.elt.disabled = true;

strokeChk.changed(() => (strokeSlider.elt.disabled = !strokeChk.checked()));
}



function draw() {
  // --- Animated blended background ---
  t += 0.01;
  const driftA = color(
    180 + 60 * sin(t * 0.8),
    180 + 60 * sin(t * 1.1 + 1.0),
    200 + 40 * sin(t * 0.7 + 2.0)
  );
  const driftB = color(
    200 + 40 * sin(t * 0.9 + 1.7),
    210 + 30 * sin(t * 0.6 + 0.4),
    255
  );
  drawVerticalGradient(driftA, driftB);

  // --- Shape centered in canvas ---
  push();
  translate(width / 2, height / 2);
  const s = sizeSlider.value();
  const rot = radians(rotSlider.value());

  if (strokeChk.checked()) {
    stroke(0, 60);
    strokeWeight(strokeSlider.value());
  } else noStroke();

  fill(shapeColor);
  rotate(rot);

  const choice = shapeSelect.value();
  if (choice === "ellipse") ellipse(0, 0, s, s);
  else if (choice === "rect") {
    rectMode(CENTER);
    rect(0, 0, s, s);
  } else if (choice === "triangle") {
    triangle(-s * 0.6, s * 0.5, 0, -s * 0.6, s * 0.6, s * 0.5);
  }
  pop();

}

// --- Helpers ---
function drawVerticalGradient(c1, c2) {
  for (let y = 0; y < height; y++) {
    const amt = y / (height - 1);
    const c = lerpColor(c1, c2, amt);
    stroke(c);
    line(0, y, width, y);
  }
}

function makeLabel(parent, textStr) {
  const lbl = createP(textStr);
  lbl.parent(parent);
  lbl.style("margin", "8px 0 6px 0");
  lbl.style("font-weight", "600");
  lbl.style("font-size", "12px");
  lbl.style("color", "#444");
}

// 🔹 helper to style sliders uniformly
function styleSlider(slider) {
  slider.style("width", "100%");
  slider.style("margin-bottom", "10px");
  slider.style("accent-color", "#66a6ff"); // modern color highlight
}
