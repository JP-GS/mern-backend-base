import Usuario from "../models/Usuario.js";
import generarJWT from "../helpers/generarJWT.js";
import generarId from "../helpers/generarId.js";

const registrar = async (req, res) => {
    const { email } = req.body;

    const existeUsuario = await Usuario.findOne({email});
    if(existeUsuario) {
        const error = new Error('Ya existe un usuario registrado con este email');
        return res.status(400).json({msg: error.message});
    }

    try {
        const usuario = new Usuario(req.body);
        await usuario.save()
        res.json({ msg: 'Usuario guardado correctamente'});

    } catch (error) {
        console.log(error);
    }  
};

const perfil = (req, res) => {
    const { usuario } = req;
    return res.json({ perfil: usuario });
}

const confirmar = async (req, res) => {
    const {token} = req.params;
    const usuarioConfirmar = await Usuario.findOne({token});
    if(!usuarioConfirmar) {
        const error = new Error('Token no encontrado')
        return res.status(400).json({msg: error.message});
    }

    try {
        usuarioConfirmar.confirmado = true;
        usuarioConfirmar.token = '';
        res.json('Usuario Confirmado!!')
        await usuarioConfirmar.save();
    } catch (error) {
        console.log(error);
    };
};

const autenticar = async (req, res) => {
    const { email, password } = req.body;

    const usuario = await Usuario.findOne({ email });
    //Revisa si el usuario existe
    if(!usuario) {
        const error = new Error('El usuario no existe');
        return res.status(404).json({msg: error.message});
    };   
    //Revisa si el usuario está confirmado
    if(!usuario.confirmado) {
        const error = new Error('Tu cuenta no ha sido confirmada');
        return res.status(403).json({ msg: error.message});
    };
    //Revisa si el password es correcto
    if(await usuario.comprobarPassword(password)) {
        //Autenticar el usuario
        res.json({ token: generarJWT(usuario._id) });
    } else {
        const error = new Error('Password Incorrecto');
        res.status(401).json({ msg: error.message });
    }
};

const olvidePassword = async (req,res) => {
    const {email} = req.body;

    const existeUsuario = await Usuario.findOne({email});
    if(!existeUsuario) {
        const error = new Error('Usuario no encontrado');
        return res.status(400).json({msg: error.message});
    };

    try {
        existeUsuario.token = generarId();
        await existeUsuario.save();
        res.json({msg: 'Hemos enviado un email a tu casilla de correo, revisa y verifica tu cuenta'});
    } catch (error) {
        console.log(error);
    }
};

const comprobarToken = async (req,res) => {
    const { token } = req.params;

    const tokenValido = await Usuario.findOne({ token });
    if(tokenValido) {
        res.json({msg: 'Token válido! El usuario tiene permiso para cambiar la contraseña'})
    } else {
        const error = new Error('Token no válido');
        return res.status(400).json({ msg: error.message });
    }
};

const nuevoPassword = async (req,res) => {
    const { token } = req.params;
    const { password } = req.body;

    const usuario = await Usuario.findOne({ token });
    if(!usuario) {
        const error = new Error('Hubo un error');
        return res.status(400).json({msg: error.message});
    };
     try {
        usuario.token = '';
        usuario.password = password;
        await usuario.save();
        return res.status(200).json({msg: 'Contraseña reestablecida correctamente'});
     } catch (error) {
        console.log(error);
     }
};

export {
    registrar, perfil, confirmar, autenticar, olvidePassword, comprobarToken, nuevoPassword
};