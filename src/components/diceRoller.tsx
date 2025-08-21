import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import diceSound from "../dice-sound.mp3"; // Importa el archivo de sonido
import diceTextureImage from "../dice-texture.jpg.jpg"; // Importa la textura de dado

const DiceRoller: React.FC<{ 
  onRoll?: (sides: number) => void;
  onResult?: (sides: number, result: number) => void;
}> = ({
  onRoll,
  onResult,
}) => {
  const [isSoundMuted, setIsSoundMuted] = useState(false);

  const playSound = () => {
    if (!isSoundMuted) {
      const audio = new Audio(diceSound); // Crea un nuevo objeto de audio
      audio.play(); // Reproduce el sonido
    }
  };

  const toggleMute = () => {
    setIsSoundMuted(!isSoundMuted);
  };

  return (
    <div
      className="p-6 rounded-xl shadow-2xl initiative-list"
      style={{ 
        background: "linear-gradient(145deg, #1a1a1a, #2d2d2d)",
        border: "1px solid rgba(255,255,255,0.1)",
        backdropFilter: "blur(10px)"
      }}
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent mb-2">
          ✨ Dice Roller ✨
        </h2>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <button
          className="dice-button font-bold text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-2xl transform hover:-translate-y-1 active:scale-95 relative overflow-hidden group"
          style={{ 
            background: 'linear-gradient(145deg, #00ff88, #00cc66)',
            boxShadow: '0 8px 25px rgba(0, 255, 136, 0.4)',
            border: '2px solid rgba(255,255,255,0.2)',
            borderRadius: '12px',
            padding: '12px 16px',
            position: 'relative'
          }}
          onClick={() => {
            playSound();
            onRoll?.(4);
          }}
        >
          <span className="relative z-10 text-lg font-extrabold drop-shadow-lg">D4</span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-700"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
        </button>
        <button
          className="dice-button font-bold text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-2xl transform hover:-translate-y-1 active:scale-95 relative overflow-hidden group"
          style={{ 
            background: 'linear-gradient(145deg, #ff4444, #cc2222)',
            boxShadow: '0 8px 25px rgba(255, 68, 68, 0.4)',
            border: '2px solid rgba(255,255,255,0.2)',
            borderRadius: '12px',
            padding: '12px 16px',
            position: 'relative'
          }}
          onClick={() => {
            playSound();
            onRoll?.(6);
          }}
        >
          <span className="relative z-10 text-lg font-extrabold drop-shadow-lg">D6</span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-700"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
        </button>
        <button
          className="dice-button font-bold text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-2xl transform hover:-translate-y-1 active:scale-95 relative overflow-hidden group"
          style={{ 
            background: 'linear-gradient(145deg, #4488ff, #2266cc)',
            boxShadow: '0 8px 25px rgba(68, 136, 255, 0.4)',
            border: '2px solid rgba(255,255,255,0.2)',
            borderRadius: '12px',
            padding: '12px 16px',
            position: 'relative'
          }}
          onClick={() => {
            playSound();
            onRoll?.(8);
          }}
        >
          <span className="relative z-10 text-lg font-extrabold drop-shadow-lg">D8</span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-700"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
        </button>
        <button
          className="dice-button font-bold text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-2xl transform hover:-translate-y-1 active:scale-95 relative overflow-hidden group"
          style={{ 
            background: 'linear-gradient(145deg, #ffaa00, #cc8800)',
            boxShadow: '0 8px 25px rgba(255, 170, 0, 0.4)',
            border: '2px solid rgba(255,255,255,0.2)',
            borderRadius: '12px',
            padding: '12px 16px',
            position: 'relative'
          }}
          onClick={() => {
            playSound();
            onRoll?.(10);
          }}
        >
          <span className="relative z-10 text-lg font-extrabold drop-shadow-lg">D10</span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-700"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
        </button>
        <button
          className="dice-button font-bold text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-2xl transform hover:-translate-y-1 active:scale-95 relative overflow-hidden group"
          style={{ 
            background: 'linear-gradient(145deg, #aa44ff, #8822cc)',
            boxShadow: '0 8px 25px rgba(170, 68, 255, 0.4)',
            border: '2px solid rgba(255,255,255,0.2)',
            borderRadius: '12px',
            padding: '12px 16px',
            position: 'relative'
          }}
          onClick={() => {
            playSound();
            onRoll?.(12);
          }}
        >
          <span className="relative z-10 text-lg font-extrabold drop-shadow-lg">D12</span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-700"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
        </button>
        <button
          className="dice-button font-bold text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-2xl transform hover:-translate-y-1 active:scale-95 relative overflow-hidden group"
          style={{ 
            background: 'linear-gradient(145deg, #ffff44, #cccc22)',
            boxShadow: '0 8px 25px rgba(255, 255, 68, 0.4)',
            border: '2px solid rgba(255,255,255,0.2)',
            borderRadius: '12px',
            padding: '12px 16px',
            position: 'relative'
          }}
          onClick={() => {
            playSound();
            onRoll?.(20);
          }}
        >
          <span className="relative z-10 text-lg font-extrabold drop-shadow-lg">D20</span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-700"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
        </button>
      </div>
      <div className="mt-6 text-center">
        <button
          onClick={toggleMute}
          className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg transform active:scale-95 border border-gray-500/30"
          style={{
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <span className="flex items-center gap-2">
            {isSoundMuted ? "🔇" : "🔊"}
            <span>{isSoundMuted ? "Activar Sonido" : "Silenciar"}</span>
          </span>
        </button>
      </div>
    </div>
  );
};

const DiceScene: React.FC<{
  sides: number;
  onAnimationEnd: (result: number) => void;
  onComplete: () => void;
}> = ({ sides, onAnimationEnd, onComplete }) => {
  const sceneRef = useRef<HTMLDivElement>(null);
  const diceRef = useRef<THREE.Mesh | THREE.Group | null>(null);
  const [result, setResult] = useState<number | null>(null);
  const [animationEnded, setAnimationEnded] = useState(false);
  const [showDice, setShowDice] = useState(true); // Controlar la visibilidad del dado
  const [showResultAnimation, setShowResultAnimation] = useState(false);
  const [resultAnimationProgress, setResultAnimationProgress] = useState(0);

  useEffect(() => {
    if (!sceneRef.current) return;

    // Configuración de la escena
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      80,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    sceneRef.current.appendChild(renderer.domElement);

    // Cargar la textura
    const textureLoader = new THREE.TextureLoader();
    const diceTexture = textureLoader.load(diceTextureImage);

    // Función para crear texturas espectaculares como dados reales
    const createSpectacularTexture = (sides: number) => {
      const canvas = document.createElement('canvas');
      const size = 512;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d')!;
      
      // Patrones espectaculares por tipo de dado
      const patterns = {
        4: 'emerald',    // Patrón esmeralda para D4
        6: 'ruby',       // Patrón rubí para D6
        8: 'sapphire',   // Patrón zafiro para D8
        10: 'amber',     // Patrón ámbar para D10
        12: 'amethyst',  // Patrón amatista para D12
        20: 'gold',      // Patrón oro para D20
      };
      
      const pattern = patterns[sides as keyof typeof patterns] || 'crystal';
      
      // Crear fondo base
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, size, size);
      
      // Aplicar patrón específico
      switch (pattern) {
        case 'emerald':
          createEmeraldPattern(ctx, size);
          break;
        case 'ruby':
          createRubyPattern(ctx, size);
          break;
        case 'sapphire':
          createSapphirePattern(ctx, size);
          break;
        case 'amber':
          createAmberPattern(ctx, size);
          break;
        case 'amethyst':
          createAmethystPattern(ctx, size);
          break;
        case 'gold':
          createGoldPattern(ctx, size);
          break;
      }
      
      // Agregar brillo cristalino
      addCrystalShine(ctx, size);
      
      // No agregar números - dados limpios
      
      return new THREE.CanvasTexture(canvas);
    };
    
    // Patrón Esmeralda (D4)
    const createEmeraldPattern = (ctx: CanvasRenderingContext2D, size: number) => {
      const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
      gradient.addColorStop(0, '#00ff88');
      gradient.addColorStop(0.3, '#00cc66');
      gradient.addColorStop(0.7, '#008844');
      gradient.addColorStop(1, '#004422');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
      
      // Vetas cristalinas
      for (let i = 0; i < 20; i++) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 + Math.random() * 0.2})`;
        ctx.lineWidth = 2 + Math.random() * 3;
        ctx.beginPath();
        ctx.moveTo(Math.random() * size, Math.random() * size);
        ctx.lineTo(Math.random() * size, Math.random() * size);
        ctx.stroke();
      }
    };
    
    // Patrón Rubí (D6)
    const createRubyPattern = (ctx: CanvasRenderingContext2D, size: number) => {
      const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
      gradient.addColorStop(0, '#ff4444');
      gradient.addColorStop(0.3, '#cc2222');
      gradient.addColorStop(0.7, '#881111');
      gradient.addColorStop(1, '#440000');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
      
      // Inclusiones cristalinas
      for (let i = 0; i < 15; i++) {
        ctx.fillStyle = `rgba(255, 100, 100, ${0.3 + Math.random() * 0.4})`;
        ctx.beginPath();
        ctx.arc(Math.random() * size, Math.random() * size, 2 + Math.random() * 4, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    
    // Patrón Zafiro (D8)
    const createSapphirePattern = (ctx: CanvasRenderingContext2D, size: number) => {
      const gradient = ctx.createLinearGradient(0, 0, size, size);
      gradient.addColorStop(0, '#4488ff');
      gradient.addColorStop(0.5, '#2266cc');
      gradient.addColorStop(1, '#114488');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
      
      // Bandas cristalinas
      for (let i = 0; i < 8; i++) {
        ctx.strokeStyle = `rgba(100, 150, 255, ${0.2 + Math.random() * 0.3})`;
        ctx.lineWidth = 5 + Math.random() * 10;
        ctx.beginPath();
        ctx.moveTo(0, i * size / 8);
        ctx.lineTo(size, i * size / 8 + Math.random() * 50 - 25);
        ctx.stroke();
      }
    };
    
    // Patrón Ámbar (D10)
    const createAmberPattern = (ctx: CanvasRenderingContext2D, size: number) => {
      const gradient = ctx.createRadialGradient(size/3, size/3, 0, size/2, size/2, size/2);
      gradient.addColorStop(0, '#ffaa00');
      gradient.addColorStop(0.4, '#cc8800');
      gradient.addColorStop(0.8, '#996600');
      gradient.addColorStop(1, '#663300');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
      
      // Burbujas de aire (como ámbar real)
      for (let i = 0; i < 12; i++) {
        ctx.fillStyle = `rgba(255, 200, 100, ${0.4 + Math.random() * 0.3})`;
        ctx.beginPath();
        ctx.ellipse(Math.random() * size, Math.random() * size, 
                   3 + Math.random() * 8, 2 + Math.random() * 5, 
                   Math.random() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    
    // Patrón Amatista (D12)
    const createAmethystPattern = (ctx: CanvasRenderingContext2D, size: number) => {
      const gradient = ctx.createConicGradient(0, size/2, size/2);
      gradient.addColorStop(0, '#aa44ff');
      gradient.addColorStop(0.25, '#8822cc');
      gradient.addColorStop(0.5, '#6611aa');
      gradient.addColorStop(0.75, '#441188');
      gradient.addColorStop(1, '#aa44ff');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
      
      // Cristales internos
      for (let i = 0; i < 10; i++) {
        ctx.strokeStyle = `rgba(200, 100, 255, ${0.3 + Math.random() * 0.4})`;
        ctx.lineWidth = 1 + Math.random() * 2;
        const centerX = Math.random() * size;
        const centerY = Math.random() * size;
        for (let j = 0; j < 6; j++) {
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          const angle = (j * Math.PI * 2) / 6;
          ctx.lineTo(centerX + Math.cos(angle) * 20, centerY + Math.sin(angle) * 20);
          ctx.stroke();
        }
      }
    };
    
    // Patrón Oro (D20)
    const createGoldPattern = (ctx: CanvasRenderingContext2D, size: number) => {
      const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
      gradient.addColorStop(0, '#ffff44');
      gradient.addColorStop(0.3, '#ffdd22');
      gradient.addColorStop(0.6, '#ccaa00');
      gradient.addColorStop(1, '#886600');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
      
      // Textura metálica
      for (let i = 0; i < 30; i++) {
        ctx.strokeStyle = `rgba(255, 255, 200, ${0.1 + Math.random() * 0.3})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        const angle = Math.random() * Math.PI * 2;
        const length = 10 + Math.random() * 30;
        const x = Math.random() * size;
        const y = Math.random() * size;
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
        ctx.stroke();
      }
    };
    
    // Agregar brillo cristalino
    const addCrystalShine = (ctx: CanvasRenderingContext2D, size: number) => {
      const shineGradient = ctx.createLinearGradient(0, 0, size, size);
      shineGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
      shineGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
      shineGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = shineGradient;
      ctx.fillRect(0, 0, size, size);
    };
    
    // Agregar número central con máximo contraste
    const addCenterNumber = (ctx: CanvasRenderingContext2D, size: number, sides: number) => {
      const centerNumber = Math.ceil(sides / 2);
      
      // Crear fondo circular semi-transparente para el número
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.beginPath();
      ctx.arc(size/2, size/2, 60, 0, Math.PI * 2);
      ctx.fill();
      
      // Configurar texto con máximo contraste
      ctx.fillStyle = '#ffffff';           // Blanco puro
      ctx.font = 'bold 100px Arial';       // Más grande y fuente sans-serif
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.strokeStyle = '#000000';         // Contorno negro
      ctx.lineWidth = 6;                   // Contorno más grueso
      
      // Sombra más pronunciada
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;
      
      // Dibujar el número con contorno y relleno
      ctx.strokeText(centerNumber.toString(), size/2, size/2);
      ctx.fillText(centerNumber.toString(), size/2, size/2);
      
      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    };
    
    // Función para crear materiales únicos por tipo de dado
    const createDiceMaterial = (sides: number) => {
      const colors = {
        4: 0x00ff88,   // Verde brillante para D4
        6: 0xff4444,   // Rojo para D6
        8: 0x4488ff,   // Azul para D8
        10: 0xffaa00,  // Naranja para D10
        12: 0xaa44ff,  // Púrpura para D12
        20: 0xffff44,  // Amarillo dorado para D20
      };
      
      const baseColor = colors[sides as keyof typeof colors] || 0xffffff;
      const spectacularTexture = createSpectacularTexture(sides);
      
      return new THREE.MeshStandardMaterial({
        color: baseColor,
        map: spectacularTexture,
        normalMap: diceTexture, // Usar textura original como normal map
        roughness: 0.1, // Muy brillante como cristal
        metalness: 0.1, // Menos metálico, más cristalino
        envMapIntensity: 2.0, // Máxima reflectividad
        bumpMap: diceTexture,
        bumpScale: 0.1, // Relieve sutil
        transparent: true, // Habilitar transparencia
        opacity: 0.7, // Semi-transparente (70% opacidad)
        transmission: 0.3, // Efecto de transmisión de luz
        thickness: 0.5, // Grosor del material
      });
    };

    const material = createDiceMaterial(sides);

    let dice;

    if (sides === 10) {
      // Crear un grupo para los dos conos
      const group = new THREE.Group();

      // Crear el cono superior
      const topCone = new THREE.Mesh(
        new THREE.ConeGeometry(1, 1, 10),
        material
      );
      topCone.position.y = 0.5;

      // Crear el cono inferior
      const bottomCone = new THREE.Mesh(
        new THREE.ConeGeometry(1, 1, 10),
        material
      );
      bottomCone.position.y = -0.5;
      bottomCone.rotation.x = Math.PI;

      // Agregar ambos conos al grupo
      group.add(topCone);
      group.add(bottomCone);

      dice = group;
    } else {
      // Crear el dado según el número de caras
      let geometry;
      switch (sides) {
        case 4:
          geometry = new THREE.TetrahedronGeometry(1);
          break;
        case 6:
          geometry = new THREE.BoxGeometry(1, 1, 1);
          break;
        case 8:
          geometry = new THREE.OctahedronGeometry(1);
          break;
        case 12:
          geometry = new THREE.DodecahedronGeometry(1);
          break;
        case 20:
          geometry = new THREE.IcosahedronGeometry(1);
          break;
        default:
          geometry = new THREE.BoxGeometry(1, 1, 1);
      }
      dice = new THREE.Mesh(geometry, material);
    }

    scene.add(dice);
    diceRef.current = dice;

    // Configurar la cámara
    camera.position.z = 5;
    camera.position.y = 2;
    camera.lookAt(0, 0, 0);

    // Sistema de iluminación dinámico y colorido
    const lightColors = {
      4: 0x00ff88,   // Verde para D4
      6: 0xff4444,   // Rojo para D6
      8: 0x4488ff,   // Azul para D8
      10: 0xffaa00,  // Naranja para D10
      12: 0xaa44ff,  // Púrpura para D12
      20: 0xffff44,  // Amarillo para D20
    };
    
    const accentColor = lightColors[sides as keyof typeof lightColors] || 0xffffff;
    
    // Luz principal direccional
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainLight.position.set(3, 3, 3);
    mainLight.castShadow = true;
    scene.add(mainLight);

    // Luz ambiental suave
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    // Luz de acento colorida que cambia según el dado
    const accentLight = new THREE.PointLight(accentColor, 2, 15);
    accentLight.position.set(-2, 2, -2);
    scene.add(accentLight);

    // Luz de relleno
    const fillLight = new THREE.DirectionalLight(0x8888ff, 0.3);
    fillLight.position.set(-2, -2, -2);
    scene.add(fillLight);

    // Luz puntual inferior para brillo
    const bottomLight = new THREE.PointLight(accentColor, 0.8, 10);
    bottomLight.position.set(0, -3, 2);
    scene.add(bottomLight);
    
    // Luz de rim para contorno
    const rimLight = new THREE.DirectionalLight(accentColor, 0.5);
    rimLight.position.set(0, 0, -5);
    scene.add(rimLight);

    // Configurar el renderer para máxima calidad y realismo
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limitar para performance
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.antialias = true;
    
    // Habilitar sombras en las luces
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 50;
    
    // Configurar sombras para el dado
    if (dice) {
      dice.castShadow = true;
      dice.receiveShadow = true;
    }
    
    // Agregar un plano invisible para recibir sombras
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 10),
      new THREE.ShadowMaterial({ opacity: 0.3 })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -1.5;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // Simulación física realista del dado
    const startTime = Date.now();
    const animationDuration = 2500; // Duración más larga para realismo
    const resultDisplayDuration = 1000;
    
    // Parámetros físicos realistas
    const initialVelocity = {
      x: (Math.random() - 0.5) * 20, // Velocidad angular inicial aleatoria
      y: (Math.random() - 0.5) * 18,
      z: (Math.random() - 0.5) * 16
    };
    
    const friction = 0.98; // Factor de fricción para desaceleración
    const gravity = 0.0005; // Gravedad sutil
    let currentVelocity = { ...initialVelocity };
    let position = { x: 0, y: 0, z: 0 };
    let bounceCount = 0;
    const maxBounces = 3 + Math.floor(Math.random() * 3); // 3-5 rebotes
    
    // Función de easing más realista
    const easeOutCubic = (t: number): number => {
      return 1 - Math.pow(1 - t, 3);
    };

    const animate = () => {
      const currentTime = Date.now();
      const elapsedTime = currentTime - startTime;
      const deltaTime = 16; // ~60fps

      if (elapsedTime < animationDuration) {
        const progress = elapsedTime / animationDuration;
        const easedProgress = easeOutCubic(progress);
        
        // Aplicar fricción a la velocidad (desaceleración gradual)
        currentVelocity.x *= friction;
        currentVelocity.y *= friction;
        currentVelocity.z *= friction;
        
        // Aplicar gravedad a la posición Y
        position.y -= gravity * deltaTime;
        
        // Detectar rebotes en el "suelo" (y = -1)
        if (position.y <= -1 && bounceCount < maxBounces) {
          position.y = -1;
          currentVelocity.y = Math.abs(currentVelocity.y) * 0.6; // Rebote con pérdida de energía
          currentVelocity.x *= 0.8; // Reducir velocidad horizontal en rebote
          currentVelocity.z *= 0.8;
          bounceCount++;
        }
        
        // Actualizar rotación basada en velocidad angular
        if (diceRef.current) {
          diceRef.current.rotation.x += currentVelocity.x * 0.01;
          diceRef.current.rotation.y += currentVelocity.y * 0.01;
          diceRef.current.rotation.z += currentVelocity.z * 0.01;
          
          // Posición con rebote realista
          diceRef.current.position.y = Math.max(position.y, -1);
          
          // Pequeñas vibraciones al final para simular asentamiento
          if (progress > 0.8) {
            const vibration = (1 - progress) * 0.02;
            diceRef.current.position.x = (Math.random() - 0.5) * vibration;
            diceRef.current.position.z = (Math.random() - 0.5) * vibration;
          }
        }
        
        // Iluminación dinámica que se estabiliza gradualmente
        const lightIntensity = 2 + (1 - easedProgress) * 2;
        accentLight.intensity = lightIntensity + Math.sin(elapsedTime * 0.01) * 0.3;
        bottomLight.intensity = 0.8 + (1 - easedProgress) * 0.5;

        requestAnimationFrame(animate);
      } else {
        // Resultado final - dado se asienta
        const result = Math.floor(Math.random() * sides) + 1;
        setResult(result);
        setAnimationEnded(true);
        setShowResultAnimation(true);
        
        // Posición final estable
        if (diceRef.current) {
          diceRef.current.position.set(0, -1, 0); // En el "suelo"
          diceRef.current.scale.setScalar(1);
          
          // Rotación final aleatoria pero estable
          const finalRotation = {
            x: Math.floor(Math.random() * 4) * Math.PI / 2,
            y: Math.floor(Math.random() * 4) * Math.PI / 2,
            z: Math.floor(Math.random() * 4) * Math.PI / 2
          };
          diceRef.current.rotation.set(finalRotation.x, finalRotation.y, finalRotation.z);
        }
        
        // Animación espectacular de resultado
        const resultAnimationStart = Date.now();
        const resultAnimationDuration = 800; // Más rápida
        
        const animateResult = () => {
          const elapsed = Date.now() - resultAnimationStart;
          const progress = Math.min(elapsed / resultAnimationDuration, 1);
          setResultAnimationProgress(progress);
          
          // Efectos de iluminación pulsante
          const pulse = Math.sin(elapsed * 0.01) * 0.5 + 0.5;
          accentLight.intensity = 3 + pulse * 3;
          bottomLight.intensity = 1 + pulse * 2;
          
          // Efecto de escala pulsante del dado
          if (diceRef.current) {
            const scale = 1 + Math.sin(elapsed * 0.008) * 0.1;
            diceRef.current.scale.setScalar(scale);
          }
          
          if (progress < 1) {
            requestAnimationFrame(animateResult);
          } else {
            // Finalizar animación
            accentLight.intensity = 2;
            bottomLight.intensity = 1;
            if (diceRef.current) {
              diceRef.current.scale.setScalar(1);
            }
            
            setTimeout(() => {
              setShowDice(false);
              setShowResultAnimation(false);
              onAnimationEnd(result);
              onComplete();
            }, 500);
          }
        };
        
        animateResult();
      }

      renderer.render(scene, camera);
    };

    animate();

    // Limpieza
    return () => {
      sceneRef.current?.removeChild(renderer.domElement);
    };
  }, [sides, onAnimationEnd, onComplete]);

  return (
    <div
      ref={sceneRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0)", // Fondo transparente
        zIndex: 1000,
      }}
    >
      {showDice && !animationEnded && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-4xl font-bold">
          Rolling...
        </div>
      )}
      {showResultAnimation && result !== null && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: `translate(-50%, -50%) scale(${0.5 + resultAnimationProgress * 0.5}) rotate(${resultAnimationProgress * 360}deg)`,
            fontSize: "72px",
            fontWeight: "bold",
            background: `linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #ffeaa7, #dda0dd)`,
            backgroundSize: "400% 400%",
            animation: `rainbow ${2000}ms ease-in-out infinite`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            textShadow: "0 0 20px rgba(255,255,255,0.8)",
            zIndex: 10,
            pointerEvents: "none",
            opacity: resultAnimationProgress,
            filter: `drop-shadow(0 0 ${10 + resultAnimationProgress * 20}px rgba(255,255,255,0.8))`,
          }}
        >
          {result}
        </div>
      )}
      
      {/* Efectos de partículas */}
      {showResultAnimation && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 5,
          }}
        >
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                width: "4px",
                height: "4px",
                background: `hsl(${(i * 18) % 360}, 100%, 70%)`,
                borderRadius: "50%",
                left: `${50 + Math.cos(i * 0.314) * 30 * resultAnimationProgress}%`,
                top: `${50 + Math.sin(i * 0.314) * 30 * resultAnimationProgress}%`,
                transform: `scale(${resultAnimationProgress})`,
                opacity: 1 - resultAnimationProgress,
                boxShadow: `0 0 10px hsl(${(i * 18) % 360}, 100%, 70%)`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const App: React.FC<{
  onResult?: (sides: number, result: number) => void;
}> = ({ onResult }) => {
  const [showScene, setShowScene] = useState(false);
  const [diceType, setDiceType] = useState<number | null>(null);
  const [result, setResult] = useState<number | null>(null);

  const handleRoll = (sides: number) => {
    setDiceType(sides);
    setShowScene(true);
  };

  const handleAnimationEnd = (result: number) => {
    setResult(result); // Solo se actualiza una vez después de la animación
    if (diceType && onResult) {
      onResult(diceType, result);
    }
  };

  const handleComplete = () => {
    setShowScene(false); // Ocultar la escena cuando termine la animación
  };

  return (
    <div className="bg-gray-900 text-white flex flex-col justify-center">
      <DiceRoller onRoll={handleRoll} onResult={onResult} />
      {showScene && diceType && (
        <DiceScene
          sides={diceType}
          onAnimationEnd={handleAnimationEnd}
          onComplete={handleComplete}
        />
      )}
      {result !== null && !showScene && (
        <div className="mt-6 mx-auto max-w-sm">
          <div 
            className="relative overflow-hidden rounded-2xl p-6 text-center transform hover:scale-105 transition-all duration-300 shadow-2xl"
            style={{
              background: 'linear-gradient(145deg, #2d1b69, #11998e, #38ef7d)',
              backgroundSize: '200% 200%',
              animation: 'gradient-shift 3s ease infinite',
              border: '2px solid rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
            <div className="relative z-10">
              <div className="text-sm font-semibold text-white/80 mb-2 tracking-wider uppercase">
                ✨ Último Resultado ✨
              </div>
              <div 
                className="text-5xl font-black text-white mb-2 drop-shadow-lg"
                style={{
                  textShadow: '0 0 20px rgba(255,255,255,0.5), 0 0 40px rgba(255,255,255,0.3)'
                }}
              >
                {result}
              </div>
              <div className="w-16 h-1 bg-white/60 mx-auto rounded-full"></div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full animate-shimmer"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
