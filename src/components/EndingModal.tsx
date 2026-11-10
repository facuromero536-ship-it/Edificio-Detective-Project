import React from 'react';
import { EndingData } from '../game/gameState';
import { RotateCcw, Award, AlertTriangle, ShieldCheck, Skull } from 'lucide-react';

interface EndingModalProps {
  ending: EndingData | null;
  onRestart: () => void;
}

export const EndingModal: React.FC<EndingModalProps> = ({ ending, onRestart }) => {
  if (!ending) return null;

  const getVerdictIcon = () => {
    switch (ending.verdict) {
      case 'Victoria':
        return <ShieldCheck className="w-8 h-8 text-emerald-400" />;
      case 'Corrupción':
        return <Award className="w-8 h-8 text-purple-400" />;
      case 'Tragedia':
        return <AlertTriangle className="w-8 h-8 text-amber-400" />;
      default:
        return <Skull className="w-8 h-8 text-red-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-neutral-950/90 backdrop-blur-none pointer-events-auto">
      <div className="w-full max-w-2xl bg-[#efe5d0] text-[#1b1917] border-4 border-[#3c2a21] rounded-xl shadow-2xl p-5 sm:p-8 flex flex-col font-serif select-text max-h-[90vh] overflow-y-auto">
        {/* Newspaper Masthead */}
        <div className="text-center border-b-2 border-[#3c2a21] pb-3">
          <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-[#57493d] block">
            EDICIÓN EXTRAORDINARIA DE MEDIANOCHE · NOVIEMBRE 1947
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight mt-1 uppercase text-[#1c1917]">
            EL HERALDO NOCTURNO
          </h1>
          <div className="flex items-center justify-between text-[11px] font-mono border-t border-b border-[#3c2a21] mt-2 py-1 px-2 text-[#57493d]">
            <span>PRECIO: 5 CENTAVOS</span>
            <span>CASO: CRIMEN EN EL EDIFICIO ARMSTRONG</span>
            <span>CLIMA: TORMENTA TORRENCIAL</span>
          </div>
        </div>

        {/* Headline */}
        <div className="my-4 text-center">
          <h2 className="text-xl sm:text-2xl font-black uppercase text-[#881337] tracking-wide leading-tight">
            {ending.newspaperHeadline}
          </h2>
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#3c2a21] bg-[#ded2bc] text-xs font-mono font-bold uppercase">
            {getVerdictIcon()}
            <span>Desenlace: {ending.title} ({ending.verdict})</span>
          </div>
        </div>

        {/* Narrative Article Body */}
        <div className="border-t border-b border-[#3c2a21]/40 py-4 my-2 text-sm sm:text-base leading-relaxed text-[#2c241e] font-serif space-y-3">
          <p className="first-letter:text-4xl first-letter:font-bold first-letter:mr-1 first-letter:float-left first-letter:text-[#881337]">
            {ending.description}
          </p>
          <p className="italic text-xs font-mono text-[#57493d]">
            "En esta ciudad fría y empapada de lluvia, la verdad siempre tiene un precio... solo resta saber quién estaba dispuesto a pagarlo."
          </p>
        </div>

        {/* Footer / Replay Button */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <span className="text-xs font-mono text-[#57493d]">
            Has descubierto uno de los múltiples desenlaces posibles.
          </span>
          <button
            onClick={onRestart}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-[#3c2a21] hover:bg-[#251913] text-[#fdfbf7] font-mono text-xs uppercase tracking-wider font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reiniciar Investigación
          </button>
        </div>
      </div>
    </div>
  );
};
