import { AntigravityConfig, HermesConfig, ChatMessage } from "../types/agent";

export interface TestResult {
  success: boolean;
  message: string;
  latencyMs?: number;
}

/**
 * Test connectivity for Antigravity configuration
 */
export async function testAntigravityConnection(
  config: AntigravityConfig
): Promise<TestResult> {
  const start = Date.now();

  if (config.mode === "gemini_api") {
    if (!config.apiKey.trim()) {
      return {
        success: false,
        message: "Clé API Gemini manquante. Veuillez saisir une clé valide.",
      };
    }

    try {
      const rawModel = config.model || "gemini-2.5-flash";
      const model = rawModel.replace(/^models\//, "");
      const key = config.apiKey.trim();
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}?key=${encodeURIComponent(
        key
      )}`;
      const res = await fetch(url, {
        headers: {
          "x-goog-api-key": key,
        },
      });
      const latency = Date.now() - start;

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const rawMsg = errorData?.error?.message || `Erreur HTTP ${res.status}`;
        
        if (res.status === 404 || rawMsg.toLowerCase().includes("not found")) {
          return {
            success: false,
            message: `Modèle « ${model} » non supporté par l'API pour cette clé (404). Utilisez « Détecter les modèles » ou choisissez gemini-2.5-flash.`,
          };
        }
        
        return {
          success: false,
          message: rawMsg,
        };
      }

      return {
        success: true,
        message: `Connecté à Google Gemini (${model}) avec succès !`,
        latencyMs: latency,
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Échec de connexion : ${err.message || String(err)}`,
      };
    }
  }

  if (config.mode === "cli_pty") {
    const cmd = config.cliPath || "agy";
    let isAvailable = false;
    let resolved = cmd;
    if (typeof window !== "undefined" && (window as any).__TAURI_INTERNALS__) {
      try {
        const { invoke } = await import("@tauri-apps/api/core");
        isAvailable = await invoke<boolean>("check_cli_command", { command: cmd });
        if (isAvailable) {
          resolved = await invoke<string>("resolve_cli_command", { command: cmd });
        }
      } catch {
        isAvailable = false;
      }
    }

    if (!isAvailable) {
      return {
        success: false,
        message: `La commande « ${cmd} » est introuvable. Si elle est installée dans ~/.local/bin, indiquez son chemin complet.`,
      };
    }

    return {
      success: true,
      message: `CLI « ${cmd} » détecté (${resolved}) et prêt pour le PTY !`,
      latencyMs: Date.now() - start,
    };
  }

  // Socket hook mode
  return {
    success: true,
    message: "Prêt à recevoir les hooks Antigravity sur le socket Unix.",
    latencyMs: 1,
  };
}

/**
 * Test connectivity for Hermes Agent configuration
 */
export async function testHermesConnection(
  config: HermesConfig
): Promise<TestResult> {
  const start = Date.now();

  if (config.mode === "openrouter_api") {
    if (!config.apiKey.trim()) {
      return {
        success: false,
        message: "Clé API OpenRouter manquante. Veuillez saisir une clé valide.",
      };
    }

    try {
      const endpoint =
        config.endpoint?.trim() || "https://openrouter.ai/api/v1/auth/key";
      const testUrl = endpoint.endsWith("/chat/completions")
        ? endpoint.replace("/chat/completions", "/auth/key")
        : endpoint;

      const res = await fetch(testUrl, {
        headers: {
          Authorization: `Bearer ${config.apiKey.trim()}`,
        },
      });
      const latency = Date.now() - start;

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return {
          success: false,
          message:
            err?.error?.message ||
            `Erreur HTTP ${res.status}: Clé OpenRouter invalide ou expirée.`,
        };
      }

      return {
        success: true,
        message: `Connecté à OpenRouter (${config.model || "Hermes 3"}) !`,
        latencyMs: latency,
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Échec de connexion OpenRouter : ${err.message || String(err)}`,
      };
    }
  }

  if (config.mode === "local_ollama") {
    try {
      const base =
        config.endpoint?.trim() || "http://localhost:11434";
      const tagsUrl = base.endsWith("/v1")
        ? base.replace("/v1", "/api/tags")
        : `${base.replace(/\/$/, "")}/api/tags`;

      const res = await fetch(tagsUrl);
      const latency = Date.now() - start;

      if (!res.ok) {
        return {
          success: false,
          message: `Ollama a répondu avec le statut ${res.status}. Le serveur est-il prêt ?`,
        };
      }

      return {
        success: true,
        message: `Serveur Ollama local accessible (${config.model}) !`,
        latencyMs: latency,
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Impossible de contacter Ollama sur ${config.endpoint || "http://localhost:11434"}. Lancez « ollama serve ».`,
      };
    }
  }

  // CLI PTY mode
  const cmd = config.cliPath || "hermes";
  let isAvailable = false;
  if (typeof window !== "undefined" && (window as any).__TAURI_INTERNALS__) {
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      isAvailable = await invoke<boolean>("check_cli_command", { command: cmd });
    } catch {
      isAvailable = false;
    }
  }

  if (!isAvailable) {
    return {
      success: false,
      message: `La commande « ${cmd} » est introuvable sur votre système (PATH).`,
    };
  }

  return {
    success: true,
    message: `Mode CLI Hermes activé : commande « ${cmd} » prête pour le PTY.`,
    latencyMs: Date.now() - start,
  };
}

export interface DiscoveredModel {
  id: string;
  displayName: string;
  description?: string;
}

/**
 * Fetch list of models actually supported and enabled for this API key
 */
export async function fetchAvailableGeminiModels(
  apiKey: string
): Promise<DiscoveredModel[]> {
  if (!apiKey?.trim()) {
    throw new Error("Veuillez d'abord renseigner une clé API Google Gemini.");
  }

  const key = apiKey.trim();
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(
    key
  )}`;

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": key,
    },
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData?.error?.message ||
        `Erreur HTTP ${res.status}: Impossible de récupérer les modèles autorisés.`
    );
  }

  const data = await res.json();
  const rawList: any[] = data.models || [];

  // Keep only models supporting generateContent
  const generateModels = rawList.filter(
    (m) =>
      Array.isArray(m.supportedGenerationMethods) &&
      m.supportedGenerationMethods.includes("generateContent")
  );

  return generateModels.map((m) => {
    const id = (m.name || "").replace(/^models\//, "");
    return {
      id,
      displayName: m.displayName || id,
      description: m.description,
    };
  });
}

