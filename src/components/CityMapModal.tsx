import React from 'react';
import { CITY_LOCATIONS, LocationType } from '../game/casesData';
import { noirAudio } from '../audio/noirAudio';
import {
  MapPin,
  Building,
  BookOpen,
  Activity,
  GraduationCap,
  Footprints,
  Compass,
  X,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

interface CityMapModalProps {
  isOpen: boolean;
  currentLocation: LocationType;
  onSelectLocation: (loc: LocationType) => void;
  onClose: () => void;
  discoveredCluesCount: number;
}

export const CityMapModal: React.FC<CityMapModalProps> = ({
  isOpen,
  currentLocation,
  onSelectLocation,
  onClose,
  discoveredCluesCount
}) => {
  if (!isOpen) return null;

  const getLocationIcon = (id: LocationType) => {
    switch (id) {
      case 'armstrong': return <Building className="w-5 h-5 text-amber-400" />;
      case 'bookstore': return <BookOpen className="w-5 h-5 text-emerald-400" />;
      case 'hospital': return <Activity className="w-5 h-5 text-sky-400" />;
      case 'school': return <GraduationCap className="w-5 h-5 text-purple-400" />;
      default: return <Footprints className="w-5 h-5 text-neutral-300" />;
    }
  };

  const handleTravel = (loc: LocationType) => {
    noirAudio.playPageTurn();
    onSelectLocation(loc);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-neutral-950/85 backdrop-blur-none pointer-events-auto text-neutral-100">
      <div className="w-full max-w-2xl bg-[#12141a] border-2 border-amber-600/50 rounded-2xl shadow-2xl p-4 sm:p-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-amber-300 text-lg sm:text-xl tracking-wider">
                PLANO DE LA CIUDAD (4 CUADRAS)
              </h3>
              <p className="text-xs text-neutral-400 font-mono">
                Selecciona un edificio o sal a patrullar las calles
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-neutral-700 hover:border-amber-500 text-neutral-400 hover:text-amber-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Central Street Quick Action */}
        <div className="mt-4 p-3.5 rounded-xl bg-neutral-900 border border-neutral-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center text-amber-400 border border-neutral-700">
              <Footprints className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm text-neutral-100 block">Calles de la Ciudad (4 Cuadras)</span>
              <p className="text-xs text-neutral-400 font-mono">Peatones, testigos, quiosco de periódicos y coches policiales</p>
            </div>
          </div>
          <button
            onClick={() => handleTravel('city')}
            className={`px-4 py-2 rounded-lg font-mono text-xs uppercase font-bold tracking-wider transition-all flex items-center gap-1.5 ${
              currentLocation === 'city'
                ? 'bg-amber-600/30 text-amber-300 border border-amber-500'
                : 'bg-amber-600 hover:bg-amber-500 text-neutral-950 active:scale-95'
            }`}
          >
            {currentLocation === 'city' ? 'Ubicación Actual' : 'Ir a las Calles'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Locations Grid */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 overflow-y-auto">
          {CITY_LOCATIONS.map(loc => {
            const isCurrent = currentLocation === loc.id;
            return (
              <div
                key={loc.id}
                className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                  isCurrent
                    ? 'border-amber-500 bg-amber-950/30 ring-1 ring-amber-500/50'
                    : 'border-neutral-800 bg-neutral-900/80 hover:border-amber-500/50 hover:bg-neutral-800/60'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="p-2 rounded-lg bg-neutral-950 border border-neutral-800">
                      {getLocationIcon(loc.id)}
                    </div>
                    {isCurrent && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                        ESTÁS AQUÍ
                      </span>
                    )}
                  </div>
                  <h4 className="font-serif font-bold text-sm sm:text-base text-neutral-100 mt-2">
                    {loc.name}
                  </h4>
                  <span className="text-[11px] font-mono text-amber-400/90 block mt-0.5 font-bold">
                    {loc.caseTitle}
                  </span>
                  <p className="text-xs text-neutral-400 mt-1 line-clamp-2">
                    {loc.shortDesc}
                  </p>
                </div>

                <div className="mt-4 pt-2 border-t border-neutral-800 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-neutral-500">
                    {loc.id === 'armstrong' ? '5 Pisos con Ascensor' : 'Caso Especial'}
                  </span>
                  <button
                    onClick={() => handleTravel(loc.id)}
                    disabled={isCurrent}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center gap-1 ${
                      isCurrent
                        ? 'opacity-40 cursor-default text-neutral-400'
                        : 'bg-neutral-800 hover:bg-amber-600 hover:text-neutral-950 text-neutral-200 active:scale-95'
                    }`}
                  >
                    <span>Entrar</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Map Legend */}
        <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between text-xs font-mono text-neutral-400">
          <span className="flex items-center gap-1 text-amber-400">
            <ShieldAlert className="w-3.5 h-3.5" />
            Puedes viajar libremente o caminar hasta las puertas en la calle
          </span>
        </div>
      </div>
    </div>
  );
};
