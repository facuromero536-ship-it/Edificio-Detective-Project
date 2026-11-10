import React from 'react';
import { noirAudio } from '../audio/noirAudio';
import { X, ArrowUp, ArrowDown } from 'lucide-react';

interface ElevatorModalProps {
  isOpen: boolean;
  currentFloor: number;
  onSelectFloor: (floor: number) => void;
  onClose: () => void;
}

const FLOORS = [
  { floor: 5, name: 'Ático & Azotea', desc: 'Trasteros, conductos de ventilación y salida de incendios', badge: 'Sospechoso Vincent' },
  { floor: 4, name: 'Suite Armstrong', desc: 'Escena del Crimen - Despacho principal de Lord Arthur', badge: 'Cadáver & Caja Fuerte' },
  { floor: 3, name: 'Consultorio Médico', desc: 'Laboratorio y sala de pacientes del Dr. Thorne', badge: 'Sospechoso Thorne' },
  { floor: 2, name: 'Cabaret Suite', desc: 'Aposentos privados y vestidor de Madame Vivienne', badge: 'Sospechosa Vivienne' },
  { floor: 1, name: 'Lobby & Conserjería', desc: 'Recepción, calderas, buzones y salida a la calle', badge: 'Don Teodoro' },
];

export const ElevatorModal: React.FC<ElevatorModalProps> = ({
  isOpen,
  currentFloor,
  onSelectFloor,
  onClose
}) => {
  if (!isOpen) return null;

  const handleFloorClick = (floor: number) => {
    if (floor === currentFloor) return;
    noirAudio.playElevatorChime();
    onSelectFloor(floor);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/85 backdrop-blur-none pointer-events-auto">
      <div className="w-full max-w-md bg-[#161412] border-2 border-[#d4af37]/60 rounded-2xl shadow-2xl p-4 sm:p-5 text-neutral-200">
        {/* Header with Brass Dial */}
        <div className="flex items-center justify-between border-b border-[#d4af37]/30 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full border-2 border-[#d4af37] bg-neutral-950 flex items-center justify-center text-amber-400 font-bold font-mono text-base shadow-inner">
              {currentFloor}
            </div>
            <div>
              <h3 className="font-serif font-bold text-amber-300 text-lg tracking-wider">ASCENSOR ARMSTRONG</h3>
              <p className="text-xs text-neutral-400 font-mono">Selecciona el piso de destino</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-neutral-700 hover:border-amber-500 text-neutral-400 hover:text-amber-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Floor Buttons */}
        <div className="mt-4 space-y-2.5">
          {FLOORS.map(item => {
            const isCurrent = item.floor === currentFloor;
            return (
              <button
                key={item.floor}
                disabled={isCurrent}
                onClick={() => handleFloorClick(item.floor)}
                className={`w-full p-3 rounded-xl border flex items-center justify-between text-left transition-all ${
                  isCurrent
                    ? 'bg-amber-950/30 border-amber-500/80 cursor-default ring-1 ring-amber-500/50'
                    : 'bg-neutral-900 border-neutral-800 hover:bg-neutral-800 hover:border-amber-500/50 active:scale-[0.99]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-mono font-bold text-sm border ${
                      isCurrent
                        ? 'bg-amber-500 text-neutral-950 border-amber-300'
                        : 'bg-neutral-950 text-neutral-300 border-neutral-700'
                    }`}
                  >
                    {item.floor}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-neutral-100">{item.name}</span>
                      {isCurrent && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40">
                          PISO ACTUAL
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 mt-0.5">{item.desc}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-950 text-neutral-400 border border-neutral-800 block">
                    {item.badge}
                  </span>
                  {!isCurrent && (
                    <span className="text-xs text-amber-400 font-mono mt-1 flex items-center justify-end gap-1">
                      {item.floor > currentFloor ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                      Ir al piso
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
