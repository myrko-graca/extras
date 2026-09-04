
const canvas = document.getElementById('mandelbrot');
const ctx = canvas.getContext('2d');
const width = canvas.width;
const height = canvas.height;
const paletteSelect = document.getElementById('palette');
const zoomSelect = document.getElementById('zoomLevel');
const infoDiv = document.getElementById('info');

let zoom = 200;
let offsetX = -2.5;
let offsetY = -1.5;
const tileSize = 100;
let palette = 'gray';
let zoomFactor = zoomSelect.value;

function getMaxIterations(zoomLevel) {
  return Math.floor(100 + Math.pow(Math.log10(zoomLevel), 4) * 10);
}

let contDraw = 0;
function drawTile(xStart, yStart) {
  const worker = new Worker('worker.js?3');
  const maxIter = getMaxIterations(zoom); 
  //console.log("drawTile", maxIter);
  contDraw++;
  worker.postMessage({
    xStart,
    yStart,
    tileSize,
    zoom,
    offsetX,
    offsetY,
    maxIter,
    palette
  });

  worker.onmessage = (e) => {
    const imageData = new ImageData(
      new Uint8ClampedArray(e.data.pixels),
      tileSize,
      tileSize
    );
    ctx.putImageData(imageData, xStart, yStart);
	contDraw--;
	//console.log("contDraw", contDraw);
	if (contDraw == 0) {
		canvas.addEventListener('click', aoClicarCanvas);
		canvas.style.cursor = 'crosshair'; 
	}
    worker.terminate();
  };
}

function drawFullCanvas() {
  infoDiv.textContent = `Centro: (${(offsetX + width/(2*zoom)).toFixed(5)}, ${(offsetY + height/(2*zoom)).toFixed(5)}) | Zoom: ${zoom.toFixed(2)}`;
  canvas.removeEventListener('click', aoClicarCanvas);
  canvas.style.cursor = 'wait'; 
  for (let x = 0; x < width; x += tileSize) {
    for (let y = 0; y < height; y += tileSize) {
      drawTile(x, y);
    }
  }
}
function aoClicarCanvas(e) {
  const rect = canvas.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;

  const newCenterX = clickX / zoom + offsetX;
  const newCenterY = clickY / zoom + offsetY;

  zoom *= zoomFactor;
  console.log("aoClicarCanvas", zoom, zoomFactor);
  offsetX = newCenterX - width / (2 * zoom);
  offsetY = newCenterY - height / (2 * zoom);
  drawFullCanvas();
}
paletteSelect.addEventListener('change', () => {
  palette = paletteSelect.value;
  drawFullCanvas();
});

zoomSelect.addEventListener('change', () => {
  zoomFactor = parseFloat(zoomSelect.value);
});

drawFullCanvas();

