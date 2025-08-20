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
      className="p-4 rounded-lg shadow-lg initiative-list"
      style={{ background: "linear-gradient(145deg, #1a1a1a, #2d2d2d)" }}
    >
      <h2 className="text-xl font-bold border-b border-gray-700 pb-2 mb-4 text-center">
        Dice Roller
      </h2>
      <div className="grid grid-cols-3 gap-2">
        <button
          className="dice-button bg-green-500 font-bold"
          onClick={() => {
            playSound(); // Reproduce el sonido al presionar el botón
            onRoll?.(4);
          }}
        >
          D4
        </button>
        <button
          className="dice-button bg-red-500 font-bold"
          onClick={() => {
            playSound();
            onRoll?.(6);
          }}
        >
          D6
        </button>
        <button
          className="dice-button bg-black font-bold"
          onClick={() => {
            playSound();
            onRoll?.(8);
          }}
        >
          D8
        </button>
        <button
          className="dice-button bg-orange-600 font-bold"
          onClick={() => {
            playSound();
            onRoll?.(10);
          }}
        >
          D10
        </button>
        <button
          className="dice-button bg-amber-400 font-bold"
          onClick={() => {
            playSound();
            onRoll?.(12);
          }}
        >
          D12
        </button>
        <button
          className="dice-button bg-sky-900 font-bold"
          onClick={() => {
            playSound();
            onRoll?.(20);
          }}
        >
          D20
        </button>
      </div>
      <div className="mt-4 text-center">
        <button
          onClick={toggleMute}
          className={`bg-gray-500 text-white font-bold px-4 py-2 rounded ${
            isSoundMuted ? "bg-gray-700" : "bg-gray-500"
          }`}
        >
          {isSoundMuted ? "Unmute Sound" : "Mute Sound"}
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

    // Material con textura
    const material = new THREE.MeshStandardMaterial({
      map: diceTexture,
      roughness: 0.2, // Reducir la rugosidad para más brillo
      metalness: 0.8, // Aumentar el metalness para más reflejo
      envMapIntensity: 1.0, // Intensidad del mapa de entorno
    });

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

    // Mejorar la iluminación
    const light1 = new THREE.DirectionalLight(0xffffff, 20); // Luz principal más suave
    light1.position.set(2, 2, 2).normalize();
    scene.add(light1);

    const light2 = new THREE.AmbientLight(0x404040, 10); // Luz ambiental más sutil
    scene.add(light2);

    const light3 = new THREE.PointLight(0xffffff, 1, 10); // Luz puntual más suave
    light3.position.set(-2, 2, -2);
    scene.add(light3);

    // Agregar luz de relleno
    const light4 = new THREE.DirectionalLight(0xffffff, 5);
    light4.position.set(-2, -2, -2).normalize();
    scene.add(light4);

    // Agregar luz de acento
    const light5 = new THREE.PointLight(0xffffff, 0.5, 8);
    light5.position.set(0, -2, 2);
    scene.add(light5);

    // Configurar el renderer para mejor calidad
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    // Animación del dado
    const startTime = Date.now();
    const animationDuration = 1500; // 1.5 segundos de animación
    const resultDisplayDuration = 500; // Mostrar resultado durante 1 segundo
    const rotations = 1; // Número de vueltas completas

    const animate = () => {
      const currentTime = Date.now();
      const elapsedTime = currentTime - startTime;

      if (elapsedTime < animationDuration) {
        // Calcular la rotación basada en el tiempo transcurrido
        const progress = elapsedTime / animationDuration;
        const randomFactor = (Math.random() - 0.5) * 0.2; // Variación aleatoria
        const angle = progress * Math.PI * 2 * rotations + randomFactor; // Rotación aleatoria

        if (diceRef.current) {
          diceRef.current.rotation.x = angle;
          diceRef.current.rotation.y = angle;
          diceRef.current.rotation.z = angle;
        }

        requestAnimationFrame(animate);
      } else {
        // Determinar la cara más cercana
        const result = Math.floor(Math.random() * sides) + 1;
        setResult(result); // Solo se actualiza una vez al terminar la animación
        setAnimationEnded(true); // Marcar que la animación terminó

        // Mostrar el resultado durante 1 segundo
        setTimeout(() => {
          setShowDice(false); // Ocultar el dado después de 1 segundo
          onAnimationEnd(result); // Pasar el resultado final al padre
          onComplete(); // Llamar a la función de "completar"
        }, resultDisplayDuration);
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
      {animationEnded && result !== null && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-4xl font-bold">
          Result: {result}
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
        <div className="mt-4 text-2xl text-white text-center initiative-list px-4 rounded-lg m-auto">
          Last roll result: {result}
        </div>
      )}
    </div>
  );
};

export default App;
