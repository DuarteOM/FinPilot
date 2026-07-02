const API_URL=import.meta.env.VITE_API_URL||"/api";
const TOKEN_KEY="finpilot_token";

let token=localStorage.getItem(TOKEN_KEY);

async function request(path,{method="GET",body,auth=true}={}){
  const response=await fetch(`${API_URL}${path}`,{
    method,
    headers:{...(body?{"Content-Type":"application/json"}:{}),...(auth&&token?{Authorization:`Bearer ${token}`}:{})},
    body:body?JSON.stringify(body):undefined,
  });
  if(response.status===204)return null;
  const payload=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(payload.error||"Não foi possível contactar o servidor.");
  return payload;
}

export const api={
  hasSession:()=>Boolean(token),
  setToken(value){token=value;if(value)localStorage.setItem(TOKEN_KEY,value);else localStorage.removeItem(TOKEN_KEY);},
  auth:{
    login:data=>request("/auth/login",{method:"POST",body:data,auth:false}),
    register:data=>request("/auth/register",{method:"POST",body:data,auth:false}),
    me:()=>request("/auth/me"),
  },
  user:{profile:data=>request("/user/profile",{method:"PATCH",body:data}),settings:data=>request("/user/settings",{method:"PATCH",body:data})},
  transactions:{list:()=>request("/transactions"),create:data=>request("/transactions",{method:"POST",body:data}),update:(id,data)=>request(`/transactions/${id}`,{method:"PUT",body:data}),remove:id=>request(`/transactions/${id}`,{method:"DELETE"})},
  budgets:{list:()=>request("/budgets"),create:data=>request("/budgets",{method:"POST",body:data}),update:(id,data)=>request(`/budgets/${id}`,{method:"PUT",body:data}),remove:id=>request(`/budgets/${id}`,{method:"DELETE"})},
  goals:{list:()=>request("/goals"),create:data=>request("/goals",{method:"POST",body:data}),update:(id,data)=>request(`/goals/${id}`,{method:"PUT",body:data}),contribute:(id,amount)=>request(`/goals/${id}/contributions`,{method:"POST",body:{amount}}),remove:id=>request(`/goals/${id}`,{method:"DELETE"})},
  subscriptions:{list:()=>request("/subscriptions"),create:data=>request("/subscriptions",{method:"POST",body:data}),update:(id,data)=>request(`/subscriptions/${id}`,{method:"PUT",body:data}),setActive:(id,active)=>request(`/subscriptions/${id}/status`,{method:"PATCH",body:{active}}),remove:id=>request(`/subscriptions/${id}`,{method:"DELETE"})},
  reports:{get:(months=7)=>request(`/reports?months=${months}`)},
  ai: {
    chat:        message => request("/ai/chat",    { method: "POST",   body: { message } }),
    history:     ()      => request("/ai/history"),
    clearHistory:()      => request("/ai/history", { method: "DELETE" }),

    /**
     * Streaming chat via Server-Sent Events.
     * Calls `onDelta(text)` for each chunk and `onDone(model)` when finished.
     * Returns an AbortController so the caller can cancel the request.
     */
    chatStream(message, { onDelta, onDone, onError }) {
      const controller = new AbortController();
      const url = `${API_URL}/ai/chat/stream`;

      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message }),
        signal: controller.signal,
      })
        .then(async (response) => {
          if (!response.ok) {
            const payload = await response.json().catch(() => ({}));
            throw new Error(payload.error || "Não foi possível contactar o servidor.");
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });

            // SSE messages are separated by \n\n
            const parts = buffer.split("\n\n");
            buffer = parts.pop(); // keep incomplete last chunk

            for (const part of parts) {
              const line = part.replace(/^data:\s*/, "");
              if (!line) continue;
              try {
                const parsed = JSON.parse(line);
                if (parsed.delta !== undefined) onDelta(parsed.delta);
                if (parsed.done)                onDone(parsed.model ?? "");
              } catch {
                // ignore malformed lines
              }
            }
          }
        })
        .catch((err) => {
          if (err.name !== "AbortError") onError(err);
        });

      return controller;
    },
  },
};
