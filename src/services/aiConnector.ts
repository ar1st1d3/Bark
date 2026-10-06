import { AntigravityConfig, HermesConfig } from "../types/agent";

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
      const model = config.model || "gemini-2.5-flash";
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}?key=${encodeURIComponent(
        config.apiKey.trim()
      )}`;
      const res = await fetch(url);
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
    return {
      success: true,
      message: `Mode CLI activé : commande « ${config.cliPath || "agy"} » prête pour le PTY.`,
      latencyMs: 1,
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
  return {
    success: true,
    message: `Mode CLI Hermes activé : commande « ${config.cliPath || "hermes"} » prête.`,
    latencyMs: 1,
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

  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(
    apiKey.trim()
  )}`;

  const res = await fetch(url);
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

/**
 * Execute query via Google Gemini API with smart fallback for saturated / unsupported models
 */
export async function callGeminiApi(
  prompt: string,
  config: AntigravityConfig
): Promise<string> {
  const primaryModel = config.model || "gemini-2.5-flash";
  const shouldFallback = config.autoFallback !== false;

  const candidateModels = shouldFallback
    ? [
        primaryModel,
        config.fallbackModel || "gemini-2.5-flash",
        "gemini-1.5-flash",
        "gemini-2.5-pro",
      ].filter((m, idx, self) => Boolean(m) && self.indexOf(m) === idx)
    : [primaryModel];

  let lastError: any = null;

  for (let i = 0; i < candidateModels.length; i++) {
    const currentModel = candidateModels[i];
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${encodeURIComponent(
        config.apiKey.trim()
      )}`;

      const body = {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const rawMsg = errData?.error?.message || `Erreur API Gemini (${res.status})`;
        const lower = rawMsg.toLowerCase();

        const isOverloadedOrUnavailable =
          res.status === 503 ||
          res.status === 429 ||
          res.status === 404 ||
          lower.includes("high demand") ||
          lower.includes("overloaded") ||
          lower.includes("spikes in demand") ||
          lower.includes("resource_exhausted") ||
          lower.includes("not found");

        if (isOverloadedOrUnavailable && i < candidateModels.length - 1) {
          console.warn(
            `[Bark Gemini Connector] Le modèle « ${currentModel} » est saturé ou non supporté (${rawMsg}). Bascule sur « ${candidateModels[i + 1]} »...`
          );
          lastError = new Error(rawMsg);
          continue; // Try next fallback model
        }

        // Final candidate failed or non-recoverable error
        if (lower.includes("high demand") || res.status === 503) {
          throw new Error(
            `Le modèle « ${currentModel} » subit une forte demande chez Google (503 High Demand). Choisissez « Gemini 2.5 Flash » dans les Paramètres ⚙️ ou réessayez dans quelques instants.`
          );
        }
        if (res.status === 404 || lower.includes("not found")) {
          throw new Error(
            `Le modèle « ${currentModel} » n'est pas pris en compte avec cette clé API (404). Cliquez sur « Détecter les modèles » dans les Paramètres ⚙️ ou sélectionnez « gemini-2.5-flash ».`
          );
        }

        throw new Error(rawMsg);
      }

      const data = await res.json();
      const text =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Aucune réponse textuelle reçue de Gemini.";

      // If fallback was activated, inform user gently
      if (i > 0) {
        return `> ⚡ **Note de continuité Bark** : Le modèle initial (\`${primaryModel}\`) est actuellement saturé sur les serveurs Google. Bark a automatiquement généré votre réponse avec \`${currentModel}\`.\n\n${text}`;
      }

      return text;
    } catch (err: any) {
      lastError = err;
      if (shouldFallback && i < candidateModels.length - 1) {
        continue;
      }
      throw err;
    }
  }

  throw lastError || new Error("Échec de communication avec Google Gemini.");
}

/**
 * Execute query via OpenRouter or Ollama (OpenAI compatible)
 */
export async function callHermesApi(
  prompt: string,
  config: HermesConfig
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

  const body = {
    model: config.model || "nousresearch/hermes-3-llama-3.1-70b",
    messages: [
      {
        role: "system",
        content:
          "Tu es Hermes Agent, l'assistant autonome de Nous Research. Réponds avec pertinence, concision et professionnalisme.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
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
