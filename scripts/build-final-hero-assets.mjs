import sharp from 'file:///C:/Users/akakp/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp/dist/index.mjs';

async function buildFinalHeroAssets() {
  const sourcePath = 'C:/Users/akakp/.gemini/antigravity/brain/6c721dee-7d06-4a2d-92fb-b74a2b38f58f/.user_uploaded/media_1790297378305.png';
  const img = sharp(sourcePath);
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });

  const W = info.width; // 1024
  const H = info.height; // 445

  function getSrc(x, y) {
    if (x < 0 || x >= W || y < 0 || y >= H) return [0, 0, 0, 255];
    const idx = (y * W + x) * info.channels;
    return [data[idx], data[idx + 1], data[idx + 2], data[idx + 3] ?? 255];
  }

  // Master artwork target:
  // Top of PRO letters starts at sy=196.
  // We start target at sy=190.
  // Pristine source runs to sy=325.
  // Phone bottom at ty = 168.
  // Ambient contact shadow and letter continuation to ty = 210.
  // Total art height: 220px.
  const artH = 220;
  const artBuf = Buffer.alloc(W * artH * 4, 0);

  function setArt(x, y, r, g, b, a = 255) {
    if (x < 0 || x >= W || y < 0 || y >= artH) return;
    const idx = (y * W + x) * 4;
    artBuf[idx] = Math.max(0, Math.min(255, Math.round(r)));
    artBuf[idx + 1] = Math.max(0, Math.min(255, Math.round(g)));
    artBuf[idx + 2] = Math.max(0, Math.min(255, Math.round(b)));
    artBuf[idx + 3] = Math.max(0, Math.min(255, Math.round(a)));
  }

  const yShift = -190; // sy=190 -> ty=0

  // 1. Copy pristine pixels from sy=190 to sy=325
  for (let sy = 190; sy <= 325; sy++) {
    const ty = sy + yShift;
    for (let x = 0; x < W; x++) {
      const [r, g, b, a] = getSrc(x, sy);
      setArt(x, ty, r, g, b, a);
    }
  }

  // Soft feather top 8 rows (ty=0..8) to pure black
  for (let ty = 0; ty < 8; ty++) {
    const f = ty / 8;
    for (let x = 0; x < W; x++) {
      const idx = (ty * W + x) * 4;
      artBuf[idx] = Math.round(artBuf[idx] * f);
      artBuf[idx + 1] = Math.round(artBuf[idx + 1] * f);
      artBuf[idx + 2] = Math.round(artBuf[idx + 2] * f);
    }
  }

  const cutY = 325 + yShift; // 135 in target

  // Geometry:
  const phoneBottomY = 168;
  const phoneLeftX = 186;
  const phoneRightX = 824;
  const cornerR = 22;

  // Pre-sample column base colors at cut line (sy=320..325)
  const colColors = [];
  for (let x = 0; x < W; x++) {
    let r = 0, g = 0, b = 0;
    for (let sy = 320; sy <= 325; sy++) {
      const p = getSrc(x, sy);
      r += p[0]; g += p[1]; b += p[2];
    }
    colColors.push([r / 6, g / 6, b / 6]);
  }

  // Synthesize from cutY (135) to artH (220)
  for (let x = 0; x < W; x++) {
    const [baseR, baseG, baseB] = colColors[x];
    const inPhoneX = (x >= phoneLeftX && x <= phoneRightX);

    for (let ty = cutY + 1; ty < artH; ty++) {
      let insidePhone = false;
      if (inPhoneX && ty <= phoneBottomY) {
        if (ty <= phoneBottomY - cornerR) {
          insidePhone = true;
        } else {
          const lCenter = phoneLeftX + cornerR;
          const rCenter = phoneRightX - cornerR;
          const cCenterY = phoneBottomY - cornerR;
          if (x >= lCenter && x <= rCenter) {
            insidePhone = true;
          } else if (x < lCenter) {
            const dx = lCenter - x;
            const dy = ty - cCenterY;
            insidePhone = (dx * dx + dy * dy <= cornerR * cornerR);
          } else {
            const dx = x - rCenter;
            const dy = ty - cCenterY;
            insidePhone = (dx * dx + dy * dy <= cornerR * cornerR);
          }
        }
      }

      if (insidePhone) {
        const distFromCut = ty - cutY;
        const totalSpan = phoneBottomY - cutY;
        const distToBottom = phoneBottomY - ty;

        let shade = 1.0;
        if (distToBottom <= 3) {
          shade = 1.25; // Subtle titanium rim highlight
        } else if (distToBottom <= 7) {
          shade = 0.92;
        } else {
          shade = 1.0 - (distFromCut / totalSpan) * 0.14;
        }

        if (x < phoneLeftX + 5) shade *= (0.65 + (x - phoneLeftX) * 0.07);
        else if (x > phoneRightX - 5) shade *= (0.65 + (phoneRightX - x) * 0.07);

        setArt(x, ty, baseR * shade, baseG * shade, baseB * shade, 255);
      } else {
        // Outside phone:
        const distBelow = ty - phoneBottomY;
        const inShadow = (x >= phoneLeftX - 15 && x <= phoneRightX + 15);

        if (inShadow && distBelow >= 0 && distBelow <= 36) {
          // Soft ambient contact shadow onto pure black
          const falloff = Math.exp(-distBelow / 7) * 0.18;
          setArt(x, ty, baseR * falloff, baseG * falloff, baseB * falloff, 255);
        } else {
          // Frosted letter continuation
          const isLetter = (x >= 134 && x <= 220) || (x >= 370 && x <= 630) || (x >= 635 && x <= 884);
          if (isLetter && ty <= 185) {
            const fade = Math.cos(((ty - cutY) / (185 - cutY)) * (Math.PI * 0.5));
            const easeFade = fade * fade;
            setArt(x, ty, baseR * easeFade, baseG * easeFade, baseB * easeFade, 255);
          } else {
            setArt(x, ty, 0, 0, 0, 255);
          }
        }
      }
    }
  }

  // Seam blur (cutY-2 to cutY+3)
  for (let ty = cutY - 2; ty <= cutY + 3; ty++) {
    for (let x = 1; x < W - 1; x++) {
      let sR = 0, sG = 0, sB = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = ((ty + ky) * W + (x + kx)) * 4;
          sR += artBuf[idx]; sG += artBuf[idx + 1]; sB += artBuf[idx + 2];
        }
      }
      const idx = (ty * W + x) * 4;
      artBuf[idx] = Math.round(artBuf[idx] * 0.7 + (sR / 9) * 0.3);
      artBuf[idx + 1] = Math.round(artBuf[idx + 1] * 0.7 + (sG / 9) * 0.3);
      artBuf[idx + 2] = Math.round(artBuf[idx + 2] * 0.7 + (sB / 9) * 0.3);
    }
  }

  // Bottom 25 rows (ty=195..220) fade completely to pure black
  for (let ty = 195; ty < artH; ty++) {
    const f = Math.max(0, 1 - (ty - 195) / 25);
    for (let x = 0; x < W; x++) {
      const idx = (ty * W + x) * 4;
      artBuf[idx] = Math.round(artBuf[idx] * f);
      artBuf[idx + 1] = Math.round(artBuf[idx + 1] * f);
      artBuf[idx + 2] = Math.round(artBuf[idx + 2] * f);
    }
  }

  // Left and right margins fade to pure black
  for (let ty = 0; ty < artH; ty++) {
    for (let x = 0; x < 50; x++) {
      const f = x / 50;
      const idx = (ty * W + x) * 4;
      artBuf[idx] = Math.round(artBuf[idx] * f);
      artBuf[idx + 1] = Math.round(artBuf[idx + 1] * f);
      artBuf[idx + 2] = Math.round(artBuf[idx + 2] * f);
    }
    for (let x = W - 50; x < W; x++) {
      const f = (W - 1 - x) / 50;
      const idx = (ty * W + x) * 4;
      artBuf[idx] = Math.round(artBuf[idx] * f);
      artBuf[idx + 1] = Math.round(artBuf[idx + 1] * f);
      artBuf[idx + 2] = Math.round(artBuf[idx + 2] * f);
    }
  }

  // Output 1: Desktop Master (1536 x 330, 1.5x upscaled with Lanczos3 + subtle sharpening for 2x Retina clarity)
  await sharp(artBuf, { raw: { width: W, height: artH, channels: 4 } })
    .resize(1536, 330, { kernel: 'lanczos3' })
    .sharpen({ sigma: 0.7, m1: 0.4, m2: 1.2 })
    .webp({ quality: 96, effort: 6 })
    .toFile('public/products/homepage/iphone-18-pro-hero.webp');

  await sharp('public/products/homepage/iphone-18-pro-hero.webp')
    .toFile('public/products/campaigns/iphone-18-pro-hero.webp');

  // Output 2: Mobile Master (800 x 280)
  // Cropped to focus sx = 100 to 924 (width: 824)
  await sharp(artBuf, { raw: { width: W, height: artH, channels: 4 } })
    .extract({ left: 100, top: 0, width: 824, height: artH })
    .resize(800, 240, { kernel: 'lanczos3' })
    .sharpen({ sigma: 0.7, m1: 0.4, m2: 1.2 })
    .webp({ quality: 96, effort: 6 })
    .toFile('public/products/homepage/iphone-18-pro-hero-mobile.webp');

  console.log('Final hero assets built successfully.');
}

buildFinalHeroAssets();
