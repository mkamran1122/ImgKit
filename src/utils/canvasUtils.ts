/**
 * Pure client-side Canvas utility library for ImgKit.
 * Performs all image editing directly in the user's browser.
 */

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Convert standard sRGB channel to linear RGB
 */
export function sRGBToLinear(c: number): number {
  const v = c / 255;
  return v > 0.04045 ? Math.pow((v + 0.055) / 1.055, 2.4) : v / 12.92;
}

/**
 * Convert sRGB (0-255) to CIELAB color space (D65 standard illuminant).
 * Used for perceptual color distance calculations.
 */
export function rgbToLab(r: number, g: number, b: number): [number, number, number] {
  const rL = sRGBToLinear(r);
  const gL = sRGBToLinear(g);
  const bL = sRGBToLinear(b);

  // Standard D65 observer XYZ conversion
  const x = (rL * 0.4124564 + gL * 0.3575761 + bL * 0.1804375) / 0.95047;
  const y = (rL * 0.2126729 + gL * 0.7151522 + bL * 0.0721750) / 1.00000;
  const z = (rL * 0.0193339 + gL * 0.1191920 + bL * 0.9503041) / 1.08883;

  const fx = x > 0.00885645 ? Math.cbrt(x) : (7.787037 * x) + (16 / 116);
  const fy = y > 0.00885645 ? Math.cbrt(y) : (7.787037 * y) + (16 / 116);
  const fz = z > 0.00885645 ? Math.cbrt(z) : (7.787037 * z) + (16 / 116);

  const L = (116 * fy) - 16;
  const aVal = 500 * (fx - fy);
  const bVal = 200 * (fy - fz);
  return [L, aVal, bVal];
}

/**
 * CIELAB Delta-E (CIE76) color difference between two Lab points.
 * Values: 0 = identical, ~2.3 = JND (just noticeable difference), >20 = distinct colors.
 */
export function labDeltaE(
  L1: number, a1: number, b1: number,
  L2: number, a2: number, b2: number
): number {
  const dL = L1 - L2;
  const da = a1 - a2;
  const db = b1 - b2;
  return Math.sqrt(dL * dL + da * da + db * db);
}

/**
 * Direct CIELAB Delta-E calculation between two sRGB colors.
 */
export function rgbDeltaE(
  r1: number, g1: number, b1: number,
  r2: number, g2: number, b2: number
): number {
  const [L1, a1, b1Val] = rgbToLab(r1, g1, b1);
  const [L2, a2, b2Val] = rgbToLab(r2, g2, b2);
  return labDeltaE(L1, a1, b1Val, L2, a2, b2Val);
}

/**
 * Remove background based on sampled RGB color using CIELAB Delta-E perceptual color distance,
 * with edge feathering and optional contiguous edge-flood protection.
 */
