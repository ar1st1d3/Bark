import React from "react";
import { useAgentStore } from "../../store/useAgentStore";
import { Home, MessageSquare, Plus, Settings, Volume2, VolumeX } from "lucide-react";

export const NotchHeader: React.FC = () => {
  const { activeNav, setActiveNav, isMuted, toggleMute, socketConnected } =
    useAgentStore();

  return (
    <div className="flex items-center justify-between px-3 pt-2 pb-1 bg-black border-b border-neutral-900 select-none">
      {/* Left Navigation Pills */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setActiveNav("home")}
          className={`flex items-center justify-center w-7 h-7 rounded-full transition-colors ${
            activeNav === "home"
              ? "bg-neutral-800 text-white shadow-sm"
              : "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900"
          }`}
          title="Accueil & Vue d'ensemble"
        >
          <Home size={14} />
        </button>

        <button
          onClick={() => setActiveNav("chat")}
          className={`flex items-center justify-center w-7 h-7 rounded-full transition-colors ${
            activeNav === "chat"
              ? "bg-neutral-800 text-white shadow-sm"
              : "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900"
          }`}
          title="Console & Chat d'agent"
        >
          <MessageSquare size={14} />
        </button>

        <button
          onClick={() => setActiveNav("add")}
          className={`flex items-center justify-center w-7 h-7 rounded-full transition-colors ${
            activeNav === "add"
              ? "bg-neutral-800 text-white shadow-sm"
              : "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900"
          }`}
          title="Ajouter un modèle / agent personnalisé"
        >
          <Plus size={15} />
        </button>
      </div>

      {/* Center Hardware Notch Sensor Dot */}
      <div className="flex items-center justify-center">
        <div
          className={`w-2.5 h-2.5 rounded-full transition-colors ${
            socketConnected
              ? "bg-neutral-800 border border-neutral-700/60"
              : "bg-red-500 animate-pulse"
          }`}
          title={socketConnected ? "Bark Socket Connecté" : "Socket déconnecté"}
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveNav("settings")}
          className={`flex items-center justify-center w-7 h-7 rounded-full transition-colors ${
            activeNav === "settings"
              ? "bg-neutral-800 text-white"
              : "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900"
          }`}
          title="Paramètres & Gestion des modèles"
        >
          <Settings size={14} />
        </button>

        <button
          onClick={toggleMute}
          className="flex items-center justify-center w-7 h-7 rounded-full text-neutral-500 hover:text-white hover:bg-neutral-900 transition-colors"
          title={isMuted ? "Activer le son du carlin" : "Couper le son"}
        >
          {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </button>
      </div>
    </div>
  );
};
