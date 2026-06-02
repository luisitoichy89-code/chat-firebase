
// SECURITY CORE MODULE

// Basic HTML sanitization (anti XSS)
export function sanitizeText(str){
  return String(str)
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#x27;")
    .replace(/\//g,"&#x2F;");
}

// Chat ID deterministic (userA-userB sorted)
export function generarChatId(a,b){
  return [a,b].sort().join("_");
}

// Auto-destruction scheduler (client-side control)
export function programarAutodestruccion({docRef, ttlMs}){
  const created = Date.now();
  const destroyAt = created + ttlMs;

  setTimeout(async () => {
    try{
      await docRef.delete?.();
    }catch(e){
      console.warn("Autodestrucción fallida:", e);
    }
  }, ttlMs);

  return destroyAt;
}

// Disable autocomplete helper
export function aplicarAntiAutocompletado(){
  document.querySelectorAll("input, textarea").forEach(el=>{
    el.setAttribute("autocomplete","off");
    el.setAttribute("autocorrect","off");
    el.setAttribute("autocapitalize","off");
    el.setAttribute("spellcheck","false");
  });
}
