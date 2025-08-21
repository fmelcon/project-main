import React, { useState, useEffect } from "react";
import { X, Type, Palette, AlignLeft, AlignCenter, AlignRight } from "lucide-react";

interface TextEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (textData: TextData) => void;
  initialData?: TextData;
}

export interface TextData {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  textAlign: 'left' | 'center' | 'right';
  backgroundColor?: string;
  borderColor?: string;
}

const TextEditModal: React.FC<TextEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [text, setText] = useState("");
  const [color, setColor] = useState("#ffffff");
  const [fontSize, setFontSize] = useState(16);
  const [fontWeight, setFontWeight] = useState<'normal' | 'bold'>('normal');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('center');
  const [backgroundColor, setBackgroundColor] = useState("rgba(0,0,0,0.7)");
  const [borderColor, setBorderColor] = useState("#ffffff");

  useEffect(() => {
    if (initialData) {
      setText(initialData.text);
      setColor(initialData.color);
      setFontSize(initialData.fontSize);
      setFontWeight(initialData.fontWeight);
      setTextAlign(initialData.textAlign);
      setBackgroundColor(initialData.backgroundColor || "rgba(0,0,0,0.7)");
      setBorderColor(initialData.borderColor || "#ffffff");
    } else {
      setText("");
      setColor("#ffffff");
      setFontSize(16);
      setFontWeight('normal');
      setTextAlign('center');
      setBackgroundColor("rgba(0,0,0,0.7)");
      setBorderColor("#ffffff");
    }
  }, [initialData, isOpen]);

  const handleSave = () => {
    if (text.trim()) {
      const textData: TextData = {
        id: initialData?.id || `text-${Date.now()}`,
        x: initialData?.x || 0,
        y: initialData?.y || 0,
        text: text.trim(),
        color,
        fontSize,
        fontWeight,
        textAlign,
        backgroundColor,
        borderColor,
      };
      onSave(textData);
      onClose();
    }
  };

  const colors = [
    "#ffffff", "#000000", "#e74c3c", "#e67e22", "#f1c40f",
    "#2ecc71", "#3498db", "#9b59b6", "#1abc9c", "#95a5a6"
  ];

  const backgroundColors = [
    "rgba(0,0,0,0.7)", "rgba(255,255,255,0.9)", "rgba(231,76,60,0.8)",
    "rgba(52,152,219,0.8)", "rgba(46,204,113,0.8)", "rgba(155,89,182,0.8)"
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        className="bg-gray-800 rounded-xl p-6 w-96 max-w-[90vw] shadow-2xl border border-gray-600"
        style={{ background: "linear-gradient(145deg, #1a1a1a, #2d2d2d)" }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Type size={24} className="text-blue-400" />
            {initialData ? "Editar Letrero" : "Nuevo Letrero"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Texto */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Texto
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Escribe tu texto aquí..."
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none"
              rows={3}
            />
          </div>

          {/* Tamaño de fuente */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tamaño: {fontSize}px
            </label>
            <input
              type="range"
              min="12"
              max="48"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Peso de fuente */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Estilo
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setFontWeight('normal')}
                className={`px-3 py-2 rounded ${fontWeight === 'normal' ? 'bg-blue-600' : 'bg-gray-600'} text-white`}
              >
                Normal
              </button>
              <button
                onClick={() => setFontWeight('bold')}
                className={`px-3 py-2 rounded ${fontWeight === 'bold' ? 'bg-blue-600' : 'bg-gray-600'} text-white font-bold`}
              >
                Negrita
              </button>
            </div>
          </div>

          {/* Alineación */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Alineación
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setTextAlign('left')}
                className={`p-2 rounded ${textAlign === 'left' ? 'bg-blue-600' : 'bg-gray-600'} text-white`}
              >
                <AlignLeft size={16} />
              </button>
              <button
                onClick={() => setTextAlign('center')}
                className={`p-2 rounded ${textAlign === 'center' ? 'bg-blue-600' : 'bg-gray-600'} text-white`}
              >
                <AlignCenter size={16} />
              </button>
              <button
                onClick={() => setTextAlign('right')}
                className={`p-2 rounded ${textAlign === 'right' ? 'bg-blue-600' : 'bg-gray-600'} text-white`}
              >
                <AlignRight size={16} />
              </button>
            </div>
          </div>

          {/* Color del texto */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Color del texto
            </label>
            <div className="flex flex-wrap gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded border-2 ${color === c ? 'border-white' : 'border-gray-600'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Color de fondo */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Fondo
            </label>
            <div className="flex flex-wrap gap-2">
              {backgroundColors.map((bg) => (
                <button
                  key={bg}
                  onClick={() => setBackgroundColor(bg)}
                  className={`w-8 h-8 rounded border-2 ${backgroundColor === bg ? 'border-white' : 'border-gray-600'}`}
                  style={{ backgroundColor: bg }}
                />
              ))}
            </div>
          </div>

          {/* Vista previa */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Vista previa
            </label>
            <div 
              className="p-4 rounded border-2 min-h-[60px] flex items-center justify-center"
              style={{ 
                backgroundColor: backgroundColor,
                borderColor: borderColor
              }}
            >
              <span
                style={{
                  color: color,
                  fontSize: `${fontSize}px`,
                  fontWeight: fontWeight,
                  textAlign: textAlign,
                  wordBreak: 'break-word'
                }}
              >
                {text || "Vista previa del texto"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!text.trim()}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default TextEditModal;