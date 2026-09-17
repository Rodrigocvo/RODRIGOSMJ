import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Sparkles, 
  Crown, 
  Heart, 
  Sliders, 
  Camera, 
  Download, 
  RotateCcw, 
  X, 
  Eye, 
  Smile, 
  Palette,
  Check,
  Flame,
  Zap,
  Layers,
  SunMedium,
  Contrast,
  Droplets
} from 'lucide-react';

export type VirtualMaskType = 
  | 'none' 
  | 'tiara' 
  | 'crown' 
  | 'cat' 
  | 'glasses' 
  | 'sparkles' 
  | 'bunny' 
  | 'halo' 
  | 'venetian';

export type FilterPresetType = 
  | 'natural' 
  | 'glamour' 
  | 'sunkissed' 
  | 'vintage' 
  | 'cyberpunk' 
  | 'angelic';

interface LiveFilterCanvasProps {
  videoElement: HTMLVideoElement | null;
  fallbackImageUrl?: string;
  isHostAdmin?: boolean;
  onShowToast: (msg: string) => void;
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
  color: string;
  rotation: number;
  rotSpeed: number;
  type: 'star' | 'petal' | 'heart';
}

export function LiveFilterCanvas({
  videoElement,
  fallbackImageUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1600&auto=format&fit=crop',
  isHostAdmin = false,
  onShowToast,
  className = '',
}: LiveFilterCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fallbackImgRef = useRef<HTMLImageElement | null>(null);

  // Filter & Beautification controls state
  const [activeMask, setActiveMask] = useState<VirtualMaskType>('tiara');
  const [filterPreset, setFilterPreset] = useState<FilterPresetType>('glamour');
  const [beautifyLevel, setBeautifyLevel] = useState<number>(60); // 0 to 100
  const [blushLevel, setBlushLevel] = useState<number>(55); // 0 to 100
  const [brightness, setBrightness] = useState<number>(108); // 80 to 130
  const [contrast, setContrast] = useState<number>(106); // 80 to 130
  const [saturation, setSaturation] = useState<number>(115); // 80 to 150
  const [isMirrored, setIsMirrored] = useState<boolean>(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [particlesEnabled, setParticlesEnabled] = useState<boolean>(true);

  // Snapshot processing state
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [snapshotPreview, setSnapshotPreview] = useState<string | null>(null);

  // Dynamic particle state for animations
  const particlesRef = useRef<Particle[]>([]);
  const animFrameId = useRef<number | null>(null);
  const timeRef = useRef<number>(0);

  // Preload fallback image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = fallbackImageUrl;
    img.onload = () => {
      fallbackImgRef.current = img;
    };
  }, [fallbackImageUrl]);

  // Initialize background sparkles/petals
  useEffect(() => {
    const pList: Particle[] = [];
    for (let i = 0; i < 28; i++) {
      pList.push({
        x: Math.random() * 800,
        y: Math.random() * 600,
        size: 3 + Math.random() * 6,
        speedY: 0.5 + Math.random() * 1.2,
        speedX: (Math.random() - 0.5) * 0.8,
        opacity: 0.3 + Math.random() * 0.7,
        color: Math.random() > 0.4 ? '#ffd700' : '#ff75a0',
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.05,
        type: Math.random() > 0.5 ? 'star' : 'petal',
      });
    }
    particlesRef.current = pList;
  }, []);

  // Quick preset applicator
  const applyPreset = (preset: FilterPresetType) => {
    setFilterPreset(preset);
    switch (preset) {
      case 'natural':
        setBeautifyLevel(30);
        setBlushLevel(35);
        setBrightness(102);
        setContrast(102);
        setSaturation(105);
        break;
      case 'glamour':
        setBeautifyLevel(70);
        setBlushLevel(60);
        setBrightness(110);
        setContrast(108);
        setSaturation(120);
        break;
      case 'sunkissed':
        setBeautifyLevel(50);
        setBlushLevel(65);
        setBrightness(112);
        setContrast(105);
        setSaturation(135);
        break;
      case 'angelic':
        setBeautifyLevel(85);
        setBlushLevel(50);
        setBrightness(116);
        setContrast(100);
        setSaturation(110);
        setActiveMask('halo');
        break;
      case 'cyberpunk':
        setBeautifyLevel(40);
        setBlushLevel(45);
        setBrightness(105);
        setContrast(125);
        setSaturation(145);
        setActiveMask('glasses');
        break;
      case 'vintage':
        setBeautifyLevel(35);
        setBlushLevel(40);
        setBrightness(104);
        setContrast(115);
        setSaturation(85);
        break;
    }
    onShowToast(`Filtro "${preset.toUpperCase()}" aplicado com sucesso! ✨`);
  };

  // Main Canvas Render Loop
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    timeRef.current += 0.03;
    const time = timeRef.current;

    // Set internal resolution matching display
    const width = canvas.width || 800;
    const height = canvas.height || 450;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    ctx.save();

    // Mirror horizontal if enabled (selfie mode)
    if (isMirrored) {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }

    // 1. DRAW BASE SOURCE (Video Element or Fallback Image)
    let sourceRendered = false;
    if (videoElement && videoElement.readyState >= 2 && !videoElement.paused) {
      try {
        ctx.drawImage(videoElement, 0, 0, width, height);
        sourceRendered = true;
      } catch {
        sourceRendered = false;
      }
    }

    if (!sourceRendered && fallbackImgRef.current && fallbackImgRef.current.complete) {
      try {
        ctx.drawImage(fallbackImgRef.current, 0, 0, width, height);
        sourceRendered = true;
      } catch {
        sourceRendered = false;
      }
    }

    if (!sourceRendered) {
      // Dark elegant background fallback
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#1a0d18');
      bgGrad.addColorStop(1, '#0c0710');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);
    }

    // 2. APPLY COLOR GRADING & BEAUTY GLOW
    // Soft Beauty Skin Smoothing Pass: Draw luminous semi-transparent layer
    if (beautifyLevel > 0) {
      ctx.save();
      ctx.globalAlpha = (beautifyLevel / 100) * 0.28;
      ctx.globalCompositeOperation = 'screen';
      // Slight warm peach glow overlay
      const beautyGrad = ctx.createRadialGradient(
        width * 0.5, height * 0.45, width * 0.1,
        width * 0.5, height * 0.45, width * 0.55
      );
      beautyGrad.addColorStop(0, 'rgba(255, 230, 235, 0.9)');
      beautyGrad.addColorStop(0.6, 'rgba(255, 210, 220, 0.4)');
      beautyGrad.addColorStop(1, 'rgba(255, 180, 200, 0)');
      ctx.fillStyle = beautyGrad;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }

    // Tint preset tone
    if (filterPreset === 'sunkissed') {
      ctx.save();
      ctx.globalAlpha = 0.12;
      ctx.globalCompositeOperation = 'color-burn';
      ctx.fillStyle = '#ff8800';
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    } else if (filterPreset === 'cyberpunk') {
      ctx.save();
      ctx.globalAlpha = 0.15;
      ctx.globalCompositeOperation = 'overlay';
      const cyberGrad = ctx.createLinearGradient(0, 0, width, height);
      cyberGrad.addColorStop(0, '#ff007f');
      cyberGrad.addColorStop(1, '#00f0ff');
      ctx.fillStyle = cyberGrad;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    } else if (filterPreset === 'vintage') {
      ctx.save();
      ctx.globalAlpha = 0.16;
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = '#d4af37';
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }

    // 3. REAL-TIME BLUSH APPLICATION (Peachy Rosy Cheeks Layer)
    if (blushLevel > 0) {
      ctx.save();
      ctx.globalAlpha = (blushLevel / 100) * 0.48;
      ctx.globalCompositeOperation = 'source-over';

      // Face coordinate anchor points (relative optical center for camera view)
      const leftCheekX = width * 0.38;
      const rightCheekX = width * 0.62;
      const cheekY = height * 0.49 + Math.sin(time * 0.8) * 1.5;
      const cheekRadius = Math.min(width, height) * 0.11;

      // Left Cheek Blush
      const leftBlushGrad = ctx.createRadialGradient(
        leftCheekX, cheekY, 0,
        leftCheekX, cheekY, cheekRadius
      );
      leftBlushGrad.addColorStop(0, 'rgba(255, 75, 125, 0.9)');
      leftBlushGrad.addColorStop(0.5, 'rgba(255, 105, 150, 0.45)');
      leftBlushGrad.addColorStop(1, 'rgba(255, 120, 160, 0)');
      ctx.fillStyle = leftBlushGrad;
      ctx.beginPath();
      ctx.ellipse(leftCheekX, cheekY, cheekRadius * 1.25, cheekRadius * 0.85, -0.15, 0, Math.PI * 2);
      ctx.fill();

      // Right Cheek Blush
      const rightBlushGrad = ctx.createRadialGradient(
        rightCheekX, cheekY, 0,
        rightCheekX, cheekY, cheekRadius
      );
      rightBlushGrad.addColorStop(0, 'rgba(255, 75, 125, 0.9)');
      rightBlushGrad.addColorStop(0.5, 'rgba(255, 105, 150, 0.45)');
      rightBlushGrad.addColorStop(1, 'rgba(255, 120, 160, 0)');
      ctx.fillStyle = rightBlushGrad;
      ctx.beginPath();
      ctx.ellipse(rightCheekX, cheekY, cheekRadius * 1.25, cheekRadius * 0.85, 0.15, 0, Math.PI * 2);
      ctx.fill();

      // Subtle Nose Tip Touch
      const noseX = width * 0.5;
      const noseY = height * 0.48;
      const noseRadius = cheekRadius * 0.35;
      const noseGrad = ctx.createRadialGradient(noseX, noseY, 0, noseX, noseY, noseRadius);
      noseGrad.addColorStop(0, 'rgba(255, 90, 130, 0.55)');
      noseGrad.addColorStop(1, 'rgba(255, 100, 140, 0)');
      ctx.fillStyle = noseGrad;
      ctx.beginPath();
      ctx.arc(noseX, noseY, noseRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // 4. VIRTUAL MASKS LAYER (Overlays on head/face)
    const centerX = width * 0.5;
    const faceTopY = height * 0.28;

    // Reset mirroring for symmetrical masks text / elements if needed or keep aligned with selfie
    if (activeMask === 'crown') {
      // 👑 COROA DOURADA VIP
      ctx.save();
      const crownY = faceTopY - 20 + Math.sin(time * 2) * 3;
      const crownW = width * 0.32;
      const crownH = crownW * 0.55;

      // Glow behind crown
      const crownGlow = ctx.createRadialGradient(centerX, crownY + crownH * 0.5, 10, centerX, crownY + crownH * 0.5, crownW * 0.8);
      crownGlow.addColorStop(0, 'rgba(255, 215, 0, 0.5)');
      crownGlow.addColorStop(1, 'rgba(255, 215, 0, 0)');
      ctx.fillStyle = crownGlow;
      ctx.fillRect(centerX - crownW, crownY - 30, crownW * 2, crownH + 60);

      // Crown base gradient
      const goldGrad = ctx.createLinearGradient(centerX - crownW / 2, 0, centerX + crownW / 2, 0);
      goldGrad.addColorStop(0, '#e5a50a');
      goldGrad.addColorStop(0.3, '#fff282');
      goldGrad.addColorStop(0.5, '#ffd700');
      goldGrad.addColorStop(0.7, '#fff282');
      goldGrad.addColorStop(1, '#c98a00');

      ctx.fillStyle = goldGrad;
      ctx.strokeStyle = '#fff7b2';
      ctx.lineWidth = 3;

      // Crown path with 5 peaks
      ctx.beginPath();
      const bx = centerX - crownW * 0.5;
      const by = crownY + crownH;
      ctx.moveTo(bx, by);
      // Peak 1 (left)
      ctx.lineTo(bx - 10, crownY + crownH * 0.35);
      // Valley 1
      ctx.lineTo(bx + crownW * 0.2, crownY + crownH * 0.6);
      // Peak 2 (left inner)
      ctx.lineTo(bx + crownW * 0.3, crownY + crownH * 0.15);
      // Valley 2
      ctx.lineTo(bx + crownW * 0.42, crownY + crownH * 0.5);
      // Peak 3 (CENTER BIG)
      ctx.lineTo(centerX, crownY - 12);
      // Valley 3
      ctx.lineTo(bx + crownW * 0.58, crownY + crownH * 0.5);
      // Peak 4 (right inner)
      ctx.lineTo(bx + crownW * 0.7, crownY + crownH * 0.15);
      // Valley 4
      ctx.lineTo(bx + crownW * 0.8, crownY + crownH * 0.6);
      // Peak 5 (right)
      ctx.lineTo(bx + crownW + 10, crownY + crownH * 0.35);
      // Base bottom
      ctx.lineTo(bx + crownW, by);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Jewels on peaks
      const jewels = [
        { x: bx - 10, y: crownY + crownH * 0.35, r: 6, color: '#ff2e74' },
        { x: bx + crownW * 0.3, y: crownY + crownH * 0.15, r: 7, color: '#00d4ff' },
        { x: centerX, y: crownY - 12, r: 9, color: '#ff2e74' },
        { x: bx + crownW * 0.7, y: crownY + crownH * 0.15, r: 7, color: '#00d4ff' },
        { x: bx + crownW + 10, y: crownY + crownH * 0.35, r: 6, color: '#ff2e74' },
      ];

      jewels.forEach((j) => {
        ctx.beginPath();
        ctx.arc(j.x, j.y, j.r, 0, Math.PI * 2);
        ctx.fillStyle = j.color;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Shimmer shine
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(j.x - j.r * 0.3, j.y - j.r * 0.3, j.r * 0.35, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();
    } else if (activeMask === 'tiara') {
      // 🌸 TIARA FLORAL DE ROSAS & PÉTALAS
      ctx.save();
      const tiaraY = faceTopY - 8 + Math.sin(time * 1.5) * 2;
      const tiaraW = width * 0.34;

      // Tiara Vine arch
      ctx.beginPath();
      ctx.ellipse(centerX, tiaraY + 25, tiaraW * 0.5, 30, 0, Math.PI * 0.85, Math.PI * 2.15);
      ctx.strokeStyle = '#2d6a4f';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Flower nodes
      const flowers = [
        { x: centerX - tiaraW * 0.45, y: tiaraY + 28, r: 12, col: '#ff5c8a' },
        { x: centerX - tiaraW * 0.25, y: tiaraY + 12, r: 15, col: '#ff85a1' },
        { x: centerX, y: tiaraY + 4, r: 18, col: '#ff2e74' },
        { x: centerX + tiaraW * 0.25, y: tiaraY + 12, r: 15, col: '#ff85a1' },
        { x: centerX + tiaraW * 0.45, y: tiaraY + 28, r: 12, col: '#ff5c8a' },
      ];

      flowers.forEach((f) => {
        // Petals
        for (let p = 0; p < 5; p++) {
          const angle = (p * Math.PI * 2) / 5 + time * 0.1;
          const px = f.x + Math.cos(angle) * (f.r * 0.7);
          const py = f.y + Math.sin(angle) * (f.r * 0.7);
          ctx.beginPath();
          ctx.arc(px, py, f.r * 0.5, 0, Math.PI * 2);
          ctx.fillStyle = f.col;
          ctx.fill();
        }
        // Flower Center
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = '#fff475';
        ctx.fill();
      });

      ctx.restore();
    } else if (activeMask === 'cat') {
      // 🐱 GATINHA FOFA (Orelhinhas de Gatinha + Focinho + Bigodes)
      ctx.save();
      const earBaseY = faceTopY - 10;
      const earSpacing = width * 0.16;

      // Left Ear
      ctx.fillStyle = '#ff6b98';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(centerX - earSpacing - 35, earBaseY + 20);
      ctx.lineTo(centerX - earSpacing - 15, earBaseY - 50);
      ctx.lineTo(centerX - earSpacing + 25, earBaseY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Left Inner Ear
      ctx.fillStyle = '#ffd1dc';
      ctx.beginPath();
      ctx.moveTo(centerX - earSpacing - 25, earBaseY + 15);
      ctx.lineTo(centerX - earSpacing - 15, earBaseY - 35);
      ctx.lineTo(centerX - earSpacing + 15, earBaseY + 2);
      ctx.closePath();
      ctx.fill();

      // Right Ear
      ctx.fillStyle = '#ff6b98';
      ctx.beginPath();
      ctx.moveTo(centerX + earSpacing - 25, earBaseY);
      ctx.lineTo(centerX + earSpacing + 15, earBaseY - 50);
      ctx.lineTo(centerX + earSpacing + 35, earBaseY + 20);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Right Inner Ear
      ctx.fillStyle = '#ffd1dc';
      ctx.beginPath();
      ctx.moveTo(centerX + earSpacing - 15, earBaseY + 2);
      ctx.lineTo(centerX + earSpacing + 15, earBaseY - 35);
      ctx.lineTo(centerX + earSpacing + 25, earBaseY + 15);
      ctx.closePath();
      ctx.fill();

      // Cute Little Nose
      const noseY = height * 0.49;
      ctx.fillStyle = '#ff2e74';
      ctx.beginPath();
      ctx.moveTo(centerX - 8, noseY - 5);
      ctx.lineTo(centerX + 8, noseY - 5);
      ctx.lineTo(centerX, noseY + 4);
      ctx.closePath();
      ctx.fill();

      // Whiskers (3 on left, 3 on right)
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.2;
      ctx.lineCap = 'round';
      const whiskerY = noseY + 6;

      // Left whiskers
      ctx.beginPath();
      ctx.moveTo(centerX - 20, whiskerY - 6);
      ctx.lineTo(centerX - 80, whiskerY - 14);
      ctx.moveTo(centerX - 22, whiskerY);
      ctx.lineTo(centerX - 85, whiskerY);
      ctx.moveTo(centerX - 20, whiskerY + 6);
      ctx.lineTo(centerX - 80, whiskerY + 14);
      // Right whiskers
      ctx.moveTo(centerX + 20, whiskerY - 6);
      ctx.lineTo(centerX + 80, whiskerY - 14);
      ctx.moveTo(centerX + 22, whiskerY);
      ctx.lineTo(centerX + 85, whiskerY);
      ctx.moveTo(centerX + 20, whiskerY + 6);
      ctx.lineTo(centerX + 80, whiskerY + 14);
      ctx.stroke();

      ctx.restore();
    } else if (activeMask === 'glasses') {
      // 🕶️ ÓCULOS CYBER GLAM VIP
      ctx.save();
      const glassesY = height * 0.41;
      const lensW = width * 0.12;
      const lensH = lensW * 0.58;
      const bridgeW = width * 0.04;

      // Frame
      ctx.fillStyle = '#11131f';
      ctx.strokeStyle = '#ff2e74';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#ff2e74';
      ctx.shadowBlur = 15;

      // Left Lens
      const leftLensX = centerX - bridgeW / 2 - lensW;
      ctx.beginPath();
      ctx.roundRect(leftLensX, glassesY, lensW, lensH, 12);
      ctx.fill();
      ctx.stroke();

      // Right Lens
      const rightLensX = centerX + bridgeW / 2;
      ctx.beginPath();
      ctx.roundRect(rightLensX, glassesY, lensW, lensH, 12);
      ctx.fill();
      ctx.stroke();

      // Bridge
      ctx.beginPath();
      ctx.moveTo(centerX - bridgeW / 2, glassesY + lensH * 0.3);
      ctx.lineTo(centerX + bridgeW / 2, glassesY + lensH * 0.3);
      ctx.stroke();

      // Lens Tint & Neon Reflection
      ctx.shadowBlur = 0;
      const lensGrad = ctx.createLinearGradient(0, glassesY, 0, glassesY + lensH);
      lensGrad.addColorStop(0, 'rgba(255, 46, 116, 0.4)');
      lensGrad.addColorStop(1, 'rgba(0, 240, 255, 0.25)');
      ctx.fillStyle = lensGrad;
      ctx.fillRect(leftLensX + 4, glassesY + 4, lensW - 8, lensH - 8);
      ctx.fillRect(rightLensX + 4, glassesY + 4, lensW - 8, lensH - 8);

      // White slash reflection
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(leftLensX + 15, glassesY + 8);
      ctx.lineTo(leftLensX + 35, glassesY + lensH - 8);
      ctx.moveTo(rightLensX + 15, glassesY + 8);
      ctx.lineTo(rightLensX + 35, glassesY + lensH - 8);
      ctx.stroke();

      ctx.restore();
    } else if (activeMask === 'bunny') {
      // 🐰 ORELHAS DE COELHINHO
      ctx.save();
      const earBaseY = faceTopY - 15;
      const earH = height * 0.28;
      const earW = earH * 0.34;

      // Ear wobble
      const wobble = Math.sin(time * 2.5) * 4;

      // Left Bunny Ear
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#f0f0f0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(centerX - 40, earBaseY - earH * 0.4, earW, earH * 0.5, -0.15 + wobble * 0.01, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Left Inner Pink
      ctx.fillStyle = '#ffb3c6';
      ctx.beginPath();
      ctx.ellipse(centerX - 40, earBaseY - earH * 0.4, earW * 0.55, earH * 0.38, -0.15 + wobble * 0.01, 0, Math.PI * 2);
      ctx.fill();

      // Right Bunny Ear
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(centerX + 40, earBaseY - earH * 0.4, earW, earH * 0.5, 0.15 - wobble * 0.01, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Right Inner Pink
      ctx.fillStyle = '#ffb3c6';
      ctx.beginPath();
      ctx.ellipse(centerX + 40, earBaseY - earH * 0.4, earW * 0.55, earH * 0.38, 0.15 - wobble * 0.01, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    } else if (activeMask === 'halo') {
      // 😇 AURÉOLA ANGELICAL BRILHANTE
      ctx.save();
      const haloY = faceTopY - 45 + Math.sin(time * 2) * 5;
      const haloW = width * 0.24;
      const haloH = haloW * 0.32;

      ctx.shadowColor = '#ffd700';
      ctx.shadowBlur = 24;

      ctx.beginPath();
      ctx.ellipse(centerX, haloY, haloW * 0.5, haloH * 0.5, 0, 0, Math.PI * 2);
      ctx.strokeStyle = '#fff59d';
      ctx.lineWidth = 6;
      ctx.stroke();

      // Inner thin highlight
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.restore();
    } else if (activeMask === 'venetian') {
      // 🎭 MÁSCARA VENEZIANA DE CARNAVAL
      ctx.save();
      const maskY = height * 0.42;
      const maskW = width * 0.36;
      const maskH = maskW * 0.42;

      // Glowing lace base
      ctx.fillStyle = '#4a0e2e';
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 10;

      // Mask contour
      ctx.beginPath();
      const mx = centerX - maskW * 0.5;
      ctx.moveTo(mx, maskY);
      ctx.bezierCurveTo(mx + 30, maskY - 20, centerX - 20, maskY - 10, centerX, maskY + 5);
      ctx.bezierCurveTo(centerX + 20, maskY - 10, mx + maskW - 30, maskY - 20, mx + maskW, maskY);
      ctx.bezierCurveTo(mx + maskW + 10, maskY + maskH * 0.6, centerX + 40, maskY + maskH, centerX, maskY + maskH * 0.5);
      ctx.bezierCurveTo(centerX - 40, maskY + maskH, mx - 10, maskY + maskH * 0.6, mx, maskY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Eye cutouts
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.ellipse(centerX - maskW * 0.24, maskY + maskH * 0.28, maskW * 0.12, maskH * 0.22, -0.1, 0, Math.PI * 2);
      ctx.ellipse(centerX + maskW * 0.24, maskY + maskH * 0.28, maskW * 0.12, maskH * 0.22, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Gold filigree details
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, maskY + 5, 8, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    }

    // 5. FLOATING PARTICLES (Sparkles & Shimmering Magic)
    if (particlesEnabled || activeMask === 'sparkles') {
      ctx.save();
      const pList = particlesRef.current;
      pList.forEach((p) => {
        p.y -= p.speedY;
        p.x += p.speedX;
        p.rotation += p.rotSpeed;

        if (p.y < -20) {
          p.y = height + 20;
          p.x = Math.random() * width;
        }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity * (0.6 + Math.sin(time * 3 + p.x) * 0.4);

        if (p.type === 'star' || activeMask === 'sparkles') {
          // 4-Point Star Sparkle
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 8;
          ctx.beginPath();
          const s = p.size * (activeMask === 'sparkles' ? 1.6 : 1);
          ctx.moveTo(0, -s * 2);
          ctx.quadraticCurveTo(0, 0, s * 2, 0);
          ctx.quadraticCurveTo(0, 0, 0, s * 2);
          ctx.quadraticCurveTo(0, 0, -s * 2, 0);
          ctx.quadraticCurveTo(0, 0, 0, -s * 2);
          ctx.fill();
        } else {
          // Soft Petal / Heart
          ctx.fillStyle = '#ff75a0';
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });
      ctx.restore();
    }

    ctx.restore(); // Restore mirror transform

    animFrameId.current = requestAnimationFrame(renderCanvas);
  }, [
    activeMask, 
    filterPreset, 
    beautifyLevel, 
    blushLevel, 
    isMirrored, 
    particlesEnabled, 
    videoElement
  ]);

  // Start animation loop
  useEffect(() => {
    animFrameId.current = requestAnimationFrame(renderCanvas);
    return () => {
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
    };
  }, [renderCanvas]);

  // Capture Snapshot from Canvas
  const handleCaptureSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsCapturing(true);

    try {
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      setSnapshotPreview(dataUrl);
      onShowToast('Foto capturada com os filtros da live! 📸');
    } catch {
      onShowToast('Não foi possível capturar a foto neste navegador.');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleDownloadSnapshot = () => {
    if (!snapshotPreview) return;
    const a = document.createElement('a');
    a.href = snapshotPreview;
    a.download = `ruivinha-live-snap-${Date.now()}.jpg`;
    a.click();
    onShowToast('Foto salva no seu dispositivo!');
  };

  const masksList: { id: VirtualMaskType; label: string; icon: string }[] = [
    { id: 'none', label: 'Sem Máscara', icon: '✨' },
    { id: 'tiara', label: 'Tiara Floral', icon: '🌸' },
    { id: 'crown', label: 'Coroa VIP', icon: '👑' },
    { id: 'cat', label: 'Gatinha', icon: '🐱' },
    { id: 'glasses', label: 'Óculos Glam', icon: '🕶️' },
    { id: 'sparkles', label: 'Kira Brilho', icon: '✨' },
    { id: 'bunny', label: 'Coelhinha', icon: '🐰' },
    { id: 'halo', label: 'Auréola Anjo', icon: '😇' },
    { id: 'venetian', label: 'Veneziana', icon: '🎭' },
  ];

  const presetsList: { id: FilterPresetType; label: string; desc: string }[] = [
    { id: 'natural', label: 'Natural Clean', desc: 'Realce suave e leve' },
    { id: 'glamour', label: 'Glamour VIP', desc: 'Blush pronunciado & pele de porcelana' },
    { id: 'sunkissed', label: 'Golden Hour', desc: 'Bronze dourado e quente' },
    { id: 'angelic', label: 'Angélica', desc: 'Luz radiante e auréola' },
    { id: 'cyberpunk', label: 'Cyberpunk', desc: 'Cores neon e óculos escuros' },
    { id: 'vintage', label: 'Vintage 90s', desc: 'Saturação suave e tom quente' },
  ];

  return (
    <div className={`relative w-full h-full overflow-hidden select-none ${className}`}>
      {/* 1. Real-time Canvas Stage */}
      <canvas
        ref={canvasRef}
        width={960}
        height={540}
        className="w-full h-full object-cover block"
        style={{
          filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`,
        }}
      />

      {/* 2. Top-Right Quick Filter & Mask Badges */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <button
          onClick={() => setIsDrawerOpen(!isDrawerOpen)}
          className="px-3.5 py-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white text-xs font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95"
          title="Abrir painel de filtros e embelezamento"
        >
          <Sparkles size={14} className="text-[#ff4d88] animate-pulse" />
          <span>Filtros & Blush</span>
          {activeMask !== 'none' && (
            <span className="w-2 h-2 rounded-full bg-[#ff2e74]" />
          )}
        </button>

        <button
          onClick={handleCaptureSnapshot}
          disabled={isCapturing}
          className="p-2 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white text-xs transition-all active:scale-95"
          title="Tirar foto com os filtros da Live"
        >
          <Camera size={15} />
        </button>
      </div>

      {/* 3. Floating Quick Masks Bottom Selector Strip */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 max-w-[95%] overflow-x-auto no-scrollbar py-1 px-2">
        <div className="flex items-center gap-1.5 bg-black/65 backdrop-blur-lg px-2.5 py-1.5 rounded-full border border-white/15 shadow-2xl">
          {masksList.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                setActiveMask(m.id);
                onShowToast(`Máscara "${m.label}" ativada!`);
              }}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                activeMask === m.id
                  ? 'bg-gradient-to-r from-[#ff1a66] to-[#ff4d88] text-white shadow-[0_0_12px_rgba(255,46,116,0.6)] scale-105'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>{m.icon}</span>
              <span className="hidden sm:inline">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Complete Beautification & Blush Drawer / Popover */}
      {isDrawerOpen && (
        <div className="absolute top-14 right-4 z-30 w-80 max-w-[92vw] bg-[#0e101a]/95 backdrop-blur-xl border border-[#2a2f4c] rounded-2xl p-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col gap-4 text-white">
          <div className="flex items-center justify-between border-b border-[#212640] pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#ff2e74]/20 text-[#ff4d88] flex items-center justify-center">
                <Sliders size={16} />
              </div>
              <h4 className="font-bold text-sm">Estúdio de Embelezamento</h4>
            </div>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Quick Filter Presets */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-extrabold uppercase text-gray-400 flex items-center justify-between">
              <span>Presets de Imagem</span>
              <span className="text-[#ff4d88] font-bold">{filterPreset}</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {presetsList.map((p) => (
                <button
                  key={p.id}
                  onClick={() => applyPreset(p.id)}
                  className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all text-center truncate ${
                    filterPreset === p.id
                      ? 'bg-[#ff2e74] text-white shadow-md'
                      : 'bg-[#181b2a] text-gray-300 hover:bg-[#20253b]'
                  }`}
                  title={p.desc}
                >
                  {p.label.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Blush & Beautification Sliders */}
          <div className="flex flex-col gap-3 bg-[#131625] p-3 rounded-xl border border-[#22273e]">
            {/* Blush Slider */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-300 flex items-center gap-1.5 font-medium">
                  <Smile size={13} className="text-[#ff4d88]" />
                  <span>Intensidade do Blush</span>
                </span>
                <span className="font-mono text-[#ff4d88] font-bold">{blushLevel}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={blushLevel}
                onChange={(e) => setBlushLevel(Number(e.target.value))}
                className="w-full accent-[#ff2e74] h-1.5 bg-gray-700 rounded-lg cursor-pointer"
              />
            </div>

            {/* Beautify (Pele Suave / Glow) */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-300 flex items-center gap-1.5 font-medium">
                  <Sparkles size={13} className="text-amber-400" />
                  <span>Pele Suave (Beauty Glow)</span>
                </span>
                <span className="font-mono text-amber-400 font-bold">{beautifyLevel}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={beautifyLevel}
                onChange={(e) => setBeautifyLevel(Number(e.target.value))}
                className="w-full accent-amber-400 h-1.5 bg-gray-700 rounded-lg cursor-pointer"
              />
            </div>

            {/* Brilho */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-300 flex items-center gap-1.5 font-medium">
                  <SunMedium size={13} className="text-yellow-300" />
                  <span>Iluminação / Brilho</span>
                </span>
                <span className="font-mono text-gray-300 font-bold">{brightness}%</span>
              </div>
              <input
                type="range"
                min="80"
                max="135"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full accent-yellow-400 h-1.5 bg-gray-700 rounded-lg cursor-pointer"
              />
            </div>

            {/* Saturação */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-300 flex items-center gap-1.5 font-medium">
                  <Palette size={13} className="text-pink-400" />
                  <span>Vibração / Cores</span>
                </span>
                <span className="font-mono text-gray-300 font-bold">{saturation}%</span>
              </div>
              <input
                type="range"
                min="80"
                max="150"
                value={saturation}
                onChange={(e) => setSaturation(Number(e.target.value))}
                className="w-full accent-pink-500 h-1.5 bg-gray-700 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Toggles: Mirror & Particles */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => setIsMirrored(!isMirrored)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                isMirrored 
                  ? 'bg-[#ff2e74]/20 border-[#ff2e74]/50 text-[#ff4d88]' 
                  : 'bg-[#181b2a] border-[#22273e] text-gray-400'
              }`}
            >
              <RotateCcw size={12} />
              <span>Espelhar Câmera</span>
            </button>

            <button
              onClick={() => setParticlesEnabled(!particlesEnabled)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                particlesEnabled 
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300' 
                  : 'bg-[#181b2a] border-[#22273e] text-gray-400'
              }`}
            >
              <Sparkles size={12} />
              <span>Partículas</span>
            </button>
          </div>
        </div>
      )}

      {/* 5. Snapshot Modal Preview */}
      {snapshotPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-[#121420] border border-[#262b45] rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 border-b border-[#21263d] flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Camera size={16} className="text-[#ff2e74]" />
                <span>Foto Capturada da Live</span>
              </h3>
              <button
                onClick={() => setSnapshotPreview(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 flex items-center justify-center bg-black/40">
              <img
                src={snapshotPreview}
                alt="Snapshot Preview"
                className="w-full max-h-[60vh] object-contain rounded-2xl border border-white/10 shadow-lg"
              />
            </div>

            <div className="p-4 border-t border-[#21263d] flex items-center justify-end gap-3 bg-[#0d0f17]">
              <button
                onClick={() => setSnapshotPreview(null)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold"
              >
                Descartar
              </button>
              <button
                onClick={handleDownloadSnapshot}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#ff1a66] to-[#ff2e74] hover:brightness-110 text-white text-xs font-bold flex items-center gap-2 shadow-lg"
              >
                <Download size={14} />
                <span>Salvar Imagem</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
