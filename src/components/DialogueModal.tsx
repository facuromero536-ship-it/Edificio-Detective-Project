import React, { useState, useEffect } from 'react';
import { DialogueNode, Suspect, ClueItem } from '../game/gameState';
import { noirAudio } from '../audio/noirAudio';
import { ShieldAlert, User, ChevronRight, CornerDownRight } from 'lucide-react';

interface DialogueModalProps {
  dialogueNode: DialogueNode | null;
  suspect: Suspect | null;
  discoveredClues: ClueItem[];
  onSelectChoice: (nextId: string, requiredClueId?: string, increasesSuspicion?: number, triggerEvent?: string) => void;
  onClose: () => void;
}

export const DialogueModal: React.FC<DialogueModalProps> = ({
  dialogueNode,
  suspect,
  discoveredClues,
  onSelectChoice,
  onClose
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!dialogueNode) return;
    setDisplayedText('');
    setIsTyping(true);
    let index = 0;
    const fullText = dialogueNode.text;

    const timer = setInterval(() => {
      index++;
      if (index <= fullText.length) {
        setDisplayedText(fullText.slice(0, index));
        if (index % 3 === 0) {
          noirAudio.playDialogueBlip();
        }
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, 22);

    return () => clearInterval(timer);
  }, [dialogueNode]);

  if (!dialogueNode || !suspect) return null;

  const handleSkipTyping = () => {
    if (isTyping) {
      setDisplayedText(dialogueNode.text);
      setIsTyping(false);
    }
  };

  const getMoodBadge = (mood?: string) => {
    switch (mood) {
      case 'nervous':
        return <span className="px-2 py-0.5 rounded text-xs bg-amber-900/60 text-amber-300 border border-amber-600/50">Nervioso</span>;
      case 'terrified':
        return <span className="px-2 py-0.5 rounded text-xs bg-red-950 text-red-300 border border-red-700/60 animate-pulse">Aterrorizado</span>;
      case 'angry':
        return <span className="px-2 py-0.5 rounded text-xs bg-rose-900/70 text-rose-200 border border-rose-600/50">Hostil</span>;
      case 'smug':
        return <span className="px-2 py-0.5 rounded text-xs bg-purple-950/70 text-purple-300 border border-purple-600/50">Cínico</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-xs bg-neutral-800 text-neutral-300 border border-neutral-700">Calmado</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end p-2 sm:p-4 bg-neutral-950/80 backdrop-blur-none pointer-events-auto">
      <div className="w-full max-w-4xl mx-auto bg-neutral-900 border-2 border-amber-600/40 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-950/90 border-b border-amber-600/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-neutral-800 border border-amber-500/40">
              <User className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-200 tracking-wide text-base sm:text-lg">{dialogueNode.speaker}</span>
                {getMoodBadge(dialogueNode.mood)}
              </div>
              <p className="text-xs text-neutral-400 tracking-wider font-mono">{suspect.role}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Suspicion gauge */}
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded bg-neutral-950 border border-neutral-800">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-xs text-neutral-400 font-mono">Sospecha:</span>
              <span className="text-xs font-bold font-mono text-amber-400">{suspect.suspicionLevel}%</span>
            </div>

            <button
              onClick={onClose}
              className="px-3 py-1 text-xs uppercase tracking-wider text-neutral-400 hover:text-amber-200 border border-neutral-700 hover:border-amber-500/50 rounded transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>

        {/* Dialogue Main Speech Box */}
        <div
          onClick={handleSkipTyping}
          className="p-4 sm:p-5 bg-gradient-to-b from-neutral-950/90 to-neutral-900/90 cursor-pointer select-text overflow-y-auto"
        >
          <p className="font-serif text-lg sm:text-xl text-neutral-100 leading-relaxed tracking-wide min-h-[4rem]">
            "{displayedText}"
            {isTyping && <span className="inline-block w-2 h-5 bg-amber-400 ml-1 animate-pulse" />}
          </p>
          {isTyping && (
            <p className="text-[11px] text-amber-500/60 font-mono mt-2 tracking-widest uppercase">
              [Toca para omitir animación de texto]
            </p>
          )}
        </div>

        {/* Response Choices */}
        <div className="p-3 sm:p-4 bg-neutral-950/95 border-t border-amber-600/30 overflow-y-auto max-h-56 flex flex-col gap-2">
          <div className="text-[11px] font-mono tracking-widest text-amber-400/80 uppercase mb-0.5 flex items-center gap-1">
            <CornerDownRight className="w-3.5 h-3.5" />
            Opciones de Interrogatorio:
          </div>

          {dialogueNode.choices.map((choice, idx) => {
            // Check if clue requirement is fulfilled
            const hasRequiredClue = !choice.requiredClueId || discoveredClues.some(c => c.id === choice.requiredClueId && c.discovered);
            const isExit = choice.nextDialogueId === 'exit';

            return (
              <button
                key={idx}
                disabled={!hasRequiredClue}
                onClick={() => {
                  if (isExit) {
                    onClose();
                  } else {
                    onSelectChoice(
                      choice.nextDialogueId,
                      choice.requiredClueId,
                      choice.increasesSuspicion,
                      choice.triggerEvent
                    );
                  }
                }}
                className={`w-full text-left p-2.5 sm:p-3 rounded-lg border text-sm sm:text-base transition-all flex items-start gap-2.5 ${
                  !hasRequiredClue
                    ? 'opacity-40 border-neutral-800 bg-neutral-950/40 text-neutral-500 cursor-not-allowed'
                    : choice.triggerEvent?.startsWith('ending_')
                    ? 'border-red-600/80 bg-red-950/40 text-red-200 hover:bg-red-900/50 hover:border-red-500 active:scale-[0.99]'
                    : choice.requiredClueId
                    ? 'border-amber-500/60 bg-amber-950/30 text-amber-200 hover:bg-amber-900/40 hover:border-amber-400 active:scale-[0.99]'
                    : 'border-neutral-700/80 bg-neutral-900/80 text-neutral-200 hover:bg-neutral-800 hover:border-amber-500/40 active:scale-[0.99]'
                }`}
              >
                <ChevronRight className={`w-4 h-4 shrink-0 mt-0.5 ${choice.requiredClueId ? 'text-amber-400' : 'text-neutral-400'}`} />
                <div className="flex-1">
                  <span>{choice.text}</span>
                  {choice.requiredClueId && !hasRequiredClue && (
                    <span className="block text-[11px] text-red-400/80 font-mono mt-0.5">
                      (Requiere haber descubierto la pista asociada)
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
