export async function apiClient(url: string, options?: RequestInit) {
  const res = await fetch(url, options);

  if (!res.ok) {
    const text = await res.text();
    let errorMessage = text;
    try {
      const data = JSON.parse(text);
      errorMessage = data.error || data.message || text;
      
      // Look for stringified LIMIT_REACHED payload
      try {
        const parsed = JSON.parse(errorMessage);
        if (parsed.type === "LIMIT_REACHED") {
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("limitReached", { detail: parsed })
            );
          }
        }
      } catch (e) {
        // Not a JSON string inside the error
      }
    } catch {
      // Body wasn't JSON
    }
    
    throw new Error(errorMessage);
  }

  return res;
}
