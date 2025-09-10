import { response, request } from "express";
import { hash } from "argon2";
import User from "./user.model.js"

export const saveUser = async (req, res) => {
    try {
        const data = req.body;

        // Asegurarse de que haya usuario autenticado
        const authUser = req.user;
        if (!authUser) {
            return res.status(401).json({
                success: false,
                message: "No autenticado"
            });
        }

        // Agregar el campo createdBy
        const user = new User({
            ...data,
            createdBy: authUser._id
        });

        await user.save();

        res.status(200).json({
            success: true,
            user
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al guardar al niño',
            error: error.message || error,
        });
    }
}



export const getUsers = async (req, res = response) => {
    try {
        console.log("req.user:", req.user); // 👈 Verifica si el usuario está presente

        const authUser = req.user;

        if (!authUser) {
            return res.status(401).json({
                success: false,
                message: "No autenticado"
            });
        }

        let query = { status: true };

        if (authUser.role !== "ADMIN_ROLE") {
            query.createdBy = authUser._id;
        }

        const users = await User.find(query).sort({ numero: 1 });

        res.status(200).json({
            success: true,
            users
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error al obtener usuarios",
            error
        });
    }
}


export const getDPI = async (req, res) => {
    try {
        const { search } = req.params;

        const users = await User.find({
            $or: [
                { DPI: search },
                { nombreE: { $regex: search, $options: 'i' } },
                { nombreN: { $regex: search, $options: 'i' } }
            ]
        });

        if (!users || users.length === 0) {
            return res.status(404).json({
                success: false,
                msg: 'Usuario no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            users
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error al obtener usuarios',
            error
        });
    }
}


export const updateUser = async (req, res = response) => {
    try {
        const { numero } = req.params; // Número viene por URL
        const { _id, ...data } = req.body;

        // Buscar usuario por número
        const user = await User.findOneAndUpdate(
            { numero },
            data,
            { new: true }
        );

        // Si no se encuentra el usuario
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Usuario actualizado exitosamente',
            user
        });

    } catch (error) {
        // Error interno
        res.status(500).json({
            success: false,
            message: 'Error al actualizar el usuario',
            error: error.message
        });
    }
}


export const deleteUser = async (req, res) => {
    try {
        const { numero } = req.params;

        // Eliminar completamente el usuario
        const user = await User.findOneAndDelete({ numero });

        if (!user) {
            return res.status(404).json({
                success: false,
                msg: 'Usuario no encontrado'
            });
        }

        // Convertimos numero a entero para la comparación en reordenamiento
        const numeroEliminado = parseInt(numero, 10);

        // Reordenar: disminuir en 1 todos los números mayores al eliminado
        const usuariosRestantes = await User.find({});

        for (const u of usuariosRestantes) {
            const n = parseInt(u.numero, 10);
            if (n > numeroEliminado) {
                u.numero = (n - 1).toString(); // lo dejamos como string
                await u.save();
            }
        }

        const authenticatedUser = req.user;

        res.status(200).json({
            success: true,
            msg: 'Usuario eliminado y reordenado correctamente',
            user,
            authenticatedUser
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error al eliminar usuario',
            error: error.message
        });
    }
};