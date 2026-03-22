const fileInput = document.getElementById("fileInput");
let imageDataOriginal = null;
let imageDataEditata = null;
//1
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let img = new Image();

fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    img.src = URL.createObjectURL(file);
  }
});

img.addEventListener("load", () => {
  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);

  imageDataOriginal = ctx.getImageData(0, 0, canvas.width, canvas.height);
  imageDataEditata = ctx.getImageData(0, 0, canvas.width, canvas.height);

  selection = { x: 0, y: 0, w: canvas.width, h: canvas.height };
  drawHistogram();
});

function saveImage() {
  const link = document.createElement("a");
  link.download = "pozaEditata.png";
  link.href = canvas.toDataURL();
  link.click();
}

//2
let startX,
  startY,
  selecting = false;
selection = { x: 0, y: 0, w: 0, h: 0 };

canvas.addEventListener("mousedown", (e) => {
  if (e.shiftKey) {
    moving = true;
  } else {
    selecting = true;
    startX = e.offsetX;
    startY = e.offsetY;
  }
});

canvas.addEventListener("mousemove", (e) => {
  if (selecting) {
    selection.x = startX;
    selection.y = startY;
    selection.w = e.offsetX - startX;
    selection.h = e.offsetY - startY;
    redraw();
    drawHistogram();
  } else if (moving) {
    selection.x += e.movementX;
    selection.y += e.movementY;
    redraw();
    drawHistogram();
  }
});

canvas.addEventListener("mouseup", () => {
  selecting = false;
  moving = false;
});

function redraw() {
  ctx.putImageData(imageDataEditata, 0, 0);

  if (selection.w > 0 && selection.h > 0) {
    ctx.strokeStyle = "pink";
    ctx.lineWidth = 2;
    ctx.strokeRect(selection.x, selection.y, selection.w, selection.h);
  }
}

//3

function crop() {
  const imageData = ctx.getImageData(
    selection.x,
    selection.y,
    selection.w,
    selection.h
  );
  canvas.width = selection.w;
  canvas.height = selection.h;
  ctx.putImageData(imageData, 0, 0);
  imageDataEditata = ctx.getImageData(0, 0, canvas.width, canvas.height);
}

//4
function grayscale() {
  const imgData = ctx.getImageData(
    selection.x,
    selection.y,
    selection.w,
    selection.h
  );
  for (let i = 0; i < imgData.data.length; i += 4) {
    const avg =
      (imgData.data[i] + imgData.data[i + 1] + imgData.data[i + 2]) / 3;

    imgData.data[i] = imgData.data[i + 1] = imgData.data[i + 2] = avg;
  }
  ctx.putImageData(imgData, selection.x, selection.y);
  imageDataEditata = ctx.getImageData(0, 0, canvas.width, canvas.height);

  drawHistogram();
}

//5
function resize() {
  const w = +newWidth.value;
  const h = (canvas.height * w) / canvas.width;

  const temp = document.createElement("canvas");
  temp.width = w;
  temp.height = h;
  temp.getContext("2d").drawImage(canvas, 0, 0, w, h);

  canvas.width = w;
  canvas.height = h;
  ctx.drawImage(temp, 0, 0);

  imageDataOriginal = ctx.getImageData(0, 0, canvas.width, canvas.height);
  imageDataEditata = ctx.getImageData(0, 0, canvas.width, canvas.height);

  selection = {
    x: 0,
    y: 0,
    w: canvas.width,
    h: canvas.height, 
  };
}

const text = document.getElementById("text");
const size = document.getElementById("size");
const color = document.getElementById("color");
const posX = document.getElementById("posX");
const posY = document.getElementById("posY");

//6
function addText() {
  const x = parseInt(posX.value, 10);
  const y = parseInt(posY.value, 10);
  const fontSize = parseInt(size.value, 10);

  ctx.fillStyle = color.value;
  ctx.font = `${fontSize}px Arial`;
  ctx.fillText(text.value, x, y);

  imageDataEditata = ctx.getImageData(0, 0, canvas.width, canvas.height);
  drawHistogram();
}

//7

const histCanvas = document.getElementById("histograma");
const hctx = histCanvas.getContext("2d");

let chart;
function drawHistogram() {
  const x = selection.w > 0 ? selection.x : 0;
  const y = selection.h > 0 ? selection.y : 0;
  const w = selection.w > 0 ? selection.w : canvas.width;
  const h = selection.h > 0 ? selection.h : canvas.height;

  const imageData = ctx.getImageData(x, y, w, h);
  const data = imageData.data;

  let histR = new Array(256).fill(0);
  let histG = new Array(256).fill(0);
  let histB = new Array(256).fill(0);

  for (let i = 0; i < data.length; i += 4) {
    histR[data[i]]++;
    histG[data[i + 1]]++;
    histB[data[i + 2]]++;
  }

  hctx.clearRect(0, 0, histCanvas.width, histCanvas.height);

  const max = Math.max(...histR, ...histG, ...histB);
  const scale = histCanvas.height / max;

  for (let i = 0; i < 256; i++) {
    hctx.fillStyle = "red";
    hctx.fillRect(i, histCanvas.height - histR[i] * scale, 1, histR[i] * scale);

    hctx.fillStyle = "green";
    hctx.fillRect(i, histCanvas.height - histG[i] * scale, 1, histG[i] * scale);

    hctx.fillStyle = "blue";
    hctx.fillRect(i, histCanvas.height - histB[i] * scale, 1, histB[i] * scale);
  }
}

//8

//9
function clearSelection() {
  ctx.fillStyle = "white";
  ctx.fillRect(selection.x, selection.y, selection.w, selection.h);
  imageDataEditata = ctx.getImageData(0, 0, canvas.width, canvas.height);
  drawHistogram();
}
