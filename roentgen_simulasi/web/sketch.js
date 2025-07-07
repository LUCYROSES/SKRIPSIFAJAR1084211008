let statusexpouse = false;
let preExposureState = false;
let curmilis = 0;
let waktutunda = 0;
let angle = 0;
let numLines = 10;
let lineX = new Array(numLines).fill(0);
let lineY = new Array(numLines).fill(0);
let lineSpeed = 5;
let lineSpacing = 9.5;
let simulasiSerialBuffer = [];
let Scolor = 6;
let gcolor = 2;
let foccolor = 0;
let fcolor = 0;
let E = 1;
let Sec = 0;
let mA = 0;
let kv = 0;
let selectedKvLine = -1; 
let kvValues = [120, 110, 100, 90, 80, 70, 60]; 
let prevKode = '';
let waveOffset = 0;  
let glowCanvas;  
let exposureStartTime = 0;  
let isExposing = false;   
let pulseOffset = 0;
let pulseSpeed = 2;
let pulseWidth = 50;
let ws;
let eventSource;
let exposureAllowed = true;

function setup() {
  createCanvas(1920, 1080);
  pixelDensity(1);  
  background(0);
  colorMode(HSB, 360, 100, 100, 100);
  

  glowCanvas = createGraphics(1920, 1080);
  glowCanvas.colorMode(HSB, 360, 100, 100, 100);
  

  let canvas = document.querySelector('canvas');
  if (canvas) {
    canvas.style.position = 'absolute';
    canvas.style.left = '0';
    canvas.style.top = '0';
  }
  
  
  for (let i = 0; i < numLines; i++) {
    lineX[i] = 1056;
    lineY[i] = 425 - (i * lineSpacing);
  }


  eventSource = new EventSource('http://localhost:8000/events');
  eventSource.onmessage = function(event) {
    const params = JSON.parse(event.data);
    console.log('Params received:', params);
    // Update parameters
    kv = Number(params.kv);
    mA = Number(params.mA);
    Sec = Number(params.Sec);
    

    if (params.kode === "p") {
      preExposureState = true;
      statusexpouse = false;
      window.mAmeter = 0;
      exposureAllowed = true;
    } else if (params.kode === "e") {
      if (exposureAllowed && !statusexpouse) {
        preExposureState = false;
        statusexpouse = true;
        window.mAmeter = mA;
        exposureStartTime = millis();
        exposureAllowed = false;
      }
    } else {
      preExposureState = false;
      statusexpouse = false;
      window.mAmeter = 0;
      exposureAllowed = true;
    }

   
    foccolor = mA;
    fcolor = (mA <= 200) ? 1 : 2;
    selectedKvLine = kvValues.indexOf(getNearestKV(kv));
  };
}

function drawWave(topX, topY, bottomWidth, height, brightness) {
  
  const numWaves = 15;  
  const baseAmplitude = 5; 
  const maxAmplitude = 20; 
  const baseFrequency = 0.1;  
  
  const waveAmplitude = map(mA, 50, 300, baseAmplitude, maxAmplitude);

  const frequency = map(kv, 40, 120, baseFrequency, baseFrequency * 2);
  
  const spreadDistance = map(kv, 40, 120, height, height * 1.2);

  const finalWidth = map(kv, 40, 120, bottomWidth, bottomWidth * 1.3);
  

  const scatterAmount = map(mA, 50, 300, 1, 3);
  
  
  glowCanvas.clear();
  
  
  for (let i = 0; i < numWaves; i++) {
    let t = i / (numWaves - 1); 
    let y = topY + spreadDistance * t; 
    let currentWidth = finalWidth * t;  
    
    let waveBrightness = map(t, 0, 1, brightness, brightness * 0.3);
    let hue = map(kv, 40, 120, 120, 160);  
    let saturation = map(kv, 40, 120, 100, 90); 
    
 
    beginShape();
    noFill();
    stroke(hue, saturation, waveBrightness);
    strokeWeight(2);
    
 
    for (let x = -currentWidth/2; x <= currentWidth/2; x += 5) {
      let xPos = topX + x;
  
      let scatter = random(-scatterAmount, scatterAmount);
      let currentAmplitude = waveAmplitude * t;

      let primaryWave = sin((x + waveOffset) * frequency) * currentAmplitude;
      let secondaryWave = sin((x + waveOffset * 1.5) * (frequency * 2)) * (currentAmplitude * 0.3);
      let yOffset = primaryWave + secondaryWave + scatter;
      vertex(xPos, y + yOffset);
      

      glowCanvas.stroke(hue, saturation, waveBrightness, 30);
      glowCanvas.strokeWeight(6);
      glowCanvas.point(xPos, y + yOffset);
    }
    endShape();
  }

  let glowAmount = map(mA, 50, 300, 10, 30);
  drawingContext.shadowBlur = glowAmount;
  drawingContext.shadowColor = color(120, 100, brightness, 50);
  

  blendMode(SCREEN);    
  image(glowCanvas, 0, 0);
  blendMode(NORMAL);
}

