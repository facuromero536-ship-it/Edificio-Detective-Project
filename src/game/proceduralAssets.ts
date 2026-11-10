// Procedural Pixel & PBR Textures for Armstrong Manor (Zero external files)
import * as THREE from 'three';

export function createParquetFloorTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#261b14';
  ctx.fillRect(0, 0, 256, 256);

  // Parquet wood planks in alternating herringbone pattern
  const plankW = 64;
  const plankH = 16;
  const woodTones = ['#2f2018', '#38261d', '#281a13', '#402c21', '#1f140f'];

  for (let y = 0; y < 256; y += plankH) {
    for (let x = 0; x < 256; x += plankW) {
      const tone = woodTones[((x / plankW + y / plankH) | 0) % woodTones.length];
      ctx.fillStyle = tone;
      ctx.fillRect(x + 1, y + 1, plankW - 2, plankH - 2);

      // Wood grain lines
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.fillRect(x + 4, y + 4, plankW - 8, 2);
      ctx.fillRect(x + 8, y + 9, plankW - 14, 1);

      // Subtle highlight
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      ctx.fillRect(x + 1, y + 1, plankW - 2, 1);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = THREE.NearestFilter; // Crisp pixel art retro look!
  texture.minFilter = THREE.NearestFilter;
  return texture;
}

export function createCarpetTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  // Persian vintage red carpet
  ctx.fillStyle = '#611218';
  ctx.fillRect(0, 0, 128, 128);

  // Gold ornate border
  ctx.strokeStyle = '#c59b27';
  ctx.lineWidth = 4;
  ctx.strokeRect(6, 6, 116, 116);
  ctx.lineWidth = 1;
  ctx.strokeRect(12, 12, 104, 104);

  // Central diamond motif
  ctx.fillStyle = '#1c2833';
  ctx.beginPath();
  ctx.moveTo(64, 24);
  ctx.lineTo(104, 64);
  ctx.lineTo(64, 104);
  ctx.lineTo(24, 64);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#c59b27';
  ctx.beginPath();
  ctx.arc(64, 64, 12, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = THREE.NearestFilter;
  return texture;
}

export function createWallpaperTexture(type: 'lobby' | 'suite' | 'doctor' | 'attic'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  if (type === 'lobby') {
    // Vintage Emerald & Gold Deco
    ctx.fillStyle = '#132a24';
    ctx.fillRect(0, 0, 128, 128);
    ctx.strokeStyle = '#998144';
    ctx.lineWidth = 2;
    for (let x = 0; x < 128; x += 32) {
      ctx.beginPath();
      ctx.arc(x + 16, 64, 14, 0, Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x + 16, 64, 14, Math.PI, 0);
      ctx.stroke();
    }
  } else if (type === 'suite') {
    // Rich Burgundy Victorian stripe
    ctx.fillStyle = '#3d161d';
    ctx.fillRect(0, 0, 128, 128);
    ctx.fillStyle = '#4f1e27';
    for (let x = 0; x < 128; x += 16) {
      ctx.fillRect(x, 0, 8, 128);
    }
    ctx.fillStyle = 'rgba(212, 175, 55, 0.2)';
    for (let y = 16; y < 128; y += 32) {
      ctx.fillRect(0, y, 128, 2);
    }
  } else if (type === 'doctor') {
    // Academic Navy / Clinical Teal
    ctx.fillStyle = '#132331';
    ctx.fillRect(0, 0, 128, 128);
    ctx.fillStyle = '#182f42';
    for (let x = 0; x < 128; x += 16) {
      ctx.fillRect(x, 0, 8, 128);
    }
  } else {
    // Attic weathered rough plaster & wood beams
    ctx.fillStyle = '#222326';
    ctx.fillRect(0, 0, 128, 128);
    ctx.fillStyle = '#2d2e33';
    ctx.fillRect(0, 60, 128, 8);
    ctx.fillRect(60, 0, 8, 128);
  }

  // Base wainscoting wood paneling line at bottom
  ctx.fillStyle = '#18120e';
  ctx.fillRect(0, 100, 128, 28);
  ctx.fillStyle = '#3a251a';
  ctx.fillRect(0, 98, 128, 3);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 1);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = THREE.NearestFilter;
  return texture;
}