interface GeminiContent {
  role: "user" | "model";
  parts: Array<{ text: string }>;
}

/**
 * Format conversation history into compliant Google Gemini contents payload.
 * Complies with Google AI Studio rules:
 * - First turn must have role 'user'
 * - Turns must alternate between 'user' and 'model'
 * - Consecutive turns from the same role are merged
 */
export function formatGeminiContents(
  prompt: string,
  history?: ChatMessage[]
): GeminiContent[] {
  const contents: GeminiContent[] = [];

  if (history && history.length > 0) {
    // Filter out error bubbles and system alerts from previous turns
    const cleanHistory = history.filter(
      (m) => !m.id?.startsWith("err-") && !m.text?.startsWith("⚠️")
    );

    // Find the first user message: Gemini requires multi-turn talk to begin with 'user'
    const firstUserIndex = cleanHistory.findIndex((m) => m.sender === "user");
    const validHistory = firstUserIndex >= 0 ? cleanHistory.slice(firstUserIndex) : [];

    for (const msg of validHistory) {
      if (!msg.text || !msg.text.trim()) continue;
      const role: "user" | "model" = msg.sender === "user" ? "user" : "model";
      const last = contents[contents.length - 1];
      if (last && last.role === role) {
        last.parts[0].text += `\n\n${msg.text.trim()}`;
      } else {
        contents.push({
          role,
          parts: [{ text: msg.text.trim() }],
        });
      }
    }
  }

  // Ensure the latest prompt is included as the last user turn if not already present
  const trimmedPrompt = prompt.trim();
  if (trimmedPrompt) {
    const last = contents[contents.length - 1];
    if (last && last.role === "user" && last.parts[0].text === trimmedPrompt) {
      // Already present as the final turn
    } else if (last && last.role === "user") {
      last.parts[0].text += `\n\n${trimmedPrompt}`;
    } else {
      contents.push({
        role: "user",
        parts: [{ text: trimmedPrompt }],
      });
    }
  }

  if (contents.length === 0) {
    contents.push({
      role: "user",
      parts: [{ text: prompt || "Bonjour" }],
    });
  }

  return contents;
}

/**
 * Extract clean answer from Google Gemini response, filtering out internal thinking parts
 */
