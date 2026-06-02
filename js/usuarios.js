export const nombresBloqueados = ["admin", "moderador", "administrador", "jefe", "support", "soporte", "root"];
export const palabrasProhibidas = ["pendejo", "idiota", "mierda", "puta", "puto"];

export function limpiarNombre(nombre) {
    // Filtro radical contra inyecciones XSS en el alias
    return nombre.replace(/[^a-zA-Z0-9_ -]/g, '').slice(0, 24).trim();
}

export function validarNombre(nombre) {
    const limpio = limpiarNombre(nombre).toLowerCase();
    if (!limpio || limpio.length < 3) return 'Nombre demasiado corto o inválido';
    if (nombresBloqueados.includes(limpio)) return 'Ese nombre está reservado por el sistema';
    if (palabrasProhibidas.some(p => limpio.includes(p))) return 'El nombre contiene lenguaje inapropiado';
    return true;
}