function drawLaserBeams(topX, topY, brightness) {
  const beamLength = 65;    
  const beamHeight = 25;    
  const dashLength = 15;    
  const dashGap = 10;      
  const speed = 1;          
  const numBeams = 4;      
  const beamSpacing = 5; 

  let laserBrightness = map(mA, 50, 300, 40, 100);

  stroke(200, 100, laserBrightness);  
  strokeWeight(2);
  
  for (let beam = 0; beam < numBeams; beam++) {

    let moveOffset = (frameCount * speed + beam * 5) % (dashLength + dashGap);
    
    
    let beamY = topY + (beam * beamSpacing);
    
    
    for (let x = moveOffset; x < beamLength; x += dashLength + dashGap) {
      let startX = topX + x;
      let endX = min(startX + dashLength, topX + beamLength);
            
      let yOffset = sin((frameCount + beam * 30) * 0.1) * 1;

      line(startX, beamY + yOffset, endX, beamY + yOffset);
    }
  }
  
  
  drawingContext.shadowBlur = map(mA, 50, 300, 5, 15);
  drawingContext.shadowColor = color(200, 100, laserBrightness, 50);
  
  strokeWeight(1);  
}

function draw() {
  console.log(`Current kV: ${kv}, mA: ${mA}, Sec: ${Sec}`);
  background(0);
  translate(400, 0);
  stroke(255);
  noFill();
  tanki();
  tabung();
  nilaiKV();
  nilaiS();
  nilaimA();
  nilaiKVmeter();
  nilaimAmeter();
  gariskvselctor();
  kvselector();
  nilaikvselector();
  nilaikvselector1();
  nilaikvselector2();
  nilaikvselector3();
  nilaikvselector4();
  nilaikvselector5();
  nilaikvselector6();
  judulSkripsi();
  filamen();
  panahfocalspot();

  if (statusexpouse) {
    let elapsedTime = (millis() - exposureStartTime) / 1000;
    if (elapsedTime >= Sec) {
      statusexpouse = false;
      preExposureState = true;
      exposureAllowed = false;
      // Kirim perintah ke server agar status kembali ke PRE
      fetch('http://localhost:8000/set_pre', { method: 'POST' });
    }
    let brightness = map(mA, 50, 300, 30, 100);
    drawWave(1035, 410, 270, 390, brightness);
    drawLaserBeams(970, 407, brightness);
    waveOffset -= 2;
    stroke(255);
    for (let i = 0; i < numLines; i++) {
      line(lineX[i], lineY[i], lineX[i] + 23, lineY[i]);
      lineY[i] += lineSpeed;
      if (lineY[i] >= 425) {
        lineY[i] = 425 - (numLines * lineSpacing);
      }
    }
    noStroke();
    fill(255);
    textSize(16);
    text(`Exposure: ${elapsedTime.toFixed(1)}s / ${Sec}s`, 10, 100);
  } else if (preExposureState) {
  
    stroke(180, 100, 100); 
    

    for (let i = 0; i < numLines; i++) {
      line(lineX[i], lineY[i], lineX[i] + 23, lineY[i]);
      lineY[i] += lineSpeed * 0.5; 
      if (lineY[i] >= 425) {
        lineY[i] = 425 - (numLines * lineSpacing);
      }
    }
    
    
    let selectedIndex = kvValues.indexOf(getNearestKV(kv));
    if (selectedIndex !== -1) {
      let y = 210 + (selectedIndex * 10);
      stroke(180, 100, 100);
      line(185, y, 197, 230);
      line(197, 230, 350, 230);
    }
    
   
    noStroke();
    fill(255);
    textSize(16);
    text("Pre-Exposure Ready", 10, 100);
  }

  fill(255);
  noStroke();
  textSize(16);
  text(`kV: ${kv}`, 10, 20);
  text(`mA: ${mA}`, 10, 40);
  text(`Sec: ${Sec}`, 10, 60);
  text(`Status: ${statusexpouse ? 'Exposing' : (preExposureState ? 'Pre-Exposure' : 'Ready')}`, 10, 80);
}

