import React from "react";
import { useAgentStore } from "../../../store/useAgentStore";
import { Volume2, VolumeX, Monitor, Music } from "lucide-react";
import { pugAudio } from "../../mascot/PugAudio";

export const GeneralTab: React.FC = () => {
  const { settings, updateSoundSettings } = useAgentStore();

  const handleToggleSound = () => {
    updateSoundSettings(!settings.soundEnabled, settings.volume);
    if (!settings.soundEnabled) {
      pugAudio.playBark();
    }
  };

  const handleVolumeChange = (vol: number) => {
    updateSoundSettings(settings.soundEnabled, vol);
  };

  const handleTestBark = () => {
    pugAudio.playBark();
  };

  const handleTestChime = () => {
    pugAudio.playChime();
  };

  return (
    <div className="grid grid-cols-2 gap-3 h-[375px] overflow-y-auto pr-1 select-none text-xs">
      {/* Left: Audio & Companion SFX Card */}
      <div className="flex flex-col justify-between bg-[#111116] border border-[#22222a] rounded-xl p-3.5 text-white shadow-sm">
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800/60 pb-2">
            <div className="flex items-center gap-1.5 font-bold text-neutral-200">
              <Music size={14} className="text-purple-400" />
              <span>Sons & Réactions du Carlin</span>
            </div>
            <span className="text-[10px] text-neutral-500 font-mono">WebAudio</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-neutral-200 text-xs">
                Effets sonores actifs
              </div>
              <div className="text-[10px] text-neutral-400">
                Aboiements doux et carillons de succès.
              </div>
            </div>

            <button
              onClick={handleToggleSound}
              className={`p-1.5 rounded-lg transition-colors border cursor-pointer ${
                settings.soundEnabled
                  ? "bg-purple-600/20 border-purple-500/40 text-purple-300"
                  : "bg-neutral-800 border-neutral-700 text-neutral-500"
              }`}
              title={settings.soundEnabled ? "Couper le son" : "Activer le son"}
            >
              {settings.soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
          </div>

          {/* Volume slider */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[10px] text-neutral-400">
              <span>Volume des effets</span>
              <span className="font-mono text-neutral-300 font-semibold">
                {Math.round((settings.volume ?? 0.8) * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.volume ?? 0.8}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>
        </div>

        {/* SFX test buttons */}
        <div className="pt-2 border-t border-neutral-800/50 mt-2 flex items-center gap-2">
          <button
            onClick={handleTestBark}
            className="flex-1 py-1.5 px-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[10px] font-semibold transition-colors cursor-pointer"
          >
            🐶 Aboiement
          </button>
          <button
            onClick={handleTestChime}
            className="flex-1 py-1.5 px-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[10px] font-semibold transition-colors cursor-pointer"
          >
            ✨ Carillon
          </button>
        </div>
      </div>

      {/* Right: Notch Window Behavior */}
      <div className="flex flex-col justify-between bg-[#111116] border border-[#22222a] rounded-xl p-3.5 text-white shadow-sm">
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800/60 pb-2">
            <div className="flex items-center gap-1.5 font-bold text-neutral-200">
              <Monitor size={14} className="text-blue-400" />
              <span>Affichage & Raccourcis</span>
            </div>
            <span className="text-[10px] text-neutral-500 font-mono">Tauri v2</span>
          </div>

          <div className="space-y-2 text-[11px] text-neutral-400 leading-relaxed">
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-[#18181f] border border-[#24242e]">
              <span>Fermer le notch :</span>
              <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-neutral-200 font-mono text-[10px]">
                Échap
              </kbd>
            </div>
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-[#18181f] border border-[#24242e]">
              <span>Ancrage écran :</span>
              <span className="text-neutral-200 font-mono text-[10px]">Haut-centre (y = 0)</span>
            </div>
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-[#18181f] border border-[#24242e]">
              <span>Mode fermé (pilule) :</span>
              <span className="text-neutral-200 font-mono text-[10px]">84 x 42 px</span>
            </div>
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-[#18181f] border border-[#24242e]">
              <span>Mode ouvert élargi :</span>
              <span className="text-neutral-200 font-mono text-[10px]">750 x 340 px</span>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-neutral-800/50 mt-2 text-right">
          <span className="text-[10px] text-neutral-500 font-mono">
            Bark v0.1.0 • Control Hub
          </span>
        </div>
      </div>
    </div>
  );
};