function extractGeminiResponseText(data: any): string {
  if (data.promptFeedback?.blockReason) {
    throw new Error(
      `Votre message a été filtré par Google AI Studio (motif: ${data.promptFeedback.blockReason}).`
    );
  }

  const candidate = data.candidates?.[0];
  if (!candidate) {
    return "Aucune réponse générée par Google Gemini.";
  }

  if (candidate.finishReason === "SAFETY") {
    throw new Error(
      "La réponse a été bloquée par les filtres de sécurité Google Gemini (SAFETY)."
    );
  }
  if (candidate.finishReason === "RECITATION") {
    throw new Error(
      "La réponse a été bloquée par la vérification des citations Google Gemini (RECITATION)."
    );
  }

  const parts: any[] = candidate.content?.parts || [];
  // Exclude thoughts/reasoning parts to only extract final text
  const cleanTextParts = parts.filter(
    (p) => !p.thought && typeof p.text === "string" && p.text.trim().length > 0
  );

  if (cleanTextParts.length > 0) {
    return cleanTextParts.map((p) => p.text).join("").trim();
  }

  // Fallback to all parts with text if only thought parts were present
  const anyTextParts = parts.filter(
    (p) => typeof p.text === "string" && p.text.trim().length > 0
  );
  if (anyTextParts.length > 0) {
    return anyTextParts.map((p) => p.text).join("").trim();
  }

  return "Aucune réponse textuelle reçue de Gemini.";
}

/**
 * Execute query via Google Gemini API with multi-turn conversation and smart fallback
 */
export async function callGeminiApi(
  prompt: string,
  config: AntigravityConfig,
  history?: ChatMessage[]
): Promise<string> {
  const primaryModel = (config.model || "gemini-3.8-flash").replace(/^models\//, "");
  const shouldFallback = config.autoFallback !== false;

  // Build fallback candidate models: prioritize detected models that exist for this key
  const detectedModelIds = (config.detectedModels || []).map((m) => m.id.replace(/^models\//, ""));
  const fallbackModel = (config.fallbackModel || "gemini-1.5-flash").replace(/^models\//, "");

  const candidateModels = shouldFallback
    ? [
        primaryModel,
        fallbackModel,
        ...detectedModelIds,
        "gemini-2.0-flash",
        "gemini-1.5-flash",
      ].filter((m, idx, self) => Boolean(m) && self.indexOf(m) === idx)
    : [primaryModel];

  const contents = formatGeminiContents(prompt, history);
  const key = config.apiKey.trim();

  const buildRequestBody = (contentsPayload: any[]) => ({
    systemInstruction: {
      parts: [
        {
          text: "Tu es le compagnon de développement Bark, propulsé par Google Gemini. Tu assistes le développeur avec son code, son architecture, ses tests et ses commandes système de façon concise, précise et directe.",
        },
      ],
    },
    contents: contentsPayload,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 8192,
    },
  });

  let primaryErrorMsg: string | null = null;
  let lastError: any = null;

  for (let i = 0; i < candidateModels.length; i++) {
    const currentModel = candidateModels[i];
    const isPrimary = i === 0;

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${encodeURIComponent(
        key
      )}`;

      let res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": key,
        },
        body: JSON.stringify(buildRequestBody(contents)),
      });

      // If multi-turn resulted in 400 (e.g. model rejected turn format or missing thought signature),
      // seamlessly retry with single-turn to preserve interaction continuity without crashing
      if (!res.ok && res.status === 400 && contents.length > 1) {
        console.warn(
          `[Bark Gemini Connector] Le modèle « ${currentModel} » a renvoyé 400 sur l'historique multi-tours. Nouvel essai en tour direct...`
        );
        const singleTurnContents = [{ role: "user", parts: [{ text: prompt.trim() }] }];
        const retryRes = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": key,
          },
          body: JSON.stringify(buildRequestBody(singleTurnContents)),
        });
        if (retryRes.ok) {
          res = retryRes;
        }
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const rawMsg = errData?.error?.message || `Erreur API Gemini (${res.status})`;
        const lower = rawMsg.toLowerCase();

        if (isPrimary) {
          primaryErrorMsg = rawMsg;
        }

        // Only genuine server overload or quota saturation triggers fallback to another model
        const isSaturated =
          res.status === 503 ||
          res.status === 429 ||
          lower.includes("high demand") ||
          lower.includes("overloaded") ||
          lower.includes("spikes in demand") ||
          lower.includes("resource_exhausted") ||
          lower.includes("quota exceeded");

        if (isSaturated && shouldFallback && i < candidateModels.length - 1) {
          console.warn(
            `[Bark Gemini Connector] Le modèle « ${currentModel} » est saturé (${rawMsg}). Bascule automatique sur « ${candidateModels[i + 1]} »...`
          );
          lastError = new Error(rawMsg);
          continue; // Try next fallback candidate
        }

        // Specific non-retriable errors
        if (res.status === 404 || lower.includes("not found")) {
          throw new Error(
            `Le modèle « ${currentModel} » n'est pas accessible avec cette clé API (404). Utilisez « Détecter les modèles » dans les Paramètres ⚙️ pour choisir un modèle actif.`
          );
        }
        if (res.status === 400) {
          throw new Error(`Requête Gemini invalide sur « ${currentModel} » (400): ${rawMsg}`);
        }
        if (res.status === 403) {
          throw new Error(
            `Clé API non autorisée ou restreinte (403). Vérifiez votre clé sur Google AI Studio (aistudio.google.com).`
          );
        }

        if (isSaturated) {
          throw new Error(
            `Le modèle « ${primaryModel} » subit une forte demande ou un quota temporairement atteint (${rawMsg}). Réessayez dans quelques instants ou sélectionnez un autre modèle dans les Paramètres ⚙️.`
          );
        }

        throw new Error(rawMsg);
      }

      const data = await res.json();
      const text = extractGeminiResponseText(data);

      if (i > 0) {
        return `> ⚡ **Note de continuité Bark** : Le modèle initial (\`${primaryModel}\`) est actuellement saturé sur les serveurs Google (${primaryErrorMsg || "503/429"}). Bark a généré votre réponse avec \`${currentModel}\`.\n\n${text}`;
      }

      return text;
    } catch (err: any) {
      lastError = err;
      // Do NOT swallow errors if it was not an overload
      if (
        shouldFallback &&
        i < candidateModels.length - 1 &&
        (err.message.includes("503") ||
          err.message.includes("429") ||
          err.message.toLowerCase().includes("saturé") ||
          err.message.toLowerCase().includes("demande") ||
          err.message.toLowerCase().includes("quota"))
      ) {
        continue;
      }
      throw err;
    }
  }

  throw (
    lastError ||
    new Error(
      primaryErrorMsg
        ? `Échec avec Google Gemini sur « ${primaryModel} » : ${primaryErrorMsg}`
        : "Échec de communication avec Google Gemini."
    )
  );
}