function renderStaticComponents() {

  tanki();
  tabung();
  nilaiKV();
  nilaiS();
  nilaimA();
  nilaiKVmeter();
  nilaimAmeter();
  gariskvselctor();
  kvselector();
  nilaikvselector();
  nilaikvselector1();
  nilaikvselector2();
  nilaikvselector3();
  nilaikvselector4();
  nilaikvselector5();
  nilaikvselector6();
  judulSkripsi();
  filamen();
  panahfocalspot();
}

function tabung() {
  stroke(255);
  noFill();
  
 
  line(810, 269, 1290, 269);
  

  line(870, 270, 870, 360);  
  line(870, 209, 870, 243); 
  arc(855, 299, 130, 84, PI, PI+QUARTER_PI);  

  line(1225, 309, 1225, 269);  
  line(1225, 209, 1225, 243);  
  arc(1200, 210, 50, 52, HALF_PI+PI, TWO_PI);  
  arc(930, 209, 120, 70, PI, PI+QUARTER_PI);
  
  line(1200, 184, 1120, 184);
  line(887, 184, 990, 184);
  

  line(1315, 295, 1315, 460);
  line(790, 300, 790, 460);
  line(815, 485, 990, 485);
  line(1080, 485, 1289, 485);
  line(920, 320, 920, 430);
  line(979, 460, 955, 430);
  line(980, 460, 1100, 460);
  line(920, 430, 955, 430);
  line(920, 320, 955, 320);
  line(980, 295, 1100, 295);
  line(981, 295, 955, 320);
  line(1100, 295, 1100, 340);
  line(1100, 460, 1100, 420);
  line(1035, 350, 1035, 410);
  line(1055, 425, 1035, 410);
  line(1035, 349, 1055, 337);
  line(1056, 425, 1079, 425);
  line(1056, 337, 1079, 337);
  line(1080, 337, 1080, 370);
  line(1080, 425, 1080, 395);
  line(1080, 370, 1190, 370);
  line(1080, 395, 1190, 395);
  line(1100, 340, 1215, 340);
  line(1100, 420, 1215, 420);
  line(1120, 350, 1185, 350);
  line(1120, 410, 1185, 410);
  line(1120, 350, 1120, 370);
  line(1120, 410, 1120, 395);
  line(1185, 350, 1185, 370);
  line(1185, 410, 1185, 395);
  line(1190, 360, 1190, 370);
  line(1190, 405, 1190, 395);
  line(1190, 406, 1250, 406);
  line(1190, 359, 1250, 359);
  line(1250, 359, 1250, 406);
  line(1215, 340, 1215, 359);
  line(1215, 406, 1215, 420);
  line(940, 369, 940, 430);
  line(920, 369, 940, 369);
  line(940, 425, 990, 425);
  line(940, 405, 990, 405);
  line(896, 383, 920, 383);
  line(990, 485, 985, 500);
  line(1085, 500, 1079, 485);
  line(1082, 495, 987, 495);

  
  rect(640, 226, 25, 25, 7);  
  rect(640, 260, 25, 25, 7);    
  rect(640, 365, 25, 25, 7);  
  rect(640, 403, 25, 25, 7);  
  rect(640, 446, 25, 25, 7);  
  

  rect(725, 360, 25, 25, 7);  
  rect(725, 403, 25, 25, 7);  
  rect(725, 446, 25, 25, 7);  


  rect(858, 243, 25, 25, 7);  
  rect(1213, 243, 25, 25, 7); 
  

  fill(255);  
  textSize(15);
  textAlign(CENTER, CENTER);
  text("A", 652, 238);  
  text("K", 652, 272);   
  
  text("SF", 652, 377);  
  text("C", 652, 415);   
  text("LF", 652, 458);  
  
  text("SF", 737, 372);  
  text("C", 737, 415);  
  text("LF", 737, 458);  

  
  text("K", 870, 255);  
  text("A", 1225, 255); 
  
  noFill();  
  textAlign(LEFT, BASELINE);  


  arc(1290, 460, 50, 50, 0, HALF_PI);
  arc(815, 460, 50, 50, HALF_PI, PI);
  arc(1290, 295, 50, 52, HALF_PI+PI, TWO_PI);
  arc(895, 358, 50, 50, HALF_PI, PI);
  arc(1250, 360, 50, 50, 0, HALF_PI);
  arc(1250, 360, 50, 52, HALF_PI+PI, TWO_PI);
  arc(1250, 309, 50, 50, HALF_PI, PI);
  

  ellipse(1108, 185, 25, 25);
  ellipse(1004, 185, 25, 25);
  rect(1017, 160, 75, 60);
}

