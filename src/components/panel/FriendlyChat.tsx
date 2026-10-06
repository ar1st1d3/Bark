import React, { useState, useRef, useEffect } from "react";
import { useAgentStore } from "../../store/useAgentStore";
import { PugCharacter } from "../mascot/PugCharacter";
import { ArrowUp, Paperclip, X, MessageSquare } from "lucide-react";

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

  return (
    <div className="flex flex-col h-[260px] bg-[#141418] border border-[#24242b] rounded-2xl p-3.5 text-white shadow-inner select-none overflow-hidden justify-between">
      {/* Top Bar: Active Agent Pill Badge (e.g. ● Claude / Antigravity / Hermes) */}
      <div className="flex items-center justify-between pb-1 border-b border-neutral-800/40">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-900/90 border border-neutral-800 text-xs font-semibold">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: activeModel.color }}
          />
          <span className="text-neutral-200">{activeModel.name}</span>
        </div>

        {attachedFile && (
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-950/70 border border-blue-500/40 text-blue-300 text-[11px] font-mono">
            <Paperclip size={11} />
            <span className="truncate max-w-[140px]">{attachedFile.name}</span>
            <button
              onClick={() => setAttachedFile(null)}
              className="hover:text-white ml-0.5"
            >
              <X size={11} />
            </button>
          </div>
        )}
      </div>

      {/* Message History Area */}
      <div className="flex-1 overflow-y-auto py-2.5 space-y-2.5 pr-1 scroll-smooth">
        {messages.map((msg) => {
          const isUser = msg.sender === "user";
          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}
            >
              {/* If Agent: render Pug Mascot avatar with cute purple badge */}
              {!isUser && (
                <div className="relative flex-shrink-0 mb-0.5">
                  <PugCharacter state="idle" size={32} />
                  {/* Purple bubble badge on the mascot's head matching Coucou */}
                  <div className="absolute -top-1 -left-1 w-3.5 h-3.5 rounded-full bg-purple-600 flex items-center justify-center shadow-sm">
                    <MessageSquare size={8} className="text-white" />
                  </div>
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={`max-w-[78%] px-3.5 py-2 text-xs leading-relaxed ${
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
          <div className="flex items-end gap-2.5 justify-start">
            <div className="relative flex-shrink-0 mb-0.5">
              <PugCharacter state="thinking" size={32} />
              <div className="absolute -top-1 -left-1 w-3.5 h-3.5 rounded-full bg-purple-600 flex items-center justify-center shadow-sm">
                <MessageSquare size={8} className="text-white" />
              </div>
            </div>
            <div className="bg-neutral-900/90 border border-neutral-800/80 rounded-2xl rounded-tl-sm px-3.5 py-2 text-xs text-neutral-400 flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Pill Bar matching Coucou ("Continue..." + Circular arrow button) */}
      <form onSubmit={handleSubmit} className="pt-1">
        <div className="flex items-center gap-2 bg-[#1b1b22] border border-neutral-800 rounded-full px-3.5 py-1.5 shadow-inner focus-within:border-neutral-600 transition-colors">
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
