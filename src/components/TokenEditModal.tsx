import React, { useState, useEffect } from "react";
import { X, Save, User, Zap, Heart, MapPin, Palette, Shield, Eye, EyeOff, Settings } from "lucide-react";

// Status markers available (Roll20 style)
const STATUS_MARKERS = [
  { id: 'poisoned', name: 'Poisoned', color: '#22c55e', icon: '☠️' },
  { id: 'stunned', name: 'Stunned', color: '#eab308', icon: '😵' },
  { id: 'paralyzed', name: 'Paralyzed', color: '#dc2626', icon: '🥶' },
  { id: 'charmed', name: 'Charmed', color: '#ec4899', icon: '😍' },
  { id: 'frightened', name: 'Frightened', color: '#7c3aed', icon: '😨' },
  { id: 'restrained', name: 'Restrained', color: '#f97316', icon: '🔗' },
  { id: 'blinded', name: 'Blinded', color: '#374151', icon: '👁️' },
  { id: 'deafened', name: 'Deafened', color: '#6b7280', icon: '👂' },
  { id: 'unconscious', name: 'Unconscious', color: '#1f2937', icon: '😴' },
  { id: 'dead', name: 'Dead', color: '#000000', icon: '💀' },
];

interface TokenEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tokenData: any) => void;
  token: {
    id: string;
    type: "ally" | "enemy" | "boss";
    x: number;
    y: number;
    color: string;
    name?: string;
    initiative?: number;
    maxHp?: number;
    currentHp?: number;
    ac?: number;
    statusMarkers?: string[];
    isVisible?: boolean;
    showNameplate?: boolean;
    showHealthBar?: boolean;
    notes?: string;
  } | null;
}

