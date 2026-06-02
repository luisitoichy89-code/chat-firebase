import { auth, db, createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword, signOut } from './firebase.js';
import { doc, setDoc, getDoc, collection, getDocs, updateDoc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { validarNombre, limpiarNombre } from './usuarios.js';

export async function registrar(alias, email, password, sexo) {
    if (!sexo) throw new Error('Debes seleccionar tu sexo biológico obligatoriamente.');
    const validacion = validarNombre(alias);
    if (validacion !== true) throw new Error(validacion);

    const aliasLimpio = limpiarNombre(alias);
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(cred.user);

    // Inyección de perfil con rol, estado y género en la base de datos
    await setDoc(doc(db, "usuarios", cred.user.uid), {
        uid: cred.user.uid,
        alias: aliasLimpio,
        email: email,
        rol: "usuario", 
        sexo: sexo, // 'masculino' o 'femenino'
        estado: "activo",
        ultima_actividad: Date.now(),
        creado: Date.now()
    });
}

export async function login(email, password) {
    // 1. Verificación rápida de aforo antes de permitir iniciar sesión
    const snapshotOnline = await getDocs(collection(db, "usuarios_online"));
    const conectados = snapshotOnline.docs.map(d => d.data());
    
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const docSnap = await getDoc(doc(db, "usuarios", cred.user.uid));
    const datosUsuario = docSnap.data();

    if (datosUsuario.estado === "suspendido") {
        await signOut(auth);
        throw new Error('Esta cuenta ha sido expulsada del espacio.');
    }

    if (!cred.user.emailVerified) {
        await signOut(auth);
        throw new Error('Debes validar tu cuenta pulsando el enlace enviado a tu correo.');
    }

    // 2. Regla del Portero de 100 usuarios con expulsión por inactividad
    if (conectados.length >= 100 && datosUsuario.rol !== 'creador' && datosUsuario.rol !== 'moderador') {
        await signOut(auth);
        throw new Error('🔒 Espacio temporalmente lleno (100/100). Intenta ingresar más tarde.');
    } else if (conectados.length >= 100 && (datosUsuario.rol === 'creador' || datosUsuario.rol === 'moderador')) {
        // Si entra Luisito o un moderador, localiza y bota al usuario común más inactivo
        const usuariosComunesConectados = conectados.filter(u => u.rol === 'usuario');
        if (usuariosComunesConectados.length > 0) {
            usuariosComunesConectados.sort((a, b) => a.ultima_actividad - b.ultima_actividad);
            const masInactivo = usuariosComunesConectados[0];
            
            // Lo desconecta en el servidor
            await setDoc(doc(db, "usuarios_online", masInactivo.uid), { forzar_salida: true });
        }
    }

    // Registrar marca de conexión
    await setDoc(doc(db, "usuarios_online", cred.user.uid), {
        uid: cred.user.uid,
        rol: datosUsuario.rol,
        alias: datosUsuario.alias,
        ultima_actividad: Date.now()
    });

    return datosUsuario;
}
