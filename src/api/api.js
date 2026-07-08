const API_URL  = import.meta.env.VITE_API_URL || "/api";
const TOKEN_KEY = "finpilot_token";

let token = localStorage.getItem(TOKEN_KEY);

export class ApiError extends Error {
  constructor(message, { status, details } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

// ─── Base request ─────────────────────────────────────────────────────────────

async function request(path, { method = "GET", body, auth = true } = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (response.status === 204) return null;
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(payload.error || "Não foi possível contactar o servidor.", {
      status: response.status,
      details: payload.details,
    });
  }
  if (!response.ok) throw new Error(payload.error || "Não foi possível contactar o servidor.");
  return payload;
}

// ─── API client ───────────────────────────────────────────────────────────────

export const api = {
  hasSession: () => Boolean(token),
  setToken(value) {
    token = value;
    if (value) localStorage.setItem(TOKEN_KEY, value);
    else        localStorage.removeItem(TOKEN_KEY);
  },

  // ── Auth ────────────────────────────────────────────────────────────────────
  auth: {
    login:    data => request("/auth/login",    { method: "POST", body: data, auth: false }),
    register: data => request("/auth/register", { method: "POST", body: data, auth: false }),
    google:   accessToken => request("/auth/google", { method: "POST", body: { accessToken }, auth: false }),
    me:       ()   => request("/auth/me"),
  },

  // ── User ────────────────────────────────────────────────────────────────────
  user: {
    profile:  data => request("/user/profile",  { method: "PATCH", body: data }),
    settings: data => request("/user/settings", { method: "PATCH", body: data }),
  },

  // ── Accounts ────────────────────────────────────────────────────────────────
  accounts: {
    list:    ()         => request("/accounts"),
    types:   ()         => request("/accounts/types"),
    create:  data       => request("/accounts",        { method: "POST",  body: data }),
    update:  (id, data) => request(`/accounts/${id}`,  { method: "PUT",   body: data }),
    archive: id         => request(`/accounts/${id}/archive`, { method: "PATCH" }),
    remove:  id         => request(`/accounts/${id}`,  { method: "DELETE" }),
  },

  // ── Categories ──────────────────────────────────────────────────────────────
  categories: {
    list:   ()         => request("/categories"),
    create: data       => request("/categories",        { method: "POST",   body: data }),
    update: (id, data) => request(`/categories/${id}`,  { method: "PUT",    body: data }),
    remove: id         => request(`/categories/${id}`,  { method: "DELETE" }),
  },

  // ── Transactions ─────────────────────────────────────────────────────────────
  // Each transaction has `items: [{ categoryId, description?, amount }]`
  transactions: {
    list:   (params = {}) => {
      const qs = new URLSearchParams();
      [
        "search",
        "type",
        "category",
        "account",
        "paymentMethod",
        "status",
        "dateFrom",
        "dateTo",
        "minAmount",
        "maxAmount",
        "sort",
        "limit",
        "offset",
      ].forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== "") qs.set(key, params[key]);
      });
      return request(`/transactions${qs.size ? `?${qs}` : ""}`);
    },
    paymentMethods: () => request("/transactions/payment-methods"),
    get:    id         => request(`/transactions/${id}`),
    create: data       => request("/transactions",       { method: "POST",   body: data }),
    remove: id         => request(`/transactions/${id}`, { method: "DELETE" }),
  },

  // ── Budgets ──────────────────────────────────────────────────────────────────
  budgets: {
    list:   ()         => request("/budgets"),
    create: data       => request("/budgets",        { method: "POST",   body: data }),
    update: (id, data) => request(`/budgets/${id}`,  { method: "PUT",    body: data }),
    remove: id         => request(`/budgets/${id}`,  { method: "DELETE" }),
  },

  // ── Goals ────────────────────────────────────────────────────────────────────
  goals: {
    list:          ()              => request("/goals"),
    create:        data            => request("/goals",                     { method: "POST",   body: data }),
    update:        (id, data)      => request(`/goals/${id}`,               { method: "PUT",    body: data }),
    contribute:    (id, data)      => request(`/goals/${id}/contributions`, { method: "POST",   body: data }),
    contributions: id              => request(`/goals/${id}/contributions`),
    remove:        id              => request(`/goals/${id}`,               { method: "DELETE" }),
  },

  // ── Subscriptions ────────────────────────────────────────────────────────────
  // status: "active" | "paused" | "cancelled"
  subscriptions: {
    list:      ()             => request("/subscriptions"),
    create:    data           => request("/subscriptions",             { method: "POST",  body: data }),
    update:    (id, data)     => request(`/subscriptions/${id}`,       { method: "PUT",   body: data }),
    setStatus: (id, status)   => request(`/subscriptions/${id}/status`,{ method: "PATCH", body: { status } }),
    remove:    id             => request(`/subscriptions/${id}`,       { method: "DELETE" }),
  },

  // ── Notifications ────────────────────────────────────────────────────────────
  notifications: {
    list:       ()   => request("/notifications"),
    markRead:   id   => request(`/notifications/${id}/read`,  { method: "PATCH" }),
    markAllRead:()   => request("/notifications/read-all",    { method: "PATCH" }),
    remove:     id   => request(`/notifications/${id}`,       { method: "DELETE" }),
  },

  // ── Dashboard ────────────────────────────────────────────────────────────────
  dashboard: {
    get: () => request("/dashboard"),
  },

  // ── Reports ──────────────────────────────────────────────────────────────────
  reports: {
    get: (months = 7) => request(`/reports?months=${months}`),
  },

  // ── AI ───────────────────────────────────────────────────────────────────────
  ai: {
    conversations: ()   => request("/ai/conversations"),
    history:       ()   => request("/ai/history"),
    clearHistory:  ()   => request("/ai/history", { method: "DELETE" }),

    chat: (message, conversationId = null) =>
      request("/ai/chat", { method: "POST", body: { message, conversationId } }),

    /**
     * Streaming chat via Server-Sent Events.
     * Chama `onDelta(text)` para cada fragmento e `onDone({model, conversationId})` no fim.
     * Devolve um AbortController para cancelar.
     */
    chatStream(message, { onDelta, onDone, onError }, conversationId = null) {
      const controller = new AbortController();

      fetch(`${API_URL}/ai/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message, conversationId }),
        signal: controller.signal,
      })
        .then(async response => {
          if (!response.ok) {
            const payload = await response.json().catch(() => ({}));
            throw new Error(payload.error || "Não foi possível contactar o servidor.");
          }

          const reader = response.body?.getReader();
          if (!reader) throw new Error("O servidor não devolveu um fluxo de resposta.");

          const decoder = new TextDecoder();
          let buffer = "";
          let eventName = "";
          let eventData = "";

          const flushEvent = () => {
            if (!eventData) return;
            try {
              const parsed = JSON.parse(eventData);
              if (eventName === "error") {
                throw new Error(parsed.error || "O assistente não conseguiu responder.");
              }
              if (parsed.delta !== undefined) onDelta(parsed.delta);
              if (parsed.done) onDone({ model: parsed.model, conversationId: parsed.conversationId });
            } catch (err) {
              if (err instanceof Error && err.message) {
                onError(err);
              }
            }
            eventName = "";
            eventData = "";
          };

          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              flushEvent();
              break;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split(/\r?\n/);
            buffer = lines.pop() ?? "";

            for (const line of lines) {
              if (!line.trim()) {
                flushEvent();
                continue;
              }
              if (line.startsWith(":")) continue;
              if (line.startsWith("event:")) {
                eventName = line.slice(6).trim();
                continue;
              }
              if (line.startsWith("data:")) {
                eventData = line.slice(5).trim();
              }
            }
          }
        })
        .catch(err => { if (err.name !== "AbortError") onError(err); });

      return controller;
    },
  },
};