export function createBrickTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#18161a'; // mortar
  ctx.fillRect(0, 0, 128, 128);

  const brickW = 32;
  const brickH = 12;
  const colors = ['#422927', '#4f2e2a', '#392321', '#57332f'];

  for (let row = 0; row < 128 / brickH; row++) {
    const offsetX = (row % 2 === 0) ? 0 : brickW / 2;
    for (let col = -1; col < 128 / brickW + 1; col++) {
      ctx.fillStyle = colors[(row + col + 10) % colors.length];
      ctx.fillRect(col * brickW + offsetX + 1, row * brickH + 1, brickW - 2, brickH - 2);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = THREE.NearestFilter;
  return texture;
}

export function createElevatorGrilleTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 64, 64);
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 2;

  // Diamond lattice
  for (let i = -64; i < 128; i += 16) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 64, 64);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(i + 64, 0);
    ctx.lineTo(i, 64);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 4);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = THREE.NearestFilter;
  return texture;
}

export function createFloorPlacardTexture(floorNumber: number, title: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  // Brass plate
  ctx.fillStyle = '#b8860b';
  ctx.fillRect(0, 0, 128, 64);
  ctx.fillStyle = '#d4af37';
  ctx.fillRect(2, 2, 124, 60);
  ctx.strokeStyle = '#5c4308';
  ctx.lineWidth = 2;
  ctx.strokeRect(4, 4, 120, 56);

  ctx.fillStyle = '#1a1405';
  ctx.font = 'bold 24px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`PISO ${floorNumber}`, 64, 30);

  ctx.font = 'bold 11px sans-serif';
  ctx.fillText(title.toUpperCase(), 64, 48);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = THREE.NearestFilter;
  return texture;
}

export function createDarkShroudTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  // Deep pitch-black / shadowy silhouette facade
  ctx.fillStyle = '#08090c';
  ctx.fillRect(0, 0, 256, 128);

  // Faint dark brick outlines
  ctx.strokeStyle = '#12141a';
  ctx.lineWidth = 1;
  for (let y = 0; y < 128; y += 16) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(256, y);
    ctx.stroke();
  }

  // Creepy dark windows with subtle cold venetian blind silhouettes
  const winX = [32, 96, 160, 224];
  winX.forEach(x => {
    // Window frame
    ctx.fillStyle = '#050608';
    ctx.fillRect(x - 20, 20, 40, 70);
    ctx.strokeStyle = '#1a1c24';
    ctx.strokeRect(x - 20, 20, 40, 70);

    // Faint eerie teal/fog glint in the dark
    ctx.fillStyle = 'rgba(20, 35, 50, 0.35)';
    ctx.fillRect(x - 18, 22, 36, 66);

    // Blind slats
    ctx.fillStyle = '#0a0d13';
    for (let s = 25; s < 85; s += 8) {
      ctx.fillRect(x - 18, s, 36, 2);
    }
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = THREE.NearestFilter;
  return texture;
}

export function createNeonSignTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#090a0f';
  ctx.fillRect(0, 0, 512, 128);

  // Neon glow border
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 4;
  ctx.strokeRect(10, 10, 492, 108);

  // Red/Amber neon text
  ctx.shadowColor = '#f59e0b';
  ctx.shadowBlur = 18;
  ctx.fillStyle = '#fef3c7';
  ctx.font = '900 48px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('ARMSTRONG', 256, 62);

  ctx.shadowColor = '#ef4444';
  ctx.shadowBlur = 12;
  ctx.fillStyle = '#fca5a5';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('HOTEL & APARTMENTS · NOIR 1947', 256, 95);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

export function createStreetTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Wet dark pavement
  ctx.fillStyle = '#101217';
  ctx.fillRect(0, 0, 256, 256);

  // Cobblestone / sidewalk tiles
  ctx.strokeStyle = '#181a20';
  ctx.lineWidth = 2;
  for (let y = 0; y < 256; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(256, y);
    ctx.stroke();
  }
  for (let x = 0; x < 256; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 256);
    ctx.stroke();
  }

  // Rain puddles with ambient street reflection
  ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
  ctx.beginPath();
  ctx.ellipse(80, 80, 50, 25, 0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(245, 158, 11, 0.08)';
  ctx.beginPath();
  ctx.ellipse(190, 160, 40, 20, -0.3, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