function tanki()

{

  stroke(255);
  noFill();

  line (140, 210, 180, 210);

  line(140, 220, 180, 220);

  line(140, 230, 180, 230);

  line(140, 240, 180, 240);

  line(140, 250, 180, 250);

  line(140, 260, 180, 260);

  line (140, 270, 180, 270);

  line (185, 210, 197, 230);

  line(185, 220, 197, 230);
  line(185, 230, 197, 230);

  line(185, 240, 197, 230);

  line(185, 250, 197, 230);

  line(185, 260, 197, 230);
  line(185, 270, 197, 230);

  line(197, 230, 250, 230);

  line(268, 230, 250, 230);

  line(268, 230, 350, 230);

  quad (375, 295, 351, 295, 351, 224, 375, 224);

  quad(405, 255, 382, 255, 382, 229, 405, 229);

  quad(405, 290, 382, 290, 382, 265, 405, 265);

  quad(525, 407, 545, 407, 545, 425, 525, 425);

  quad(548, 407, 568, 407, 568, 425, 548, 425);

  quad(525, 443, 545, 443, 545, 463, 525, 463);

  quad(548, 443, 568, 443, 568, 463, 548, 463);

  noFill();

  line(80, 345, 100, 345);

  line(80, 375, 100, 375);

  quad(100, 505, 140, 505, 140, 200, 100, 200);

  quad(100, 405, 120, 405, 120, 310, 100, 310);


  rect(240,189,50,25);

  

  rect(233,487,50,25);

  ellipse(300, 258, 40, 40);
  line(300, 238, 300, 230);

  line(300, 290, 300, 279);

  

  line(140, 290, 350, 290);

  line(382, 283, 379, 283);
  line(382, 235,379,235);
  line(379, 283, 379, 235);

  line(525, 289, 405, 289);

  line(525, 230, 405, 230);

  line(525, 250, 525, 230);

  line(525, 289, 525, 260);

  line(525, 260, 540, 260);

  line(525, 250, 540, 250);

  line(525, 240, 540, 240);

  line(525, 270, 540, 270);

  line(540, 243, 540, 238);

  line(547, 243, 547, 238);

  line(540, 253, 540,248);

  line(547, 253, 547, 248);

  line(540, 263, 540, 258);

  line(547, 263, 547, 258);
  line(540, 273, 540, 268);

  line(547, 273, 547, 268);

  line(547, 260, 540, 258);

  line(547, 260, 540, 263);

  line(547, 240, 540, 238);

  line(547, 240, 540, 243);

  line(540, 250, 547, 248);

  line(540, 250, 547, 253);

  line(540, 270, 547, 268);

  line(540, 270, 547, 273);

  line(548, 240, 640, 240);

  line(548, 250, 560, 250);

  line(548, 260, 575, 260);

  line(548, 270, 640, 270);

  line(560, 250, 560, 270);

  line(575, 240, 575, 260);
  line(418, 253, 405, 253);
  line(415, 265, 405, 265);

  line(415, 265, 415, 280);

  line(420, 262, 420, 284);

  line(418, 253, 418, 243);
  line(418, 243, 440, 243);

  line(425, 262, 420, 262);

  line(415, 280, 440, 280);

  line(465, 261, 465, 238);

  line(440, 280, 440, 273);

  line(440, 250, 440, 243);

  line(465, 238, 483, 238);

  ellipse(483, 258, 30, 30);

  line(483, 285, 483, 273);

  line(483, 243, 483, 238);

  line(483, 285, 420, 285);

  line(455, 262, 465, 262);

  line(498, 262, 507, 262);

  line(507, 262, 507, 271);

  line(498, 271, 516, 271);

  line(500, 273, 514, 273);

  line(502, 275, 512, 275);
  line(504, 277, 510, 277);

  line(440, 251, 454, 262);

  line(440, 272, 454, 262);

  line(426, 262, 440, 271);
  line(426, 262, 440, 251);

  line(434, 262, 429, 270);

  line(435, 262, 438, 270);

  line(429, 270, 438, 270);

  line(440, 266, 449, 272);

  line(440, 266, 449, 265);

  line(449, 272, 449, 265);

  line(440, 256, 449, 252);

  line(450, 258, 449, 252);

  line(450, 259, 440, 256);

  line(435, 254, 428, 253);

  line(435, 260, 428, 253);

  line(436, 260, 436, 254);

  line(418, 433, 418, 480);

  line(418, 433, 525, 433);

  quad(525, 425, 568, 425, 568, 443, 525, 443);
  line(580, 409, 568, 409);
  line(600, 430, 568, 430);

  line(640, 460, 568, 460);

  line(580, 409, 580, 375);

  line(600, 415, 600, 430);
  line(580, 375, 640, 375);

  line(600, 415, 640, 415);

  rect(640, 365, 25, 25, 7);

  rect(640, 403, 25, 25, 7);

  rect(640, 446, 25, 25, 7);

  line(940, 415, 970, 415);

  line(750, 415, 920, 415);

  line(810, 425, 920, 425);

  line(810, 405, 920, 405);

  line(810, 372, 810, 405);

  line (810, 425, 810, 458);

  line(750, 372, 810, 372);

  line(750, 458, 810, 458);

  rect(725, 360, 25, 25, 7);

  rect(725, 403, 25, 25, 7);

  rect(725, 446, 25, 25, 7);

  rect(640, 226, 25, 25, 7);
  rect(640, 260, 25, 25, 7);

  rect(325,140,290,410,20);

  //FOCALSPOT

  line(140, 441, 230, 441);
  line(140, 480, 418, 480);

  line(270, 410, 275, 417);

  line(275, 410, 280, 417);

  line(280, 410, 285, 417);

  line(285, 410, 290, 417);

  line(275, 410, 275, 417);

  line(280, 410, 280, 417);

  line(285, 410, 285, 417);

  line(290, 410, 290, 417);

  line(270, 410, 270, 415);

  line(290, 410, 524, 410);

  line(260, 415, 270, 415);

  line(273, 423, 285, 405);

  line(288, 408, 288, 402);

  line(282, 402, 288, 402);

  line(288, 408, 282, 402);
  line(270, 460,275,467);
  line(275, 460, 280, 467);

  line(280, 460, 285, 467);

  line(285, 460, 290, 467);

  line(290, 460, 290, 467);
  line(285, 460, 285, 467);

  line(280, 460, 280, 467);

  line(275, 460, 275, 467);

  line(270, 460, 270, 465);

  line(290, 460, 524, 460);

  line(260, 465, 270, 465);

  line(273, 473, 285, 455);

  line(282, 452, 288, 452);

  line(288, 458, 288, 452);

  line(289, 458, 282, 452);

}

