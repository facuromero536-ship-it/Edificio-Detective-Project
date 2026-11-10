import React, { useState } from 'react';
import { Suspect, ClueItem } from '../game/gameState';
import { noirAudio } from '../audio/noirAudio';
import {
  BookOpen,
  Users,
  Search,
  Clock,
  CheckCircle2,
  AlertTriangle,
  X,
  FileText,
  Wine,
  Watch,
  Key,
  IdCard,
  Sparkles
} from 'lucide-react';

interface NotebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  suspects: Suspect[];
  clues: ClueItem[];
  currentFloor: number;
  onInitiateAccusation: (suspectId: string) => void;
}

export const NotebookModal: React.FC<NotebookModalProps> = ({
  isOpen,
  onClose,
  suspects,
  clues,
  currentFloor,
  onInitiateAccusation
}) => {
  const [activeTab, setActiveTab] = useState<'suspects' | 'clues' | 'timeline' | 'verdict'>('suspects');
  const [selectedSuspect, setSelectedSuspect] = useState<Suspect | null>(suspects[0] || null);
  const [selectedClue, setSelectedClue] = useState<ClueItem | null>(null);

  if (!isOpen) return null;

  const discoveredCluesCount = clues.filter(c => c.discovered).length;

  const handleTabChange = (tab: 'suspects' | 'clues' | 'timeline' | 'verdict') => {
    noirAudio.playPageTurn();
    setActiveTab(tab);
  };

  const getClueIcon = (iconName: string) => {
    switch (iconName) {
      case 'wine': return <Wine className="w-5 h-5 text-purple-400" />;
      case 'watch': return <Watch className="w-5 h-5 text-amber-400" />;
      case 'key': return <Key className="w-5 h-5 text-yellow-400" />;
      case 'id-card': return <IdCard className="w-5 h-5 text-blue-400" />;
      case 'sparkles': return <Sparkles className="w-5 h-5 text-rose-400" />;
      default: return <FileText className="w-5 h-5 text-neutral-300" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-neutral-950/85 backdrop-blur-none pointer-events-auto">
      <div className="w-full max-w-4xl h-[92vh] max-h-[720px] bg-[#181614] border-2 border-[#b8860b]/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-neutral-200">
        {/* Notebook Top Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-[#110f0d] border-b border-[#b8860b]/30">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-amber-500" />
            <div>
              <h2 className="font-serif font-bold text-amber-300 text-lg sm:text-xl tracking-wider">
                DIARIO DE INVESTIGACIÓN: EDIFICIO ARMSTRONG
              </h2>
              <p className="text-xs text-neutral-400 font-mono">
                Piso actual: {currentFloor} · Pistas descubiertas: {discoveredCluesCount}/{clues.length}
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

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-800 bg-[#141210] px-2 sm:px-6 overflow-x-auto">
          <button
            onClick={() => handleTabChange('suspects')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-3 text-xs sm:text-sm font-mono tracking-wider border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'suspects'
                ? 'border-amber-500 text-amber-300 font-bold bg-amber-950/20'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Users className="w-4 h-4" />
            SOSPECHOSOS ({suspects.length})
          </button>
          <button
            onClick={() => handleTabChange('clues')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-3 text-xs sm:text-sm font-mono tracking-wider border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'clues'
                ? 'border-amber-500 text-amber-300 font-bold bg-amber-950/20'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Search className="w-4 h-4" />
            EVIDENCIAS ({discoveredCluesCount}/{clues.length})
          </button>
          <button
            onClick={() => handleTabChange('timeline')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-3 text-xs sm:text-sm font-mono tracking-wider border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'timeline'
                ? 'border-amber-500 text-amber-300 font-bold bg-amber-950/20'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            CRONOGRAMA (11:00-12:00)
          </button>
          <button
            onClick={() => handleTabChange('verdict')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-3 text-xs sm:text-sm font-mono tracking-wider border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'verdict'
                ? 'border-red-500 text-red-300 font-bold bg-red-950/30'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-red-400" />
            ACUSACIÓN FORMAL
          </button>
        </div>

        {/* Notebook Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gradient-to-b from-[#1b1816] to-[#141210]">
          {/* TAB 1: SOSPECHOSOS */}
          {activeTab === 'suspects' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
              {/* Suspect list */}
              <div className="md:col-span-1 space-y-2 border-r border-neutral-800 pr-0 md:pr-4">
                {suspects.map(s => {
                  const isSelected = selectedSuspect?.id === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSuspect(s)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        isSelected
                          ? 'border-amber-500 bg-amber-950/30 text-amber-200 shadow-md'
                          : 'border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800/80 text-neutral-300'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-sm">{s.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-950 text-amber-400 border border-neutral-800">
                          Piso {s.floor}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 truncate mt-0.5">{s.role}</p>
                      <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-neutral-400">
                        <span>Sospecha:</span>
                        <span className="font-bold text-amber-400">{s.suspicionLevel}%</span>
                      </div>
                      <div className="w-full bg-neutral-950 rounded-full h-1.5 mt-1 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-amber-600 to-red-600 h-1.5 rounded-full"
                          style={{ width: `${s.suspicionLevel}%` }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selected suspect dossier */}
              {selectedSuspect && (
                <div className="md:col-span-2 space-y-4 bg-neutral-950/60 p-4 rounded-xl border border-neutral-800 overflow-y-auto max-h-[460px]">
                  <div className="flex items-start justify-between border-b border-neutral-800 pb-3">
                    <div>
                      <h3 className="font-serif text-xl font-bold text-amber-200">{selectedSuspect.name}</h3>
                      <p className="text-xs text-amber-500 font-mono">{selectedSuspect.role} · Ubicación: {selectedSuspect.room}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-neutral-400 font-mono block">Nivel de Sospecha</span>
                      <span className="text-lg font-bold font-mono text-amber-400">{selectedSuspect.suspicionLevel}%</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-mono tracking-wider text-neutral-400 uppercase">Perfil Psicológico:</h4>
                    <p className="text-sm text-neutral-300 mt-1 leading-relaxed">{selectedSuspect.bio}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">
                      <h5 className="text-xs font-mono tracking-wider text-amber-400 uppercase">Coartada Declarada:</h5>
                      <p className="text-xs text-neutral-300 mt-1 italic">"{selectedSuspect.alibi}"</p>
                    </div>
                    <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">
                      <h5 className="text-xs font-mono tracking-wider text-red-400 uppercase">Motivo Oculto:</h5>
                      <p className="text-xs text-neutral-300 mt-1">{selectedSuspect.motive}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-mono tracking-wider text-neutral-400 uppercase">Notas del Detective:</h4>
                    <ul className="mt-2 space-y-1.5 text-xs text-neutral-300 font-mono">
                      {selectedSuspect.notes.map((note, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-amber-500 mt-0.5">•</span>
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PISTAS & EVIDENCIAS */}
          {activeTab === 'clues' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {clues.map(clue => (
                  <div
                    key={clue.id}
                    onClick={() => clue.discovered && setSelectedClue(clue)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      clue.discovered
                        ? 'bg-neutral-900/80 border-amber-600/50 hover:border-amber-400'
                        : 'bg-neutral-950/40 border-neutral-900 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="p-2 rounded-lg bg-neutral-950 border border-neutral-800">
                        {clue.discovered ? getClueIcon(clue.icon) : <Search className="w-5 h-5 text-neutral-600" />}
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-950 text-neutral-400 border border-neutral-800">
                        Piso {clue.floor}
                      </span>
                    </div>
                    <h4 className="font-serif font-bold text-sm mt-2 text-neutral-100">
                      {clue.discovered ? clue.name : '??? Pista no descubierta'}
                    </h4>
                    <p className="text-xs text-neutral-400 mt-1 line-clamp-2">
                      {clue.discovered ? clue.description : 'Sigue investigando las habitaciones del edificio...'}
                    </p>
                    {clue.discovered && (
                      <div className="mt-2 flex items-center gap-1 text-[11px] text-amber-500 font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Encontrada en: {clue.location}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {selectedClue && (
                <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-600/40 mt-4">
                  <div className="flex justify-between items-start">
                    <h4 className="font-serif font-bold text-base text-amber-300">{selectedClue.name}</h4>
                    <button
                      onClick={() => setSelectedClue(null)}
                      className="text-xs text-neutral-400 hover:text-white"
                    >
                      Cerrar
                    </button>
                  </div>
                  <p className="text-sm text-neutral-200 mt-2 font-mono leading-relaxed">{selectedClue.details}</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CRONOGRAMA */}
          {activeTab === 'timeline' && (
            <div className="space-y-4 max-w-2xl mx-auto py-2">
              <div className="relative border-l-2 border-amber-600/40 ml-4 pl-6 space-y-6">
                <div className="relative">
                  <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-amber-500 ring-4 ring-neutral-950" />
                  <span className="text-xs font-mono font-bold text-amber-400">11:15 PM</span>
                  <h4 className="text-sm font-bold text-neutral-200 mt-0.5">Discusión violenta en el Piso 2</h4>
                  <p className="text-xs text-neutral-400 mt-1">Madame Vivienne exige las escrituras de su apartamento. Lord Armstrong amenaza con desalojarla.</p>
                </div>

                <div className="relative">
                  <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-amber-500 ring-4 ring-neutral-950" />
                  <span className="text-xs font-mono font-bold text-amber-400">11:30 PM</span>
                  <h4 className="text-sm font-bold text-neutral-200 mt-0.5">Ascensor activado hacia el Piso 3</h4>
                  <p className="text-xs text-neutral-400 mt-1">Don Teodoro escucha la maquinaria del ascensor. Alguien visita o vulnera el laboratorio del Dr. Thorne.</p>
                </div>

                <div className="relative">
                  <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-amber-500 ring-4 ring-neutral-950" />
                  <span className="text-xs font-mono font-bold text-amber-400">11:38 PM</span>
                  <h4 className="text-sm font-bold text-neutral-200 mt-0.5">Pasos en las escaleras al Piso 4</h4>
                  <p className="text-xs text-neutral-400 mt-1">Pisadas pesadas con botas mojadas suben a la suite de Armstrong sin usar el ascensor.</p>
                </div>

                <div className="relative">
                  <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-red-500 ring-4 ring-neutral-950 animate-pulse" />
                  <span className="text-xs font-mono font-bold text-red-400">11:42 PM (HORA DEL CRIMEN)</span>
                  <h4 className="text-sm font-bold text-red-200 mt-0.5">Muerte de Lord Arthur Armstrong</h4>
                  <p className="text-xs text-neutral-300 mt-1">El reloj de bolsillo se detiene tras romperse en el forcejeo. La copa de cianuro es ingerida y la caja fuerte abierta.</p>
                </div>

                <div className="relative">
                  <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-amber-500 ring-4 ring-neutral-950" />
                  <span className="text-xs font-mono font-bold text-amber-400">11:55 PM</span>
                  <h4 className="text-sm font-bold text-neutral-200 mt-0.5">Sombra en la azotea del Piso 5</h4>
                  <p className="text-xs text-neutral-400 mt-1">Alguien prepara una huida por las escaleras de incendios antes de que llegue la patrulla policial.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ACUSACIÓN FORMAL */}
          {activeTab === 'verdict' && (
            <div className="max-w-2xl mx-auto space-y-4 py-2">
              <div className="p-4 rounded-xl bg-red-950/40 border border-red-700/50">
                <h3 className="font-serif font-bold text-lg text-red-300 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  EMITIR ORDEN DE ARRESTO FORMAL
                </h3>
                <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                  Cuidado, detective: acusar a la persona equivocada cambiará drásticamente el final del juego y arruinará el caso judicial. Selecciona al culpable con base en las pruebas.
                </p>
              </div>

              <div className="space-y-3">
                {suspects.map(s => (
                  <div
                    key={s.id}
                    className="p-3.5 rounded-xl border border-neutral-800 bg-neutral-900 flex items-center justify-between gap-3"
                  >
                    <div>
                      <h4 className="font-bold text-sm text-neutral-100">{s.name}</h4>
                      <p className="text-xs text-neutral-400">{s.role} · Piso {s.floor}</p>
                    </div>

                    <button
                      onClick={() => {
                        onInitiateAccusation(s.id);
                        onClose();
                      }}
                      className="px-4 py-2 text-xs font-mono uppercase font-bold tracking-wider rounded-lg bg-red-900/80 hover:bg-red-800 text-red-100 border border-red-600 transition-colors"
                    >
                      Acusar a {s.name}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