/**
 * Execute query via OpenRouter or Ollama (OpenAI compatible) with conversation history
 */
export async function callHermesApi(
  prompt: string,
  config: HermesConfig,
  history?: ChatMessage[]
): Promise<string> {
  let endpoint = config.endpoint?.trim();
  if (!endpoint) {
    endpoint =
      config.mode === "local_ollama"
        ? "http://localhost:11434/v1/chat/completions"
        : "https://openrouter.ai/api/v1/chat/completions";
  }
  if (!endpoint.endsWith("/chat/completions")) {
    endpoint = `${endpoint.replace(/\/$/, "")}/chat/completions`;
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (config.apiKey?.trim()) {
    headers["Authorization"] = `Bearer ${config.apiKey.trim()}`;
  }

  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    {
      role: "system",
      content:
        "Tu es Hermes Agent, l'assistant autonome de Nous Research. Réponds avec pertinence, concision et professionnalisme.",
    },
  ];

  if (history && history.length > 0) {
    for (const msg of history) {
      if (!msg.text || !msg.text.trim()) continue;
      messages.push({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text.trim(),
      });
    }
  }

  const trimmed = prompt.trim();
  const last = messages[messages.length - 1];
  if (trimmed && !(last && last.role === "user" && last.content === trimmed)) {
    messages.push({
      role: "user",
      content: trimmed,
    });
  }

  const body = {
    model: config.model || "nousresearch/hermes-3-llama-3.1-70b",
    messages,
    temperature: 0.7,
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      err?.error?.message || `Erreur API Hermes (${res.status})`
    );
  }

  const data = await res.json();
  const text =
    data.choices?.[0]?.message?.content ||
    "Aucune réponse textuelle reçue d'Hermes.";
  return text;
}

/**
 * Generate .agents/hooks.json content for Antigravity
 */
export function getAntigravityHooksConfigJson(socketPath: string): string {
  return JSON.stringify(
    {
      "bark-companion-bridge": {
        enabled: true,
        PreToolUse: [
          {
            matcher: "*",
            hooks: [
              {
                type: "command",
                command: `python3 -c "import socket, json, sys; s = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM); s.connect('${socketPath}'); s.sendall(json.dumps({'type':'pre_tool_use','tool':sys.argv[1] if len(sys.argv)>1 else 'tool'}).encode('utf-8')+b'\\n')"`,
                timeout: 5,
              },
            ],
          },
        ],
        Stop: [
          {
            type: "command",
            command: `python3 -c "import socket, json; s = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM); s.connect('${socketPath}'); s.sendall(json.dumps({'type':'agent_status','status':'done'}).encode('utf-8')+b'\\n')"`,
            timeout: 5,
          },
        ],
      },
    },
    null,
    2
  );
}