function judulSkripsi()

{

  textSize(33);

  fill(255);

  text("SIMULASI PESAWAT ROENTGEN KONVENSIONAL MENGGUNAKAN P5JS",100,70);
}
function nilaiKV(){
  fill(0);
  rect(1017, 160, 75, 60);
  fill(255);
  textSize(28);
  if (kv === 0) {
    text("", 1032, 200);
  } else {
    text(kv, 1032, 200);
  }
}

function nilaiS(){
  fill(0);
  rect(240, 189, 50, 25);
  fill(255);
  textSize(25);
  if (Sec === 0) {
    text("", 243, 211);
  } else {
    text(Sec, 243, 211);
  }
}
function nilaimA() {
  fill(0);
  rect(233, 487, 50, 25);
  fill(255);
  textSize(25);
  if (mA === 0) {
    text("", 233, 509);
  } else {
    text(mA, 233, 509);
  }
}
function nilaiKVmeter()
{
  fill(0);
  ellipse(300, 258, 40, 40);
  fill(255);
  textSize(20);
  if (kv === 0) {
    text("", 281, 265);
  } else {
    text(kv, 281, 265);
  }
}
function nilaimAmeter() {
  fill(0);
  ellipse(483, 258, 30, 30);
  textSize(15);
  fill(255);
  if (!window.mAmeter) {
    text(" ", 470, 265);
  } else {
    text(mA, 470, 265);
  }
}
function nilaikvselector() {
  textSize(10);
  fill(255);
  text("120", 145, 210);
}
function nilaikvselector1() {
  textSize(10);
  fill(255);
  text("110", 145, 220);
}
function nilaikvselector2() {
  textSize(10);
  fill(255);
  text("100", 145, 230);
}
function nilaikvselector3() {
  textSize(10);
  fill(255);
  text("90", 145, 240);
}
function nilaikvselector4() {
  textSize(10);
  fill(255);
  text("80", 145, 250);
}
function nilaikvselector5() {
  textSize(10);
  fill(255);
  text("70", 145, 260);
}
function nilaikvselector6() {
  textSize(10);
  fill(255);
  text("60", 145, 270);
}
function kvselector()
{
  textSize(15);
  fill(255);
  text("kV Selector", 145, 195);
}
function kvmeter()
{
  textSize(15);
  text("kV meter",257,308);
}
function mAmeterLabel()
{
  textSize(15);
  text("mA meter", 445,221);
}
function inputmA()
{ textSize(15);
text("Setting mA", 220,530);
}
function setupS()
{
  textSize(15);
  text("Setting S",240,180);
}
function Tanki()
{
  textSize(25);
  text("Tanki",440,545);
}
function A()
{
  textSize(15);
  text("A",684,244);
}
function A1()
{
  textSize(15);
  text("A",1221,260);
}
function K()
{
  textSize(15);
  text("K",684,279);
}
function K1()
{
  textSize(15);
  text("K",865,260);
}
function SF()
{
  textSize(15);
  text("SF",645,384);
}
function SF1()
{
  textSize(15);
  text("SF",730,379);
}
function C()
{
textSize(15);
text("C",684,421);
}
function C1()
{
  textSize(15);
  text("C",732,422);
}
function LF()
{
  textSize(15);
  text("LF",645,465);
}
function LF1()
{
  textSize(15);
  text("LF",370,464);
}
function  HasilKarya()
{
  textSize(15);
  text("BY: FAJAR DWI IHWANTO",1155,580);
}
function filamen()
{
  if(fcolor==0)
  {
    stroke(100);
    line(970, 407, 990, 407);

    line(970, 409, 990, 409);

    line(970, 411, 990, 411);

    line(970, 413, 990, 413);

    line(970, 415, 990, 415);

    line (970, 417, 990, 417);

    line(970, 419, 990, 419);

    line(970, 421, 990, 421);

    line(970, 423, 990, 423);
  }
  if(fcolor==1)
  {
    stroke(255);

    line(970, 407, 990, 407);

    line(970, 409, 990, 409);

    line(970, 411, 990, 411);

    line(970, 413, 990, 413);

    line (970, 415, 990, 415);

    stroke(100);

    line(970, 415, 990, 415);

    line(970, 417, 990, 417);

    line(970, 419, 990, 419);

    line(970, 421, 990, 421);

    line(970, 423, 990, 423);

  }

  if(fcolor==2)
  { 
    stroke(100);
    line(970, 407, 990, 407);

    line(970, 409, 990, 409);

    line (970, 411, 990, 411);

    line(970, 413, 990, 413);

    line(970, 415, 990, 415);

    stroke(255);

    line(970, 415, 990, 415);

    line(970, 417, 990, 417);

    line(970, 419, 990, 419);

    line(970, 421, 990, 421);

    line(970, 423, 990, 423);

  }

}

