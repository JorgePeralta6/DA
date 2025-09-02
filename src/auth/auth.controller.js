import Auth from './auth.model.js'
import { hash, verify } from 'argon2';
import { generarJWT } from '../helpers/generate-jwt.js';

export const login = async (req, res) => {

    const { email, password, username } = req.body;

    try {

        const auth = await Auth.findOne({
            $or: [{ email }, { username }]
        });

        if (!auth) {
            return res.status(400).json({
                msg: 'Credenciales incorrectas, Correo no existe en la base de datos'
            });
        }

        if (!auth.status) {
            return res.status(400).json({
                msg: 'El usuario no existe en la base de datos'
            });
        }

        const validPassword = await verify(auth.password, password);
        if (!validPassword) {
            return res.status(400).json({
                msg: 'La contraseña es incorrecta'
            });
        }

        const token = await generarJWT(auth.id);

        return res.status(200).json({
            msg: 'Inicio de sesión exitoso!!',
            authDetails: {
                username: auth.username,
                token: token,
                profilePicture: auth.profilePicture
            }
        })

    } catch (e) {

        console.log(e);

        return res.status(500).json({
            message: "Server error",
            error: e.message
        })
    }
}

export const register = async (req, res) => {
    try {

        const data = req.body;

        const encryptedPassword = await hash(data.password);

        const auth = await Auth.create({
            nombre: data.nombre,
            apellido: data.apellido,
            username: data.username,
            email: data.email,
            phone: data.phone,
            password: encryptedPassword
        })

        return res.status(201).json({
            message: "Usuario registrado con exito",
            authDetails: {
                auth: auth.email
            }
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "El usuario no se pudo registrar",
            error: error.message
        })
    }
}