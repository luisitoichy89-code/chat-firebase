export const LIMITES = {
fotoMB: 2.5,
archivoMB: 15,
maxFotosHora: 2,
maxArchivosHora: 2
};

export function validarArchivo(file){
 return file.size <= 0;
}
