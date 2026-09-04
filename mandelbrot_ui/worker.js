
function getColor(iter, maxIter, palette) {
  const t = iter / maxIter;
  if (iter === maxIter) return [0, 0, 0];
  switch (palette) {
    case 'convergence_smooth':
      return [
        Math.floor(255 * Math.pow(t, 0.3)),
        Math.floor(255 * Math.pow(t, 0.5)),
        Math.floor(255 * Math.pow(t, 0.8))
      ];
    case 'convergence_red':
      return [
        Math.floor(255 * t),
        Math.floor(100 * Math.pow(t, 0.5)),
        Math.floor(100 * Math.pow(t, 0.3))
      ];
    case 'convergence_green':
      return [
        Math.floor(100 * Math.pow(t, 0.3)),
        Math.floor(255 * t),
        Math.floor(100 * Math.pow(t, 0.5))
      ];
    case 'preto_branco':
	  let r = iter % 2;
	  if (r == 0) {
		return [0,0,0];
	  } else {
		return [255,255,255];
	  }
    default:
      const gray = 255 - Math.floor(t * 800);
      return [gray, gray, gray];
  }
}

onmessage = function(e) {
  const { xStart, yStart, tileSize, zoom, offsetX, offsetY, maxIter, palette } = e.data;
  const pixels = new Uint8ClampedArray(tileSize * tileSize * 4);

  for (let px = 0; px < tileSize; px++) {
    for (let py = 0; py < tileSize; py++) {
      const x0 = (xStart + px) / zoom + offsetX;
      const y0 = (yStart + py) / zoom + offsetY;

      let real = x0;
      let imag = y0;
      let i;
      for (i = 0; i < maxIter; i++) {
        const real2 = real * real - imag * imag + x0;
        const imag2 = 2 * real * imag + y0;
        real = real2;
        imag = imag2;
        if (real * real + imag * imag > 4) break;
      }
      const [r, g, b] = getColor(i, maxIter, palette);
      const index = (py * tileSize + px) * 4;
      pixels[index] = r;
      pixels[index + 1] = g;
      pixels[index + 2] = b;
      pixels[index + 3] = 255;
    }
  }
  postMessage({ pixels });
};
