import React, { useState } from "react";
import { useAgentStore } from "../../store/useAgentStore";
import { AgentType } from "../../types/agent";
import { Plus, X } from "lucide-react";

export const AddModelModal: React.FC = () => {
  const { addModel, setActiveNav } = useAgentStore();
  const [name, setName] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [agentType, setAgentType] = useState<AgentType>("antigravity");
  const [color, setColor] = useState("#3b82f6");

  const colors = [
    { label: "Bleu", hex: "#3b82f6" },
    { label: "Ambre", hex: "#f59e0b" },
    { label: "Rouge", hex: "#ef4444" },
    { label: "Violet", hex: "#8b5cf6" },
    { label: "Émeraude", hex: "#10b981" },
    { label: "Blanc", hex: "#ffffff" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addModel({
      id: `custom-${Date.now()}`,
      name: name.trim(),
      subtitle: subtitle.trim() || (agentType === "antigravity" ? "Custom Antigravity" : "Custom Hermes"),
      category: "model",
      color,
      mascotColor: color,
      agentType,
      isCustom: true,
    });
  };

  return (
    <div className="flex-1 flex flex-col justify-center bg-[#141418] border border-[#24242b] rounded-2xl p-4 text-white shadow-inner">
      <div className="flex items-center justify-between mb-3 border-b border-neutral-800 pb-2">
        <div className="flex items-center gap-1.5 font-bold text-xs">
          <Plus size={14} className="text-blue-400" />
          <span>Ajouter un modèle / agent personnalisé</span>
        </div>
        <button
          onClick={() => setActiveNav("home")}
          className="text-neutral-500 hover:text-white"
        >
          <X size={14} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-2.5 text-xs">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-neutral-400 text-[10px] mb-1 font-medium">
              Nom du modèle / outil :
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: Hermes 3 (70B), Gemini Pro..."
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-blue-500 font-sans"
              required
            />
          </div>

          <div>
            <label className="block text-neutral-400 text-[10px] mb-1 font-medium">
              Sous-titre / description :
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="ex: Local Ollama, DeepMind..."
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-blue-500 font-sans"
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          {/* Agent Engine Type */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-neutral-400">Moteur :</span>
            <button
              type="button"
              onClick={() => setAgentType("antigravity")}
              className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                agentType === "antigravity"
                  ? "bg-blue-600 text-white"
                  : "bg-neutral-800 text-neutral-400"
              }`}
            >
              Antigravity
            </button>
            <button
              type="button"
              onClick={() => setAgentType("hermes")}
              className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                agentType === "hermes"
                  ? "bg-amber-600 text-white"
                  : "bg-neutral-800 text-neutral-400"
              }`}
            >
              Hermes
            </button>
          </div>

          {/* Color choices */}
          <div className="flex items-center gap-1">
            {colors.map((c) => (
              <button
                key={c.hex}
                type="button"
                onClick={() => setColor(c.hex)}
                style={{ backgroundColor: c.hex }}
                className={`w-4 h-4 rounded-full transition-transform ${
                  color === c.hex ? "scale-125 ring-2 ring-white" : "opacity-70 hover:opacity-100"
                }`}
                title={c.label}
              />
            ))}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!name.trim()}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold text-xs rounded-lg transition-colors"
          >
            Ajouter
          </button>
        </div>
      </form>
    </div>
  );
};