function getValue(data, separator, index) {
  const parts = data.split(separator);
  return parts[index] || "";
}

function getSubstringData() {
  let found = 0;
  let strIndex = [0, -1];
  let maxIndex = data.length - 1;

  for (let i = 0; i <= maxIndex && found <= index; i++) {
    if (data.charAt(i) === separator || i === maxIndex) {
      found++;
      strIndex[0] = strIndex[1] + 1;
      strIndex[1] = (i === maxIndex) ? i + 1 : i;
    }
  }
  
  return found > index ? data.substring(strIndex[0], strIndex[1]) : "";
}
function panahfocalspot()
{
  
  if(foccolor<=200)
  {
    strokeWeight(1);

    stroke(255);

    line(230, 441, 250, 425);

    line(255, 428, 247, 421);

    line(247, 421, 255, 420);

    line(255, 427, 256, 420);

    stroke(0);

    strokeWeight(2);

    line(230, 441, 250, 452);

    line(245, 455, 253, 449);
    line(253, 449, 255, 460);

    line(255, 461, 245, 456);

  }

  else

  {

    strokeWeight(2);

    stroke(0);

    line(230, 441, 250, 425);

    line(255, 428, 247, 421);

    line(247,421, 255,420);

    line(255, 427, 256, 420);

    stroke(255);

    strokeWeight(2);

    line(230, 441, 250, 452);

    line(245, 455, 253, 449);

    line(253, 449, 255, 460);

    line(255, 461, 245, 456);
  }
  strokeWeight(1);
}
function gariskvselctor() {
    stroke(255);
 
  for (let i = 0; i < kvValues.length; i++) {
    let y = 210 + (i * 10);
    
   
    let nearestKV = getNearestKV(kv);
    
    for (let i = 0; i < kvValues.length; i++) {
      if (kvValues[i] === nearestKV) {
        stroke(180, 100, 100);
        line(185, 210 + (i * 10), 197, 230);
      }
    }
    
    line(185, y, 197, 230);
  }
  
  
  let selectedIndex = kvValues.indexOf(getNearestKV(kv));
  if (selectedIndex !== -1 && (preExposureState || statusexpouse)) {  
    let y = 230;
    
    
    for (let x = 197; x <= 350; x++) {
      
      let distFromPulse = abs(x - (197 + pulseOffset));
      
      let brightness = map(distFromPulse, 0, pulseWidth, 100, 50);
      brightness = constrain(brightness, 50, 100);
      stroke(180, 100, brightness);
      line(x, y, x + 1, y);
    }
    
   
    pulseOffset = (pulseOffset + pulseSpeed) % (350 - 197);
    
    
    fill(180, 100, 100, 50); 
    stroke(255); 
    
    
    rect(350, 220, 25, 70); 
    rect(385, 220, 25, 25); 
    rect(385, 265, 25, 25); 
    
    noFill(); 
    stroke(255); 
  }
  
  
  fill(255);
  textSize(10);
  textAlign(RIGHT);
  for (let i = 0; i < kvValues.length; i++) {
    let y = 210 + (i * 10);
    text(kvValues[i], 180, y + 4);
  }
  textAlign(LEFT);
}


