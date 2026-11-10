import React, { useState } from 'react';
import { GameSettings, SaveState } from '../game/gameState';
import {
  Play,
  Save,
  FolderOpen,
  RotateCcw,
  Gauge,
  Sliders,
  CheckCircle2,
  X,
  Volume2,
  VolumeX,
  Moon,
  Zap,
  Sparkles
} from 'lucide-react';

interface PauseModalProps {
  isOpen: boolean;
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  lastSaveInfo: SaveState | null;
  currentFloor: number;
  discoveredCluesCount: number;
  totalCluesCount: number;
  onResume: () => void;
  onSaveGame: () => void;
  onLoadGame: () => void;
  onRestartGame: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  isOpen,
  settings,
  onUpdateSettings,
  lastSaveInfo,
  currentFloor,
  discoveredCluesCount,
  totalCluesCount,
  onResume,
  onSaveGame,
  onLoadGame,
  onRestartGame,
  isMuted,
  onToggleMute
}) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'save'>('settings');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleManualSave = () => {
    onSaveGame();
    setSaveSuccessMsg(`¡Partida guardada exitosamente (${new Date().toLocaleTimeString()})!`);
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-neutral-950/90 backdrop-blur-none pointer-events-auto text-neutral-100">
      <div className="w-full max-w-xl bg-[#141418] border-2 border-amber-600/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#0e0e12] border-b border-amber-600/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-sm">
              ⏸
            </div>
            <div>
              <h3 className="font-serif font-bold text-amber-300 text-lg tracking-wider">
                PAUSA & CONFIGURACIÓN
              </h3>
              <p className="text-xs text-neutral-400 font-mono">
                Piso actual: {currentFloor} · Pistas: {discoveredCluesCount}/{totalCluesCount}
              </p>
            </div>
          </div>
          <button
            onClick={onResume}
            className="p-1.5 rounded-lg border border-neutral-700 hover:border-amber-500 text-neutral-400 hover:text-amber-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-neutral-800 bg-[#101014] px-4">
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-mono tracking-wider border-b-2 transition-colors ${
              activeTab === 'settings'
                ? 'border-amber-500 text-amber-300 font-bold bg-amber-950/20'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            RENDIMIENTO & FPS
          </button>
          <button
            onClick={() => setActiveTab('save')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-mono tracking-wider border-b-2 transition-colors ${
              activeTab === 'save'
                ? 'border-amber-500 text-amber-300 font-bold bg-amber-950/20'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Save className="w-4 h-4" />
            GUARDAR / CARGAR
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 bg-gradient-to-b from-[#141418] to-[#0c0c10]">
          {activeTab === 'settings' && (
            <div className="space-y-5">
              {/* FPS LIMITER (30 FPS vs 60 FPS) */}
              <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-sm text-neutral-200">Tasa de Cuadros (FPS)</span>
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-neutral-950 text-amber-400 border border-neutral-800">
                    {settings.targetFps} FPS activo
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mb-3 font-mono">
                  Si experimentas lentitud o juegas desde un celular, activa 30 FPS para eliminar el lag y ahorrar batería.
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => onUpdateSettings({ targetFps: 30 })}
                    className={`py-2.5 px-3 rounded-lg border font-mono text-xs sm:text-sm font-bold transition-all flex flex-col items-center justify-center ${
                      settings.targetFps === 30
                        ? 'border-amber-500 bg-amber-950/40 text-amber-300 ring-1 ring-amber-500'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-400" />
                      30 FPS
                    </span>
                    <span className="text-[10px] font-normal text-neutral-400 mt-0.5">(Fluido & Sin Lag)</span>
                  </button>
                  <button
                    onClick={() => onUpdateSettings({ targetFps: 60 })}
                    className={`py-2.5 px-3 rounded-lg border font-mono text-xs sm:text-sm font-bold transition-all flex flex-col items-center justify-center ${
                      settings.targetFps === 60
                        ? 'border-amber-500 bg-amber-950/40 text-amber-300 ring-1 ring-amber-500'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      60 FPS
                    </span>
                    <span className="text-[10px] font-normal text-neutral-400 mt-0.5">(Máxima Suavidad)</span>
                  </button>
                </div>
              </div>

              {/* GRAPHICS PRESET */}
              <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800">
                <span className="font-bold text-sm text-neutral-200 block mb-1">Calidad Gráfica</span>
                <p className="text-xs text-neutral-400 mb-3 font-mono">
                  Ajusta la resolución interna y detalles del motor 3D.
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {(['performance', 'balanced', 'high'] as const).map(q => {
                    const isSelected = settings.quality === q;
                    const label = q === 'performance' ? 'Rendimiento' : q === 'balanced' ? 'Equilibrado' : 'Alta';
                    return (
                      <button
                        key={q}
                        onClick={() => {
                          const shadows = q === 'high';
                          const rain = q === 'performance' ? 'low' : q === 'balanced' ? 'medium' : 'high';
                          onUpdateSettings({ quality: q, shadowsEnabled: shadows, rainDensity: rain });
                        }}
                        className={`py-2 px-2 rounded-lg border font-mono text-xs font-bold transition-all ${
                          isSelected
                            ? 'border-amber-500 bg-amber-950/40 text-amber-300 ring-1 ring-amber-500'
                            : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* DYNAMIC SHADOWS TOGGLE */}
              <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-xs sm:text-sm text-neutral-200">Sombras Direccionales</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                    {settings.shadowsEnabled ? 'Activadas (consume más GPU)' : 'Desactivadas (gran aumento de FPS)'}
                  </p>
                </div>
                <button
                  onClick={() => onUpdateSettings({ shadowsEnabled: !settings.shadowsEnabled })}
                  className={`px-3 py-1.5 rounded-lg border font-mono text-xs font-bold transition-all ${
                    settings.shadowsEnabled
                      ? 'bg-amber-600/30 border-amber-500 text-amber-300'
                      : 'bg-neutral-950 border-neutral-700 text-neutral-400'
                  }`}
                >
                  {settings.shadowsEnabled ? 'ACTIVADAS' : 'DESACTIVADAS'}
                </button>
              </div>

              {/* AUDIO QUICK TOGGLE */}
              <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs sm:text-sm text-neutral-200">Banda Sonora & Sonidos</span>
                  <p className="text-[11px] text-neutral-400 font-mono mt-0.5">Música Jazz Noir y efectos de ambiente</p>
                </div>
                <button
                  onClick={onToggleMute}
                  className="px-3 py-1.5 rounded-lg border border-neutral-700 hover:border-amber-500 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                  <span>{isMuted ? 'SILENCIADO' : 'ACTIVADO'}</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'save' && (
            <div className="space-y-4">
              {/* Notification Banner */}
              {saveSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500 text-emerald-200 text-xs font-mono flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}

              {/* Current Progress Overview */}
              <div className="p-4 rounded-xl bg-neutral-900 border border-amber-600/30">
                <span className="text-xs font-mono uppercase text-amber-500 tracking-wider block">
                  Estado Actual de la Partida
                </span>
                <div className="mt-2 grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-2 rounded bg-neutral-950 border border-neutral-800">
                    <span className="text-neutral-400 block">Piso Actual:</span>
                    <span className="font-bold text-amber-300 text-sm">Piso {currentFloor}</span>
                  </div>
                  <div className="p-2 rounded bg-neutral-950 border border-neutral-800">
                    <span className="text-neutral-400 block">Pistas Recogidas:</span>
                    <span className="font-bold text-amber-300 text-sm">{discoveredCluesCount} / {totalCluesCount}</span>
                  </div>
                </div>
              </div>

              {/* Last Save State Slot */}
              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-mono text-neutral-300 font-bold uppercase">
                    Ranura de Guardado en Disco
                  </span>
                  {lastSaveInfo ? (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-700/60">
                      PARTIDA GUARDADA
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-950 text-neutral-500">
                      VACÍA
                    </span>
                  )}
                </div>

                {lastSaveInfo ? (
                  <div className="text-xs text-neutral-400 font-mono space-y-1 mb-4">
                    <p>Fecha: <span className="text-neutral-200">{new Date(lastSaveInfo.timestamp).toLocaleString()}</span></p>
                    <p>Ubicación: <span className="text-amber-300">Piso {lastSaveInfo.floor}</span></p>
                    <p>Evidencias: <span className="text-amber-300">{lastSaveInfo.clues.filter(c => c.discovered).length} registradas</span></p>
                  </div>
                ) : (
                  <p className="text-xs text-neutral-500 italic mb-4 font-mono">
                    Aún no has guardado manualmente una partida en esta sesión.
                  </p>
                )}

                {/* Save and Load Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={handleManualSave}
                    className="py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-neutral-950 font-bold font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
                  >
                    <Save className="w-4 h-4" />
                    Guardar Partida
                  </button>

                  <button
                    onClick={onLoadGame}
                    disabled={!lastSaveInfo}
                    className={`py-3 px-4 rounded-xl border font-bold font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                      lastSaveInfo
                        ? 'bg-neutral-800 hover:bg-neutral-700 border-neutral-600 text-neutral-200 active:scale-95'
                        : 'bg-neutral-950 border-neutral-900 text-neutral-600 cursor-not-allowed'
                    }`}
                  >
                    <FolderOpen className="w-4 h-4" />
                    Cargar Partida
                  </button>
                </div>
              </div>

              {/* Danger Zone: Restart */}
              <div className="pt-2">
                <button
                  onClick={onRestartGame}
                  className="w-full py-2.5 rounded-xl border border-red-900/60 hover:bg-red-950/40 text-red-300 hover:text-red-200 font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reiniciar Caso desde el Principio
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer with Big Resume Button */}
        <div className="p-4 bg-[#0e0e12] border-t border-neutral-800 flex items-center justify-between gap-3">
          <span className="text-[11px] font-mono text-neutral-500 hidden sm:inline">
            Presiona ESC o toca Reanudar para volver
          </span>
          <button
            onClick={onResume}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-neutral-950 font-bold font-mono text-xs sm:text-sm uppercase tracking-wider shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            Reanudar Juego
          </button>
        </div>
      </div>
    </div>
  );
};
