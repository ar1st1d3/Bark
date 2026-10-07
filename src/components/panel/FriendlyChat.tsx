import React, { useState, useRef, useEffect } from "react";
import { useAgentStore } from "../../store/useAgentStore";
import { PugCharacter } from "../mascot/PugCharacter";
import { ArrowUp, Paperclip, X, RotateCcw, Key } from "lucide-react";

export const FriendlyChat: React.FC = () => {
  const {
    activeAgent,
    models,
    selectedModelId,
    chatHistories,
    isAgentThinking,
    attachedFile,
    setAttachedFile,
    sendChatMessage,
    clearChatHistory,
    settings,
    setActiveNav,
  } = useAgentStore();

  const [inputVal, setInputVal] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeModel = models.find((m) => m.id === selectedModelId) || models[0];
  const messages = chatHistories[activeAgent] || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAgentThinking]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() && !attachedFile) return;

    const text = inputVal.trim() || (attachedFile ? `Analyser le fichier ${attachedFile.name}` : "");
    setInputVal("");
    await sendChatMessage(activeAgent, text);
  };

  const activeModelName =
    activeAgent === "antigravity"
      ? settings.antigravity.model
      : settings.hermes.model.split("/").pop() || settings.hermes.model;

  return (
    <div className="flex flex-col h-[260px] bg-[#141418] border border-[#24242b] rounded-2xl p-3.5 text-white shadow-inner select-none overflow-hidden justify-between">
      {/* Top Bar: Active Agent Pill Badge (e.g. ● Claude / Antigravity / Hermes) */}
      <div className="flex items-center justify-between pb-1.5 border-b border-neutral-800/50">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-semibold">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: activeModel.color }}
            />
            <span className="text-neutral-200">{activeModel.name}</span>
          </div>

          <button
            onClick={() => setActiveNav("settings")}
            className="text-[10px] text-neutral-500 hover:text-neutral-300 transition-colors flex items-center gap-1 px-2 py-0.5 rounded bg-neutral-900/50 border border-neutral-800/60"
            title="Modifier le modèle dans les Paramètres"
          >
            <span className="font-mono text-neutral-400">{activeModelName}</span>
          </button>

          {activeAgent === "antigravity" &&
            settings.antigravity.mode === "gemini_api" &&
            !settings.antigravity.apiKey.trim() && (
              <button
                onClick={() => setActiveNav("settings")}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/40 text-[10px] text-amber-300 hover:text-amber-200 transition-colors"
                title="Saisissez votre clé API Google Gemini dans les paramètres"
              >
                <Key size={10} />
                <span>Clé API requise</span>
              </button>
            )}
        </div>

        <div className="flex items-center gap-2">
          {/* New Chat Button */}
          <button
            onClick={() => clearChatHistory(activeAgent)}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-neutral-900/70 border border-neutral-800 hover:border-neutral-700 text-[10px] text-neutral-400 hover:text-neutral-200 transition-colors"
            title="Effacer l'historique et démarrer une nouvelle conversation"
          >
            <RotateCcw size={10} />
            <span>Nouveau</span>
          </button>

          {/* Attached file chip if any */}
          {attachedFile && (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-950/70 border border-blue-500/40 text-blue-300 text-[11px] font-mono">
              <Paperclip size={11} />
              <span className="truncate max-w-[130px]">{attachedFile.name}</span>
              <button
                onClick={() => setAttachedFile(null)}
                className="hover:text-white ml-0.5"
              >
                <X size={11} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Message History Area */}
      <div className="flex-1 overflow-y-auto py-2 space-y-2.5 pr-1 scroll-smooth">
        {messages.map((msg) => {
          const isUser = msg.sender === "user";
          return (
            <div
              key={msg.id}
              className={`flex items-end ${isUser ? "justify-end" : "justify-start"}`}
            >
              {/* Message Bubble */}
              <div
                className={`max-w-[78%] px-4 py-2 text-xs leading-relaxed ${
                  isUser
                    ? "bg-neutral-800 text-white rounded-2xl rounded-tr-sm shadow-md font-medium"
                    : "bg-neutral-900/90 text-neutral-200 rounded-2xl rounded-tl-sm border border-neutral-800/80 shadow-sm"
                }`}
              >
                {msg.attachment && (
                  <div className="flex items-center gap-1 text-[10px] text-blue-300 font-mono mb-1 pb-1 border-b border-neutral-700/50">
                    <Paperclip size={10} />
                    <span>{msg.attachment}</span>
                  </div>
                )}
                <div className="whitespace-pre-wrap">{msg.text}</div>
              </div>
            </div>
          );
        })}

        {/* Animated thinking dots matching Coucou */}
        {isAgentThinking && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-400">
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Bar: Companion Mascot on Left + Capsule Input on Right (Exactly matching Coucou Image 2) */}
      <form onSubmit={handleSubmit} className="flex items-center gap-3 pt-1">
        {/* Companion Mascot with Purple Speech Badge on Top-Left (as in Coucou Image 2) */}
        <div className="relative flex-shrink-0">
          <PugCharacter state={isAgentThinking ? "thinking" : "idle"} size={42} />

          {/* Purple speech bubble badge on mascot's ear with 3 dots */}
          <div
            className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-purple-600 border border-purple-400/40 flex items-center justify-center shadow-md select-none pointer-events-none"
            title="Assistant actif"
          >
            <div className="flex items-center gap-0.5">
              <span className="w-0.5 h-0.5 rounded-full bg-white" />
              <span className="w-0.5 h-0.5 rounded-full bg-white" />
              <span className="w-0.5 h-0.5 rounded-full bg-white" />
            </div>
          </div>
        </div>

        {/* Full-width Capsule Input */}
        <div className="flex-1 flex items-center gap-2 bg-[#1c1c22] border border-neutral-800 rounded-full px-4 py-2 shadow-inner focus-within:border-neutral-600 transition-colors">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Continue..."
            className="flex-1 bg-transparent text-xs text-white placeholder-neutral-500 focus:outline-none font-sans"
          />

          {/* Send Circular Button with Arrow Up */}
          <button
            type="submit"
            disabled={!inputVal.trim() && !attachedFile}
            className="flex-shrink-0 w-6 h-6 rounded-full bg-white text-black hover:bg-neutral-200 disabled:opacity-30 disabled:hover:bg-white flex items-center justify-center transition-all shadow-sm cursor-pointer"
            title="Envoyer la consigne"
          >
            <ArrowUp size={13} strokeWidth={2.8} />
          </button>
        </div>
      </form>
    </div>
  );
};