function getNearestKV(value) {
  if (value <= 60) return 60;
  if (value >= 120) return 120;
  
  
  let closest = kvValues.reduce((prev, curr) => {
    return kvValues.reduce((prev, curr)=> 
    Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev);

  });
  return closest;
}

function mousePressed() {
  
  if (mouseX >= 185 && mouseX <= 197 && mouseY >= 210 && mouseY <= 270) {
   
    let lineIndex = floor((mouseY - 210) / 10);
    if (lineIndex >= 0 && lineIndex <= 6) {
      selectedKvLine = lineIndex;
      kv = kvValues[lineIndex]; 
    }
  }
}

function radiasion() {
  stroke("#19D30D");
  fill("#19D30D");
  quad(1070, 56, 1000, 560, 1035, 412, 1050, 420);
}
function radiasioff() {
  stroke(0);
  fill(0);
  quad(1070, 560, 1000, 560, 1035, 412, 1050, 42);
  stroke(255);
  line(980, 460, 1100, 460);
  line(1082, 495, 987, 495);
}

function elektronon() {
  stroke("#DE0922");
  line(1000, 417, 1002, 417);
  line(1002, 419, 1004, 419);
  line(1000, 421, 1002, 417);
  line(1002, 423, 1004, 423);
  line(1005, 417, 1007, 417);
  line(1007,419,1009,419);
  line(1005, 421, 1007, 421);
  line(1007, 423, 1009, 423);
  line(1012, 417, 1014, 417);
  line(1014, 419, 1016, 419);
  line(1012, 421, 1014, 421);
  line(1014, 423, 1016, 423);
  line(1019, 417, 1021, 417);
  line(1021, 419, 1023, 419);
  line(1019, 421, 1021, 421);
  line(1021, 423, 1023, 423);
  line(1026, 417, 1028, 417);
  line(1031, 419, 1033, 419);
  line(1026, 421, 1028, 421);
  line(1031, 423, 1033, 423);
  line(1000, 407, 1002, 407);
  line(1002, 409, 1004, 409);
  line(1000, 411, 1002, 407);
  line(1002, 413, 1004, 413);
  line(1005, 407, 1007, 407);
  line(1007, 409, 1009, 409);
  line(1005,411,1007,411);
  line(1007, 413, 1009, 413);
  line(1012, 407, 1014, 407);
  line(1014, 409, 1016, 409);
  line(1012, 411, 1014, 411);
  line(1014, 413, 1016, 413);
  line(1019, 407, 1021, 407);
  line(1021, 409, 1023, 409);
  line(1019, 411, 1021, 411);
  line(1021, 413, 1023, 413);
  line(1026, 407, 1028, 407);
  line(1031, 409, 1033, 409);
  line(1026, 411, 1028, 411);
  line(1031, 413, 1033, 413);
}

