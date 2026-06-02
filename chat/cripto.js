// X25519 + HKDF + AES-GCM (WebCrypto base)
export async function generarClaves(){
 const kp=await crypto.subtle.generateKey({name:'ECDH',namedCurve:'X25519'},true,['deriveKey']);
 return kp;
}
export async function derivarClave(priv, pub){
 return crypto.subtle.deriveKey(
  {name:'ECDH',public:pub},
  priv,
  {name:'HKDF',hash:'SHA-256',salt:crypto.getRandomValues(new Uint8Array(16)),info:new Uint8Array()},
  false,
  ['encrypt','decrypt']
 );
}
export async function cifrar(msg,key){
 const iv=crypto.getRandomValues(new Uint8Array(12));
 const data=new TextEncoder().encode(msg);
 const ct=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,data);
 return {iv:Array.from(iv),data:Array.from(new Uint8Array(ct))};
}
export async function descifrar(payload,key){
 const iv=new Uint8Array(payload.iv);
 const ct=new Uint8Array(payload.data);
 const pt=await crypto.subtle.decrypt({name:'AES-GCM',iv},key,ct);
 return new TextDecoder().decode(pt);
}