export function removeBackgroundColor(
  sourceCanvas: HTMLCanvasElement,
  targetR: number,
  targetG: number,
  targetB: number,
  tolerance: number, // 1 - 100
  feather = 5,
  contiguous = true,
  defringe = true
): HTMLCanvasElement {
  const output = document.createElement('canvas');
  output.width = sourceCanvas.width;
  output.height = sourceCanvas.height;
  const ctx = output.getContext('2d');
  if (!ctx) return sourceCanvas;

  ctx.drawImage(sourceCanvas, 0, 0);
  const imgData = ctx.getImageData(0, 0, output.width, output.height);
  const data = imgData.data;
  const width = output.width;
  const height = output.height;

  const [tL, ta, tb] = rgbToLab(targetR, targetG, targetB);

  // Map tolerance slider (1-100) to CIELAB Delta-E (typically 1 to 75)
  const maxDeltaE = tolerance * 0.8;
  const featherRange = (feather / 100) * maxDeltaE;

  if (contiguous) {
    // Breadth-First Flood Fill starting from image borders
    const isBg = new Uint8Array(width * height);
    const queue = new Int32Array(width * height);
    let head = 0;
    let tail = 0;

    // Helper to evaluate a pixel
    const checkPixel = (x: number, y: number) => {
      const idx = (y * width + x) * 4;
      if (data[idx + 3] === 0) return 0; // already transparent
      const [pL, pa, pb] = rgbToLab(data[idx], data[idx + 1], data[idx + 2]);
      return labDeltaE(tL, ta, tb, pL, pa, pb);
    };

    // Seed top & bottom edges
    for (let x = 0; x < width; x++) {
      // Top
      const dTop = checkPixel(x, 0);
      if (dTop <= maxDeltaE) {
        isBg[x] = 1;
        queue[tail++] = (0 << 16) | x;
      }
      // Bottom
      const yBot = height - 1;
      const dBot = checkPixel(x, yBot);
      if (dBot <= maxDeltaE && !isBg[yBot * width + x]) {
        isBg[yBot * width + x] = 1;
        queue[tail++] = (yBot << 16) | x;
      }
    }

    // Seed left & right edges
    for (let y = 0; y < height; y++) {
      // Left
      const dLeft = checkPixel(0, y);
      if (dLeft <= maxDeltaE && !isBg[y * width]) {
        isBg[y * width] = 1;
        queue[tail++] = (y << 16) | 0;
      }
      // Right
      const xRight = width - 1;
      const dRight = checkPixel(xRight, y);
      if (dRight <= maxDeltaE && !isBg[y * width + xRight]) {
        isBg[y * width + xRight] = 1;
        queue[tail++] = (y << 16) | xRight;
      }
    }

    // Process BFS Queue
    while (head < tail) {
      const current = queue[head++];
      const cy = current >> 16;
      const cx = current & 0xffff;

      // 4-neighborhood
      const neighbors = [
        [cx + 1, cy],
        [cx - 1, cy],
        [cx, cy + 1],
        [cx, cy - 1]
      ];

      for (let i = 0; i < 4; i++) {
        const nx = neighbors[i][0];
        const ny = neighbors[i][1];
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const nIdx = ny * width + nx;
          if (isBg[nIdx] === 0) {
            const dist = checkPixel(nx, ny);
            if (dist <= maxDeltaE) {
              isBg[nIdx] = 1;
              queue[tail++] = (ny << 16) | nx;
            }
          }
        }
      }
    }

    // Apply alpha transparency to background-marked pixels with smooth feathering
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pIdx = y * width + x;
        if (isBg[pIdx] === 1) {
          const byteIdx = pIdx * 4;
          const a = data[byteIdx + 3];
          if (a === 0) continue;

          const [pL, pa, pb] = rgbToLab(data[byteIdx], data[byteIdx + 1], data[byteIdx + 2]);
          const dist = labDeltaE(tL, ta, tb, pL, pa, pb);

          if (featherRange > 0 && dist > (maxDeltaE - featherRange)) {
            const ratio = (dist - (maxDeltaE - featherRange)) / featherRange;
            const smoothRatio = ratio * ratio * (3 - 2 * ratio);
            const newAlpha = Math.round(smoothRatio * a);
            data[byteIdx + 3] = newAlpha;

            // Halo defringing
            if (defringe && newAlpha > 0 && newAlpha < 250) {
              const alphaNorm = newAlpha / 255;
              data[byteIdx] = Math.min(255, Math.max(0, Math.round((data[byteIdx] - (1 - alphaNorm) * targetR) / alphaNorm)));
              data[byteIdx + 1] = Math.min(255, Math.max(0, Math.round((data[byteIdx + 1] - (1 - alphaNorm) * targetG) / alphaNorm)));
              data[byteIdx + 2] = Math.min(255, Math.max(0, Math.round((data[byteIdx + 2] - (1 - alphaNorm) * targetB) / alphaNorm)));
            }
          } else {
            data[byteIdx + 3] = 0;
          }
        }
      }
    }
  } else {
    // Global color keying across every pixel
    for (let i = 0; i < data.length; i += 4) {
      const a = data[i + 3];
      if (a === 0) continue;

      const [pL, pa, pb] = rgbToLab(data[i], data[i + 1], data[i + 2]);
      const dist = labDeltaE(tL, ta, tb, pL, pa, pb);

      if (dist <= maxDeltaE) {
        if (featherRange > 0 && dist > (maxDeltaE - featherRange)) {
          const ratio = (dist - (maxDeltaE - featherRange)) / featherRange;
          const smoothRatio = ratio * ratio * (3 - 2 * ratio);
          const newAlpha = Math.round(smoothRatio * a);
          data[i + 3] = newAlpha;

          if (defringe && newAlpha > 0 && newAlpha < 250) {
            const alphaNorm = newAlpha / 255;
            data[i] = Math.min(255, Math.max(0, Math.round((data[i] - (1 - alphaNorm) * targetR) / alphaNorm)));
            data[i + 1] = Math.min(255, Math.max(0, Math.round((data[i + 1] - (1 - alphaNorm) * targetG) / alphaNorm)));
            data[i + 2] = Math.min(255, Math.max(0, Math.round((data[i + 2] - (1 - alphaNorm) * targetB) / alphaNorm)));
          }
        } else {
          data[i + 3] = 0;
        }
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return output;
}

/**
 * Download a canvas as a file.
 */
export function downloadCanvas(
  canvas: HTMLCanvasElement,
  filename: string,
  format: 'image/png' | 'image/jpeg' | 'image/webp' = 'image/png',
  quality = 0.92
): void {
  canvas.toBlob(
    (blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    },
    format,
    quality
  );
}

/**
 * Convert canvas to Blob with quality
 */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: string = 'image/png',
  quality = 0.92
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to create image blob'));
      },
      format,
      quality
    );
  });
}

