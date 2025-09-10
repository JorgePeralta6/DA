import jwt from 'jsonwebtoken';

import Auth from '../auth/auth.model.js';

export const validarJWT = async (req, res, next) => {
    
    const token = req.header("x-token");

    if (!token) {
        return res.status(401).json({
            msg: "No hay token en la petición"
        });
    }

    try {
        const { uid } = jwt.verify(token, process.env.SECRETORPRIVATEKEY);

        const user = await Auth.findById(uid);

        if (!user) {
            return res.status(401).json({
                msg: 'Usuario no existe en la base de datos'
            });
        }

        if (!user.status) {
            return res.status(401).json({
                msg: 'Token no válido - usuario con estado false'
            });
        }

        req.user = user; // <-- este es el cambio importante

        next();
    } catch (e) {
        console.log(e);
        res.status(401).json({
            msg: "Token no válido"
        });
    }
}