function elektronoff() {
  stroke(0);
  line(1000, 417, 1002, 417);
  line(1002, 419, 1004, 419);
  line(1000, 421, 1002, 417);
  line(1002,423,1004,423);
  line(1005, 417, 1007, 417);
  line(1007, 419, 1009, 419);
  line(1005, 421, 1007, 421);
  line(1007, 423, 1009, 423);
  line(1012, 417, 1014, 417);
  line(1014, 419, 1016, 419);
  line(1012, 421, 1014, 421);
  line(1014, 423, 1016, 423);
  line(1019, 417, 1021, 417);
  line(1021, 419, 1023, 419);
  line(1019, 421, 1021, 421);
  line(1021, 423, 1023, 423);
  line(1026, 417, 1028, 417);
  line(1031, 419, 1033, 419);
  line(1026, 421, 1028, 421);
  line(1031, 423, 1033, 423);
  line(1000, 407, 1002, 407);
  line(1002, 409, 1004, 409);
  line(1000, 411, 1002, 407);
  line(1002, 413, 1004, 413);
  line(1005, 407, 1007, 407);
  line(1007, 409, 1009, 409);
  line(1005, 411, 1007, 411);
  line(1007, 413, 1009, 413);
  line(1012, 407, 1014, 407);
  line(1014, 409, 1016, 409);
  line(1012, 411, 1014, 411);
  line(1014, 413, 1016, 413);
  line(1019, 407, 1021, 407);
  line(1021, 409, 1023, 409);
  line(1019, 411, 1021, 411);
  line(1021, 413, 1023, 413);
  line(1026, 407, 1028, 407);
  line(1031, 409, 1033, 409);
  line(1026, 411, 1028, 411);
  line(1031, 413, 1033, 413);
}

function garistimeroff() {
  stroke(255);
  strokeWeight(1);
  line(265, 220, 250, 230);
  stroke(0);
  strokeWeight(2);
  line(250, 230, 267, 230);
}

function garistimeron() {
  stroke(0);
  strokeWeight(1);
  line(265, 220, 250, 230);
  stroke(255);
  strokeWeight(2);
  line(250, 230, 267, 230);
  strokeWeight(1);
}


if (preExposureState) {
    
    fill(170, 100, 90); 
    
    
    rect(870, 335, 65, 60); 
    
    
    rect(870, 335, 30, 25); 
    rect(905, 335, 30, 25); 
    rect(870, 370, 30, 25); 
    rect(905, 370, 30, 25); 
    noFill();
}