const TokenEditModal: React.FC<TokenEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  token,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'settings' | 'notes'>('details');
  const [formData, setFormData] = useState({
    name: "",
    initiative: "",
    maxHp: "",
    currentHp: "",
    ac: "",
    color: "#3498db",
    x: 0,
    y: 0,
    statusMarkers: [] as string[],
    isVisible: true,
    showNameplate: true,
    showHealthBar: true,
    notes: "",
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (token && isOpen) {
      console.log('Loading token data:', token);
      setFormData({
        name: token.name || "",
        initiative: token.initiative?.toString() || "",
        maxHp: token.maxHp?.toString() || "",
        currentHp: token.currentHp?.toString() || "",
        ac: token.ac?.toString() || "",
        color: token.color || "#3498db",
        x: token.x || 0,
        y: token.y || 0,
        statusMarkers: token.statusMarkers || [],
        isVisible: token.isVisible !== false,
        showNameplate: token.showNameplate !== false,
        showHealthBar: token.showHealthBar !== false,
        notes: token.notes || "",
      });
      setErrors({});
      setActiveTab('details');
    }
  }, [token, isOpen]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (formData.x < 0 || formData.x > 39) {
      newErrors.x = "La posición X debe estar entre 0 y 39";
    }
    if (formData.y < 0 || formData.y > 39) {
      newErrors.y = "La posición Y debe estar entre 0 y 39";
    }
    if (formData.initiative && (Number(formData.initiative) < 0 || Number(formData.initiative) > 30)) {
      newErrors.initiative = "La iniciativa debe estar entre 0 y 30";
    }
    if (formData.maxHp && Number(formData.maxHp) < 1) {
      newErrors.maxHp = "La vida máxima debe ser mayor a 0";
    }
    if (formData.currentHp && Number(formData.currentHp) < 0) {
      newErrors.currentHp = "La vida actual no puede ser negativa";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      console.error('No token to save');
      return;
    }

    if (!validateForm()) {
      console.log('Form validation failed:', errors);
      return;
    }

    const updatedData = {
      name: formData.name.trim() || undefined,
      initiative: formData.initiative ? Number(formData.initiative) : undefined,
      maxHp: formData.maxHp ? Number(formData.maxHp) : undefined,
      currentHp: formData.currentHp ? Number(formData.currentHp) : undefined,
      ac: formData.ac ? Number(formData.ac) : undefined,
      color: formData.color,
      x: Number(formData.x),
      y: Number(formData.y),
      statusMarkers: formData.statusMarkers,
      isVisible: formData.isVisible,
      showNameplate: formData.showNameplate,
      showHealthBar: formData.showHealthBar,
      notes: formData.notes.trim() || undefined,
    };

    console.log('Saving token data:', updatedData);
    onSave(updatedData);
    onClose();
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const colors = [
    "#e74c3c", // Red
    "#e67e22", // Orange
    "#f1c40f", // Yellow
    "#2ecc71", // Green
    "#3498db", // Blue
    "#9b59b6", // Purple
    "#1abc9c", // Teal
    "#ecf0f1", // White
    "#95a5a6", // Gray
    "#000000", // Black
  ];

  if (!isOpen || !token) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md mx-auto border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div 
              className="w-4 h-4 rounded-full border-2 border-white"
              style={{ backgroundColor: token.color }}
            />
            <h2 className="text-xl font-bold text-white">
              Editar {token.type === "ally" ? "Aliado" : token.type === "enemy" ? "Enemigo" : "Jefe"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-700 rounded"
            title="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-600 mb-4">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'details'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <User size={16} className="inline mr-2" />
            Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'settings'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <Settings size={16} className="inline mr-2" />
            Settings
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('notes')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'notes'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            📝 Notes
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-4">
              {/* Nombre */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-1">
                  <User size={16} />
                  Token Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={`w-full bg-gray-700 text-white p-3 rounded border ${
                    errors.name ? 'border-red-500' : 'border-gray-600'
                  } focus:border-blue-500 focus:outline-none transition-colors`}
                  placeholder="Enter token name"
                />
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
              </div>

              {/* Combat Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Iniciativa */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-1">
                    <Zap size={16} />
                    Initiative
                  </label>
                  <input
                    type="number"
                    value={formData.initiative}
                    onChange={(e) => handleInputChange("initiative", e.target.value)}
                    className={`w-full bg-gray-700 text-white p-3 rounded border ${
                      errors.initiative ? 'border-red-500' : 'border-gray-600'
                    } focus:border-blue-500 focus:outline-none transition-colors`}
                    placeholder="Initiative (0-30)"
                    min="0"
                    max="30"
                  />
                  {errors.initiative && <p className="text-red-400 text-xs mt-1">{errors.initiative}</p>}
                </div>

                {/* AC */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-1">
                    <Shield size={16} />
                    Armor Class
                  </label>
                  <input
                    type="number"
                    value={formData.ac}
                    onChange={(e) => handleInputChange("ac", e.target.value)}
                    className={`w-full bg-gray-700 text-white p-3 rounded border ${
                      errors.ac ? 'border-red-500' : 'border-gray-600'
                    } focus:border-blue-500 focus:outline-none transition-colors`}
                    placeholder="AC (8-30)"
                    min="8"
                    max="30"
                  />
                  {errors.ac && <p className="text-red-400 text-xs mt-1">{errors.ac}</p>}
                </div>
              </div>

              {/* Health Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Vida Máxima */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-1">
                    <Heart size={16} className="text-red-400" />
                    Max Hit Points
                  </label>
                  <input
                    type="number"
                    value={formData.maxHp}
                    onChange={(e) => handleInputChange("maxHp", e.target.value)}
                    className={`w-full bg-gray-700 text-white p-3 rounded border ${
                      errors.maxHp ? 'border-red-500' : 'border-gray-600'
                    } focus:border-blue-500 focus:outline-none transition-colors`}
                    placeholder="Max HP"
                    min="1"
                  />
                  {errors.maxHp && <p className="text-red-400 text-xs mt-1">{errors.maxHp}</p>}
                </div>

                {/* Vida Actual */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-1">
                    <Heart size={16} className="text-green-400" />
                    Current Hit Points
                  </label>
                  <input
                    type="number"
                    value={formData.currentHp}
                    onChange={(e) => handleInputChange("currentHp", e.target.value)}
                    className={`w-full bg-gray-700 text-white p-3 rounded border ${
                      errors.currentHp ? 'border-red-500' : 'border-gray-600'
                    } focus:border-blue-500 focus:outline-none transition-colors`}
                    placeholder="Current HP"
                    min="0"
                  />
                  {errors.currentHp && <p className="text-red-400 text-xs mt-1">{errors.currentHp}</p>}
                </div>
              </div>

              {/* Status Markers */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                  🎭 Status Effects
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {STATUS_MARKERS.map((marker) => (
                    <button
                      key={marker.id}
                      type="button"
                      onClick={() => {
                        const newMarkers = formData.statusMarkers.includes(marker.id)
                          ? formData.statusMarkers.filter(m => m !== marker.id)
                          : [...formData.statusMarkers, marker.id];
                        handleInputChange('statusMarkers', newMarkers);
                      }}
                      className={`p-2 rounded border-2 transition-all hover:scale-105 ${
                        formData.statusMarkers.includes(marker.id)
                          ? 'border-white bg-gray-600'
                          : 'border-gray-600 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: formData.statusMarkers.includes(marker.id) ? marker.color + '40' : 'transparent' }}
                      title={marker.name}
                    >
                      <span className="text-lg">{marker.icon}</span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Selected: {formData.statusMarkers.length > 0 
                    ? formData.statusMarkers.map(id => STATUS_MARKERS.find(m => m.id === id)?.name).join(', ')
                    : 'None'
                  }
                </p>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              {/* Visibility Settings */}
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                  <Eye size={16} />
                  Visibility & Display
                </h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.isVisible}
                      onChange={(e) => handleInputChange('isVisible', e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-300">Token is visible to players</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.showNameplate}
                      onChange={(e) => handleInputChange('showNameplate', e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-300">Show nameplate</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.showHealthBar}
                      onChange={(e) => handleInputChange('showHealthBar', e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-300">Show health bar to players</span>
                  </label>
                </div>
              </div>

              {/* Position */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                  <MapPin size={16} className="text-blue-400" />
                  Grid Position
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">X Coordinate (0-39)</label>
                    <input
                      type="number"
                      value={formData.x}
                      onChange={(e) => handleInputChange("x", Number(e.target.value))}
                      className={`w-full bg-gray-700 text-white p-3 rounded border ${
                        errors.x ? 'border-red-500' : 'border-gray-600'
                      } focus:border-blue-500 focus:outline-none transition-colors`}
                      min="0"
                      max="39"
                      placeholder="0"
                    />
                    {errors.x && <p className="text-red-400 text-xs mt-1">{errors.x}</p>}
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Y Coordinate (0-39)</label>
                    <input
                      type="number"
                      value={formData.y}
                      onChange={(e) => handleInputChange("y", Number(e.target.value))}
                      className={`w-full bg-gray-700 text-white p-3 rounded border ${
                        errors.y ? 'border-red-500' : 'border-gray-600'
                      } focus:border-blue-500 focus:outline-none transition-colors`}
                      min="0"
                      max="39"
                      placeholder="0"
                    />
                    {errors.y && <p className="text-red-400 text-xs mt-1">{errors.y}</p>}
                  </div>
                </div>
              </div>

              {/* Token Color */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                  <Palette size={16} className="text-purple-400" />
                  Token Color
                </label>
                <div className="flex flex-wrap gap-3">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleInputChange("color", color)}
                      className={`w-10 h-10 rounded-full border-2 transition-all hover:scale-105 ${
                        formData.color === color
                          ? "border-white scale-110 shadow-lg"
                          : "border-gray-600 hover:border-gray-400"
                      }`}
                      style={{ backgroundColor: color }}
                      title={`Select color ${color}`}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Current color: <span className="font-mono">{formData.color}</span>
                </p>
              </div>
            </div>
          )}

          {/* Notes Tab */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                  📝 GM Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="w-full bg-gray-700 text-white p-3 rounded border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors resize-none"
                  rows={8}
                  placeholder="Add private notes about this token...\n\n• Combat tactics\n• Special abilities\n• Story hooks\n• Behavioral notes"
                />
                <p className="text-xs text-gray-500 mt-1">
                  These notes are only visible to the GM and won't be shared with players.
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-gray-600 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg transition-all hover:scale-105 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all hover:scale-105 font-medium shadow-lg"
            >
              <Save size={16} />
              Save Token
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TokenEditModal;