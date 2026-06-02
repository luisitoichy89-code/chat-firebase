
import { aplicarAntiAutocompletado } from './security.js';
import { auth, db, storage, signOut } from './firebase.js';
import { collection, onSnapshot, doc, setDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { login, registrar } from './auth.js';

let usuarioActual = null;
let pestañaActiva = "general";
let contadorFotosHora = 0;
let contadorDocsHora = 0;
let tiempoInicioCuota = Date.now();

// --- CORTINA ANTI-ESPIONAJE FÍSICO ---
document.addEventListener("visibilitychange", () => {
    const cortina = document.getElementById("marca-agua");
    if (document.hidden) cortina.classList.add("activo");
    else cortina.classList.remove("activo");
});

// --- ENGRANAJE DE COLORES, GÉNEROS Y FLOR DE JAZMÍN ---
export function obtenerEstiloNombre(usuario) {
    let textoNombre = usuario.alias;
    let claseEstilo = "";

    // Regla de la Flor de Jazmín para el sexo femenino
    if (usuario.sexo === "femenino") {
        textoNombre += " 🌸";
    }

    // Regla estricta de asignación de colores por jerarquía
    if (usuario.alias === "Luisito" || usuario.rol === "creador") {
        claseEstilo = "color-creador-rojo"; // Luisito siempre Rojo
    } else if (usuario.rol === "moderador") {
        claseEstilo = "color-mod-negro";    // Moderadores en Negro
    } else if (usuario.sexo === "femenino") {
        claseEstilo = "color-fem-rosado";   // Usuarias comunes en Rosado Oscuro
    } else {
        claseEstilo = "color-masc-verde";   // Usuarios comunes en Verde
    }

    return `<span class="${claseEstilo}">${textoNombre}</span>`;
}

// --- CONTROL DEL BOTÓN CLIP POR PESTAÑA ---
function seleccionarPestana(idPestana) {
    pestañaActiva = idPestana;
    const clip = document.getElementById('contenedor-clip');
    
    if (pestañaActiva === "general") {
        clip.style.display = "none"; // Prohibido enviar archivos en la sala pública
    } else {
        clip.style.display = "block"; // Permitido únicamente en canales uno a uno
    }
}

// --- FILTRO Y CUOTAS DE ARCHIVOS EN PRIVADO (MÁXIMO 2 POR HORA) ---
const inputArchivo = document.getElementById('input-archivo');
inputArchivo?.addEventListener('change', async (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;

    // Reiniciar cuotas si ya pasó una hora
    if (Date.now() - tiempoInicioCuota > 60 * 60 * 1000) {
        contadorFotosHora = 0;
        contadorDocsHora = 0;
        tiempoInicioCuota = Date.now();
    }

    if (archivo.type.startsWith('image/')) {
        if (archivo.size > 5 * 1024 * 1024) {
            alert("Límite de foto excedido (Máx 5 MB).");
            return;
        }
        if (contadorFotosHora >= 2) {
            alert("⚠️ Has alcanzado tu cuota de 2 fotos por hora en chats privados.");
            return;
        }
        contadorFotosHora++;
    } else {
        const permitidos = ['pdf', 'docx', 'xlsx', 'pptx', 'txt', 'mp3', 'wav', 'zip', 'rar'];
        const ext = archivo.name.split('.').pop().toLowerCase();
        if (!permitidos.includes(ext) || archivo.size > 20 * 1024 * 1024) {
            alert("Archivo no permitido o mayor a 20 MB.");
            return;
        }
        if (contadorDocsHora >= 2) {
            alert("⚠️ Has alcanzado tu cuota de 2 documentos por hora.");
            return;
        }
        contadorDocsHora++;
    }
    alert("Archivo verificado y listo para procesar en privado.");
});

// --- INMUNIDAD DE MODERACIÓN CRUZADA EN EL PANEL ---
function renderizarListaAdmin(usuarios) {
    const contenedor = document.getElementById('lista-usuarios-admin');
    contenedor.innerHTML = '';

    usuarios.forEach(u => {
        if (u.uid === usuarioActual.uid) return;

        const item = document.createElement('div');
        item.className = 'usuario-admin-item';
        
        let botonHTML = "";
        // Candado real: Ningún moderador puede tocar a otro moderador o a Luisito
        if (usuarioActual.rol === 'creador') {
            botonHTML = `<button class="btn-banear" data-uid="${u.uid}">${u.estado === 'activo' ? '⛔ Expulsar' : 'Activar'}</button>`;
        } else if (usuarioActual.rol === 'moderador' && u.rol === 'usuario') {
            botonHTML = `<button class="btn-banear" data-uid="${u.uid}">⛔ Expulsar</button>`;
        } else {
            botonHTML = `<span style="color: #999; font-size:12px;">🔒 Inmune</span>`;
        }

        item.innerHTML = `<span>${u.alias} (${u.rol})</span> ${botonHTML}`;
        contenedor.appendChild(item);
    });
}


// INIT SECURITY
window.addEventListener('DOMContentLoaded', aplicarAntiAutocompletado);
