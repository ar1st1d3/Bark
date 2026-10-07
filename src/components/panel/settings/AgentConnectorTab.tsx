import React, { useState } from "react";
import { useAgentStore } from "../../../store/useAgentStore";
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  ExternalLink,
  Cpu,
  Terminal,
  Radio,
  Server,
  Key,
  RefreshCw,
  Zap,
} from "lucide-react";
import {
  TestResult,
  fetchAvailableGeminiModels,
} from "../../../services/aiConnector";

export const AgentConnectorTab: React.FC = () => {
  const {
    settings,
    updateAntigravityConfig,
    updateHermesConfig,
    testConnection,
  } = useAgentStore();

  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showHermesKey, setShowHermesKey] = useState(false);

  const [testingAg, setTestingAg] = useState(false);
  const [agResult, setAgResult] = useState<TestResult | null>(null);

  const [detectingModels, setDetectingModels] = useState(false);
  const [detectMsg, setDetectMsg] = useState<{ success: boolean; text: string } | null>(null);

  const [testingHermes, setTestingHermes] = useState(false);
  const [hermesResult, setHermesResult] = useState<TestResult | null>(null);

  const handleDetectModels = async () => {
    if (!settings.antigravity.apiKey.trim()) {
      setDetectMsg({
        success: false,
        text: "Saisissez votre clé API Google Gemini d'abord.",
      });
      return;
    }
    setDetectingModels(true);
    setDetectMsg(null);
    try {
      const models = await fetchAvailableGeminiModels(settings.antigravity.apiKey);
      updateAntigravityConfig({ detectedModels: models });
      if (models.length > 0) {
        setDetectMsg({
          success: true,
          text: `${models.length} modèles détectés et synchronisés !`,
        });
      } else {
        setDetectMsg({
          success: false,
          text: "Aucun modèle avec generateContent trouvé.",
        });
      }
    } catch (e: any) {
      setDetectMsg({
        success: false,
        text: e.message || "Erreur de détection",
      });
    } finally {
      setDetectingModels(false);
    }
  };

  const handleTestAntigravity = async () => {
    setTestingAg(true);
    setAgResult(null);
    try {
      const res = await testConnection("antigravity");
      setAgResult(res);
    } catch (e: any) {
      setAgResult({ success: false, message: e.message || String(e) });
    } finally {
      setTestingAg(false);
    }
  };

  const handleTestHermes = async () => {
    setTestingHermes(true);
    setHermesResult(null);
    try {
      const res = await testConnection("hermes");
      setHermesResult(res);
    } catch (e: any) {
      setHermesResult({ success: false, message: e.message || String(e) });
    } finally {
      setTestingHermes(false);
    }
  };

  const knownAgModels = [
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-3.8-flash",
    "gemini-3.8-pro",
    "gemini-3-flash",
    "gemini-3-pro",
    "gemini-2.0-flash",
    ...(settings.antigravity.detectedModels?.map((m) => m.id) || []),
  ];

  return (
    <div className="grid grid-cols-2 gap-3 h-[375px] overflow-y-auto pr-1 select-none">
      {/* --- Antigravity Card --- */}
      <div className="flex flex-col justify-between bg-[#111116] border border-[#22222a] rounded-xl p-3.5 text-white shadow-sm">
        <div className="space-y-2.5">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-800/60 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-blue-600 flex items-center justify-center font-bold text-[10px]">
                AG
              </div>
              <div>
                <div className="text-xs font-bold leading-tight">Google Antigravity</div>
                <div className="text-[10px] text-neutral-400">Google DeepMind • Gemini</div>
              </div>
            </div>

            {/* Mode Indicator */}
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-950/80 border border-blue-500/40 text-blue-300 font-mono">
              {settings.antigravity.mode === "gemini_api"
                ? "API Directe"
                : settings.antigravity.mode === "cli_pty"
                ? "CLI (agy)"
                : "Socket Hook"}
            </span>
          </div>

          {/* Mode Selector Tabs */}
          <div className="grid grid-cols-3 gap-1 p-0.5 bg-neutral-900/80 rounded-lg border border-neutral-800 text-[10px]">
            <button
              onClick={() => updateAntigravityConfig({ mode: "gemini_api" })}
              className={`py-1.5 rounded font-medium flex items-center justify-center gap-1 transition-colors ${
                settings.antigravity.mode === "gemini_api"
                  ? "bg-blue-600 text-white font-semibold"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Cpu size={10} />
              <span>Gemini API</span>
            </button>
            <button
              onClick={() => updateAntigravityConfig({ mode: "cli_pty" })}
              className={`py-1.5 rounded font-medium flex items-center justify-center gap-1 transition-colors ${
                settings.antigravity.mode === "cli_pty"
                  ? "bg-blue-600 text-white font-semibold"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Terminal size={10} />
              <span>CLI agy</span>
            </button>
            <button
              onClick={() => updateAntigravityConfig({ mode: "socket_hook" })}
              className={`py-1.5 rounded font-medium flex items-center justify-center gap-1 transition-colors ${
                settings.antigravity.mode === "socket_hook"
                  ? "bg-blue-600 text-white font-semibold"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Radio size={10} />
              <span>Hook IPC</span>
            </button>
          </div>

          {/* Specific Inputs based on Mode */}
          {settings.antigravity.mode === "gemini_api" && (
            <div className="space-y-2 pt-0.5">
              <div>
                <div className="flex items-center justify-between text-[10px] text-neutral-400 mb-0.5">
                  <span className="flex items-center gap-1">
                    <Key size={10} /> Clé API Google Gemini
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDetectModels}
                      disabled={detectingModels || !settings.antigravity.apiKey.trim()}
                      className="text-blue-400 hover:text-blue-300 disabled:opacity-40 flex items-center gap-1 text-[9px] font-medium"
                      title="Interroger Google API pour lister les modèles autorisés"
                    >
                      <RefreshCw size={9} className={detectingModels ? "animate-spin" : ""} />
                      <span>{detectingModels ? "Détection..." : "Détecter modèles"}</span>
                    </button>
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noreferrer"
                      className="text-neutral-400 hover:text-neutral-200 flex items-center gap-0.5 text-[9px]"
                    >
                      Clé <ExternalLink size={8} />
                    </a>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type={showGeminiKey ? "text" : "password"}
                    value={settings.antigravity.apiKey}
                    onChange={(e) =>
                      updateAntigravityConfig({ apiKey: e.target.value })
                    }
                    placeholder="AIzaSy..."
                    className="w-full bg-black/70 border border-neutral-800 rounded px-2.5 py-1 text-xs font-mono text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-blue-500 pr-7"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGeminiKey(!showGeminiKey)}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                  >
                    {showGeminiKey ? <EyeOff size={12} /> : <Eye size={12} />}
                  </button>
                </div>

                {detectMsg && (
                  <div
                    className={`text-[9px] mt-1 flex items-center gap-1 ${
                      detectMsg.success ? "text-emerald-400" : "text-amber-400"
                    }`}
                  >
                    {detectMsg.success ? <CheckCircle size={10} /> : <AlertCircle size={10} />}
                    <span>{detectMsg.text}</span>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between text-[10px] text-neutral-400 mb-0.5">
                  <span>Modèle Gemini (Google Antigravity)</span>
                </div>
                <select
                  value={knownAgModels.includes(settings.antigravity.model) ? settings.antigravity.model : "custom"}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val !== "custom") {
                      updateAntigravityConfig({ model: val });
                    }
                  }}
                  className="w-full bg-black/70 border border-neutral-800 rounded px-2 py-1 text-xs text-neutral-200 focus:outline-none focus:border-blue-500"
                >
                  <optgroup label="⚡ Modèles stables & recommandés (Aucune surcharge)">
                    <option value="gemini-2.5-flash">
                      ⚡ Gemini 2.5 Flash (Recommandé • Ultra-rapide & Stable)
                    </option>
                    <option value="gemini-2.5-pro">
                      🧠 Gemini 2.5 Pro (Raisonnement profond & Code)
                    </option>
                    <option value="gemini-1.5-flash">
                      🚀 Gemini 1.5 Flash (Quota gratuit élevé)
                    </option>
                    <option value="gemini-1.5-pro">
                      📚 Gemini 1.5 Pro (Grand contexte 2M)
                    </option>
                  </optgroup>

                  <optgroup label="✨ Modèles Antigravity (Sujets à forte demande Google)">
                    <option value="gemini-3.8-flash">
                      ✨ Gemini 3.8 Flash (Antigravity • Forte demande possible)
                    </option>
                    <option value="gemini-3.8-pro">
                      🔬 Gemini 3.8 Pro (Aperçu)
                    </option>
                    <option value="gemini-3-flash">
                      ⚡ Gemini 3 Flash
                    </option>
                    <option value="gemini-3-pro">
                      🎯 Gemini 3 Pro
                    </option>
                    <option value="gemini-2.0-flash">
                      Gemini 2.0 Flash
                    </option>
                  </optgroup>

                  {settings.antigravity.detectedModels && settings.antigravity.detectedModels.length > 0 && (
                    <optgroup label="🔍 Modèles détectés pour votre compte">
                      {settings.antigravity.detectedModels.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.displayName}
                        </option>
                      ))}
                    </optgroup>
                  )}

                  <option value="custom">
                    ✏️ Autre identifiant de modèle personnalisé...
                  </option>
                </select>

                {/* Custom Model Input if chosen */}
                {!knownAgModels.includes(settings.antigravity.model) && (
                  <div className="mt-1">
                    <input
                      type="text"
                      value={settings.antigravity.model}
                      onChange={(e) =>
                        updateAntigravityConfig({ model: e.target.value })
                      }
                      placeholder="Nom exact du modèle (ex: gemini-2.5-flash-lite)"
                      className="w-full bg-black/70 border border-blue-500/60 rounded px-2 py-0.5 text-xs font-mono text-blue-200 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Repli automatique Toggle */}
              <div className="flex items-start justify-between gap-2 p-1.5 rounded-lg bg-neutral-900/60 border border-neutral-800/80">
                <div className="flex items-start gap-1.5">
                  <Zap size={11} className="text-amber-400 mt-0.5 flex-shrink-0" />
                  <div className="text-[10px] leading-tight">
                    <span className="font-semibold text-neutral-200">
                      Repli automatique anti-surcharge
                    </span>
                    <p className="text-[9px] text-neutral-400 mt-0.5 leading-snug">
                      Si Google renvoie une erreur « 503 High Demand » sur votre modèle, Bark bascule automatiquement sur Gemini 2.5 Flash pour assurer la continuité.
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.antigravity.autoFallback !== false}
                  onChange={(e) =>
                    updateAntigravityConfig({ autoFallback: e.target.checked })
                  }
                  className="mt-0.5 h-3.5 w-3.5 rounded border-neutral-700 text-blue-600 focus:ring-0 cursor-pointer accent-blue-600"
                />
              </div>
            </div>
          )}

          {settings.antigravity.mode === "cli_pty" && (
            <div className="pt-0.5 space-y-2">
              <div>
                <label className="block text-[10px] text-neutral-400 mb-0.5">
                  Commande / Binaire Antigravity CLI
                </label>
                <input
                  type="text"
                  value={settings.antigravity.cliPath}
                  onChange={(e) =>
                    updateAntigravityConfig({ cliPath: e.target.value })
                  }
                  placeholder="agy"
                  className="w-full bg-black/70 border border-neutral-800 rounded px-2 py-1 text-xs font-mono text-neutral-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Notice & Install instructions */}
              <div className="p-2 rounded-lg bg-neutral-900/80 border border-neutral-800 text-[10px] space-y-1.5">
                <div className="flex items-center gap-1.5 text-blue-400 font-semibold">
                  <Terminal size={12} />
                  <span>Installation du CLI officiel (agy)</span>
                </div>
                <p className="text-[9px] text-neutral-400 leading-snug">
                  Le binaire officiel <code className="text-amber-300 font-mono">agy</code> doit être installé sur votre système. Pour l'installer dans votre terminal :
                </p>
                <div className="flex items-center justify-between bg-black/80 p-1.5 rounded border border-neutral-800 font-mono text-[9px] text-neutral-300">
                  <span className="truncate select-all">curl -fsSL https://antigravity.google/cli/install.sh | bash</span>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText("curl -fsSL https://antigravity.google/cli/install.sh | bash")}
                    className="ml-2 text-blue-400 hover:text-blue-300 text-[8px] uppercase tracking-wider font-sans font-bold flex-shrink-0"
                  >
                    Copier
                  </button>
                </div>
                <p className="text-[8.5px] text-neutral-500">
                  💡 Lancez ensuite <code className="text-neutral-400 font-mono">agy</code> dans un terminal pour vous authentifier avec Google.
                </p>
              </div>
            </div>
          )}

          {settings.antigravity.mode === "socket_hook" && (
            <div className="pt-1 text-[10px] text-neutral-400 space-y-1 bg-black/40 p-2 rounded border border-neutral-800/80">
              <p className="text-neutral-300 font-medium">Écoute passive sur le socket Unix</p>
              <p className="text-[9px] text-neutral-500 leading-relaxed">
                Les requêtes d'approbation et diffs générés par vos sessions Antigravity sont transmis en direct à Bark via <code className="text-amber-300">bark.sock</code>.
              </p>
            </div>
          )}
        </div>

        {/* Test Footer */}
        <div className="pt-2 border-t border-neutral-800/50 mt-2 flex items-center justify-between">
          <button
            onClick={handleTestAntigravity}
            disabled={testingAg}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-[10px] font-semibold transition-colors disabled:opacity-50 border border-blue-500/30"
          >
            {testingAg ? (
              <Loader2 size={11} className="animate-spin" />
            ) : (
              <Cpu size={11} />
            )}
            <span>Tester la connexion</span>
          </button>

          {agResult && (
            <div
              className={`flex items-center gap-1 text-[10px] truncate max-w-[170px] ${
                agResult.success ? "text-emerald-400" : "text-red-400"
              }`}
              title={agResult.message}
            >
              {agResult.success ? (
                <CheckCircle size={11} className="flex-shrink-0" />
              ) : (
                <AlertCircle size={11} className="flex-shrink-0" />
              )}
              <span className="truncate">{agResult.message}</span>
            </div>
          )}
        </div>
      </div>

      {/* --- Hermes Agent Card --- */}
      <div className="flex flex-col justify-between bg-[#111116] border border-[#22222a] rounded-xl p-3.5 text-white shadow-sm">
        <div className="space-y-2.5">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-800/60 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-amber-500 text-black flex items-center justify-center font-bold text-[10px]">
                H3
              </div>
              <div>
                <div className="text-xs font-bold leading-tight">Hermes Agent</div>
                <div className="text-[10px] text-neutral-400">Nous Research • Hermes 3</div>
              </div>
            </div>

            {/* Mode Indicator */}
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-500/40 text-amber-300 font-mono">
              {settings.hermes.mode === "openrouter_api"
                ? "OpenRouter"
                : settings.hermes.mode === "local_ollama"
                ? "Ollama Local"
                : "CLI (hermes)"}
            </span>
          </div>

          {/* Mode Selector Tabs */}
          <div className="grid grid-cols-3 gap-1 p-0.5 bg-neutral-900/80 rounded-lg border border-neutral-800 text-[10px]">
            <button
              onClick={() => updateHermesConfig({ mode: "openrouter_api" })}
              className={`py-1.5 rounded font-medium flex items-center justify-center gap-1 transition-colors ${
                settings.hermes.mode === "openrouter_api"
                  ? "bg-amber-500 text-black font-semibold"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Server size={10} />
              <span>OpenRouter</span>
            </button>
            <button
              onClick={() => updateHermesConfig({ mode: "local_ollama" })}
              className={`py-1.5 rounded font-medium flex items-center justify-center gap-1 transition-colors ${
                settings.hermes.mode === "local_ollama"
                  ? "bg-amber-500 text-black font-semibold"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Cpu size={10} />
              <span>Ollama</span>
            </button>
            <button
              onClick={() => updateHermesConfig({ mode: "cli_pty" })}
              className={`py-1.5 rounded font-medium flex items-center justify-center gap-1 transition-colors ${
                settings.hermes.mode === "cli_pty"
                  ? "bg-amber-500 text-black font-semibold"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Terminal size={10} />
              <span>CLI</span>
            </button>
          </div>

          {/* Specific Inputs based on Mode */}
          {settings.hermes.mode === "openrouter_api" && (
            <div className="space-y-2 pt-1">
              <div>
                <div className="flex items-center justify-between text-[10px] text-neutral-400 mb-0.5">
                  <span className="flex items-center gap-1">
                    <Key size={10} /> Clé API OpenRouter
                  </span>
                  <a
                    href="https://openrouter.ai/keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-400 hover:underline flex items-center gap-0.5 text-[9px]"
                  >
                    Obtenir une clé <ExternalLink size={8} />
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={showHermesKey ? "text" : "password"}
                    value={settings.hermes.apiKey}
                    onChange={(e) =>
                      updateHermesConfig({ apiKey: e.target.value })
                    }
                    placeholder="sk-or-v1-..."
                    className="w-full bg-black/70 border border-neutral-800 rounded px-2.5 py-1.5 text-xs font-mono text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500 pr-7"
                  />
                  <button
                    type="button"
                    onClick={() => setShowHermesKey(!showHermesKey)}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                  >
                    {showHermesKey ? <EyeOff size={12} /> : <Eye size={12} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-neutral-400 mb-0.5">
                  Modèle Nous Hermes
                </label>
                <select
                  value={
                    [
                      "nousresearch/hermes-3-llama-3.1-70b",
                      "nousresearch/hermes-3-llama-3.1-405b",
                      "nousresearch/hermes-2-pro-llama-3-8b",
                    ].includes(settings.hermes.model)
                      ? settings.hermes.model
                      : "custom"
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val !== "custom") {
                      updateHermesConfig({ model: val });
                    }
                  }}
                  className="w-full bg-black/70 border border-neutral-800 rounded px-2.5 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="nousresearch/hermes-3-llama-3.1-70b">
                    Hermes 3 (Llama 3.1 70B) - Recommandé
                  </option>
                  <option value="nousresearch/hermes-3-llama-3.1-405b">
                    Hermes 3 (Llama 3.1 405B) - Puissance max
                  </option>
                  <option value="nousresearch/hermes-2-pro-llama-3-8b">
                    Hermes 2 Pro (Llama 3 8B) - Économique
                  </option>
                  <option value="custom">
                    ✏️ Autre modèle OpenRouter personnalisé...
                  </option>
                </select>

                {!([
                  "nousresearch/hermes-3-llama-3.1-70b",
                  "nousresearch/hermes-3-llama-3.1-405b",
                  "nousresearch/hermes-2-pro-llama-3-8b",
                ].includes(settings.hermes.model)) && (
                  <div className="mt-1.5">
                    <input
                      type="text"
                      value={settings.hermes.model}
                      onChange={(e) =>
                        updateHermesConfig({ model: e.target.value })
                      }
                      placeholder="ex: nousresearch/deephermes-3-llama-3-8b-preview"
                      className="w-full bg-black/70 border border-amber-500/60 rounded px-2.5 py-1 text-xs font-mono text-amber-200 focus:outline-none"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {settings.hermes.mode === "local_ollama" && (
            <div className="space-y-1.5 pt-1">
              <div>
                <label className="block text-[10px] text-neutral-400 mb-0.5">
                  Endpoint Ollama
                </label>
                <input
                  type="text"
                  value={settings.hermes.endpoint}
                  onChange={(e) =>
                    updateHermesConfig({ endpoint: e.target.value })
                  }
                  placeholder="http://localhost:11434"
                  className="w-full bg-black/70 border border-neutral-800 rounded px-2 py-1 text-xs font-mono text-neutral-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[10px] text-neutral-400 mb-0.5">
                  Nom du modèle Ollama
                </label>
                <input
                  type="text"
                  value={settings.hermes.model}
                  onChange={(e) =>
                    updateHermesConfig({ model: e.target.value })
                  }
                  placeholder="hermes3:8b"
                  className="w-full bg-black/70 border border-neutral-800 rounded px-2 py-1 text-xs font-mono text-neutral-200 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}

          {settings.hermes.mode === "cli_pty" && (
            <div className="pt-1">
              <label className="block text-[10px] text-neutral-400 mb-0.5">
                Commande / Script Hermes CLI
              </label>
              <input
                type="text"
                value={settings.hermes.cliPath}
                onChange={(e) =>
                  updateHermesConfig({ cliPath: e.target.value })
                }
                placeholder="hermes"
                className="w-full bg-black/70 border border-neutral-800 rounded px-2 py-1 text-xs font-mono text-neutral-200 focus:outline-none focus:border-amber-500"
              />
              <p className="text-[9px] text-neutral-500 mt-1">
                Lancement automatique du CLI Hermes dans le terminal virtuel.
              </p>
            </div>
          )}
        </div>

        {/* Test Footer */}
        <div className="pt-2 border-t border-neutral-800/50 mt-2 flex items-center justify-between">
          <button
            onClick={handleTestHermes}
            disabled={testingHermes}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-semibold transition-colors disabled:opacity-50 border border-amber-500/30"
          >
            {testingHermes ? (
              <Loader2 size={11} className="animate-spin" />
            ) : (
              <Server size={11} />
            )}
            <span>Tester la connexion</span>
          </button>

          {hermesResult && (
            <div
              className={`flex items-center gap-1 text-[10px] truncate max-w-[170px] ${
                hermesResult.success ? "text-emerald-400" : "text-red-400"
              }`}
              title={hermesResult.message}
            >
              {hermesResult.success ? (
                <CheckCircle size={11} className="flex-shrink-0" />
              ) : (
                <AlertCircle size={11} className="flex-shrink-0" />
              )}
              <span className="truncate">{hermesResult.message}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
