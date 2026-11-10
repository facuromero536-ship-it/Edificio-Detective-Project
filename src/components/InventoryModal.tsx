import React, { useState } from 'react';
import { ClueItem } from '../game/gameState';
import { X, Wine, Watch, Key, IdCard, Sparkles, FileText, CheckCircle2 } from 'lucide-react';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  clues: ClueItem[];
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  isOpen,
  onClose,
  clues
}) => {
  const [selectedItem, setSelectedItem] = useState<ClueItem | null>(null);
  const discoveredClues = clues.filter(c => c.discovered);

  if (!isOpen) return null;

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'wine': return <Wine className="w-6 h-6 text-purple-400" />;
      case 'watch': return <Watch className="w-6 h-6 text-amber-400" />;
      case 'key': return <Key className="w-6 h-6 text-yellow-400" />;
      case 'id-card': return <IdCard className="w-6 h-6 text-blue-400" />;
      case 'sparkles': return <Sparkles className="w-6 h-6 text-rose-400" />;
      default: return <FileText className="w-6 h-6 text-neutral-300" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/85 backdrop-blur-none pointer-events-auto">
      <div className="w-full max-w-2xl bg-[#141416] border-2 border-amber-600/40 rounded-2xl shadow-2xl p-4 sm:p-6 text-neutral-200 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div>
            <h3 className="font-serif font-bold text-amber-300 text-lg tracking-wider">MALETÍN DE EVIDENCIAS</h3>
            <p className="text-xs text-neutral-400 font-mono">
              {discoveredClues.length} objetos recolectados de la escena
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-neutral-700 hover:border-amber-500 text-neutral-400 hover:text-amber-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Clues Grid */}
        <div className="mt-4 flex-1 overflow-y-auto">
          {discoveredClues.length === 0 ? (
            <div className="text-center py-12 text-neutral-500">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="font-serif text-base">Aún no has recogido ninguna evidencia.</p>
              <p className="text-xs font-mono text-neutral-600 mt-1">Explora los pisos e interactúa con los objetos usando el botón de acción.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {discoveredClues.map(item => {
                const isSelected = selectedItem?.id === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-amber-500 bg-amber-950/30 ring-1 ring-amber-500/50'
                        : 'border-neutral-800 bg-neutral-900/80 hover:bg-neutral-800/80'
                    }`}
                  >
                    <div className="flex items-start justify-between w-full">
                      <div className="p-2 rounded-lg bg-neutral-950 border border-neutral-800">
                        {getIcon(item.icon)}
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-950 text-neutral-400 border border-neutral-800">
                        P{item.floor}
                      </span>
                    </div>
                    <div className="mt-3">
                      <h4 className="font-bold text-xs sm:text-sm text-neutral-200 line-clamp-1">{item.name}</h4>
                      <p className="text-[11px] text-neutral-400 font-mono mt-0.5 capitalize">{item.category}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Clue Inspection Detail */}
        {selectedItem && (
          <div className="mt-4 p-4 rounded-xl bg-neutral-950 border border-amber-600/30">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-serif font-bold text-base text-amber-300">{selectedItem.name}</h4>
                <p className="text-xs text-neutral-400 font-mono">
                  Ubicación de hallazgo: {selectedItem.location} (Piso {selectedItem.floor})
                </p>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 capitalize">
                {selectedItem.category}
              </span>
            </div>
            <p className="text-xs text-neutral-300 mt-2 font-mono leading-relaxed">{selectedItem.description}</p>
            <div className="mt-2 pt-2 border-t border-neutral-900 flex items-center gap-1.5 text-xs text-amber-400/90 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
              <span>{selectedItem.details}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