/**
 * Product Photo Maker Generator:
 * Takes product image, applies background color or gradient, adds canvas padding,
 * centers the product, adds realistic soft drop shadow, and outputs target resolution.
 */
export function generateProductPhoto(
  productImg: HTMLImageElement | HTMLCanvasElement,
  options: {
    targetWidth: number;
    targetHeight: number;
    paddingPercent: number; // e.g. 15 = 15%
    bgColor: string;
    shadowBlur: number;
    shadowOffsetY: number;
    shadowOpacity: number;
  }
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = options.targetWidth;
  canvas.height = options.targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // 1. Draw Background
  if (options.bgColor.startsWith('linear-gradient')) {
    // Basic gradient fallback or soft studio gradient
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#f8fafc');
    grad.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = options.bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // 2. Calculate scaled product dimensions within padded bounds
  const padX = (canvas.width * options.paddingPercent) / 100;
  const padY = (canvas.height * options.paddingPercent) / 100;
  const availW = canvas.width - padX * 2;
  const availH = canvas.height - padY * 2;

  const scale = Math.min(availW / productImg.width, availH / productImg.height);
  const drawW = productImg.width * scale;
  const drawH = productImg.height * scale;
  const drawX = (canvas.width - drawW) / 2;
  const drawY = (canvas.height - drawH) / 2;

  // 3. Draw Soft Floor / Contact Shadow
  if (options.shadowOpacity > 0) {
    ctx.save();
    const shadowGrad = ctx.createRadialGradient(
      canvas.width / 2,
      drawY + drawH + options.shadowOffsetY - 10,
      10,
      canvas.width / 2,
      drawY + drawH + options.shadowOffsetY - 10,
      drawW * 0.45
    );
    shadowGrad.addColorStop(0, `rgba(0, 0, 0, ${options.shadowOpacity})`);
    shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = shadowGrad;

    ctx.beginPath();
    ctx.ellipse(
      canvas.width / 2,
      drawY + drawH + options.shadowOffsetY - 10,
      drawW * 0.45,
      options.shadowBlur,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.restore();
  }

  // 4. Draw Product Image
  ctx.drawImage(productImg, drawX, drawY, drawW, drawH);

  return canvas;
}

/**
 * Passport Photo Sheet Arranger:
 * Takes single cropped passport portrait and lays it out in a grid on 4x6" (1200x1800 at 300dpi)
 * or A4 paper with precision trim/cut guides.
 */
export function generatePassportSheet(
  portraitCanvas: HTMLCanvasElement,
  options: {
    sheetType: '4x6' | 'A4';
    gridCols: number;
    gridRows: number;
    marginMm: number;
    showCutLines: boolean;
  }
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  // 300 DPI calculations
  // 4x6 inches = 1200 x 1800 pixels
  // A4 = 210 x 297 mm = 2480 x 3508 pixels
  if (options.sheetType === '4x6') {
    canvas.width = 1800; // Landscape or portrait
    canvas.height = 1200;
  } else {
    canvas.width = 2480;
    canvas.height = 3508;
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Clean white printable paper
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const totalCopies = options.gridCols * options.gridRows;
  if (totalCopies <= 0) return canvas;

  // Margin in pixels (approx 12 pixels per mm at 300dpi)
  const marginPx = options.sheetType === '4x6' ? 60 : 120;
  const availW = canvas.width - marginPx * 2;
  const availH = canvas.height - marginPx * 2;

  const cellW = availW / options.gridCols;
  const cellH = availH / options.gridRows;

  // Determine photo fit inside cell
  const scale = Math.min((cellW - 20) / portraitCanvas.width, (cellH - 20) / portraitCanvas.height);
  const photoW = portraitCanvas.width * scale;
  const photoH = portraitCanvas.height * scale;

  for (let r = 0; r < options.gridRows; r++) {
    for (let c = 0; c < options.gridCols; c++) {
      const cellX = marginPx + c * cellW;
      const cellY = marginPx + r * cellH;

      const px = cellX + (cellW - photoW) / 2;
      const py = cellY + (cellH - photoH) / 2;

      // Draw photo
      ctx.drawImage(portraitCanvas, px, py, photoW, photoH);

      // Cut lines / trim marks
      if (options.showCutLines) {
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(px, py, photoW, photoH);
        ctx.setLineDash([]);
      }
    }
  }

  // Header note at top margin
  ctx.fillStyle = '#64748b';
  ctx.font = '14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(
    `ImgKit Passport Photo Sheet (${options.sheetType}) • 300 DPI Print-Ready`,
    canvas.width / 2,
    marginPx / 2 + 10
  );

  return canvas;
}
