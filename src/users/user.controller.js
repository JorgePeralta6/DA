import { response, request } from "express";
import { hash } from "argon2";
import User from "./user.model.js"
import { getNextSequenceValue } from "../counter/counter.model.js";

export const saveUser = async (req, res) => {
    try {
        const data = req.body;

        const authUser = req.user;
        if (!authUser) {
            return res.status(401).json({ success: false, message: "No autenticado" });
        }

        const numero = await getNextSequenceValue();

        const user = new User({
            ...data,
            numero,
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
};

export const getUsers = async (req, res = response) => {
    try {
        const authUser = req.user;

        if (!authUser) {
            return res.status(401).json({
                success: false,
                message: "No autenticado"
            });
        }

        const query = { status: true };

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
        const authUser = req.user;

        if (!authUser) {
            return res.status(401).json({
                success: false,
                message: "No autenticado"
            });
        }

        // Búsqueda base
        const searchQuery = {
            $or: [
                { DPI: { $regex: search, $options: 'i' } }, // Mejora para DPI
                { nombreE: { $regex: search, $options: 'i' } },
                { nombreN: { $regex: search, $options: 'i' } }
            ]
        };


        // Si NO es administrador, filtra también por "createdBy"
        if (authUser.role !== "ADMIN_ROLE") {
            searchQuery.createdBy = authUser._id;
        }

        const users = await User.find(searchQuery);

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
};



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

        // Eliminar usuario por número (asegurar tipo Number)
        const user = await User.findOneAndDelete({ numero: Number(numero) });

        if (!user) {
            return res.status(404).json({
                success: false,
                msg: 'Usuario no encontrado'
            });
        }

        const numeroEliminado = Number(numero);

        // Reordenar números de usuarios con numero > eliminado
        const usuariosRestantes = await User.find({ numero: { $gt: numeroEliminado } });

        for (const u of usuariosRestantes) {
            u.numero = u.numero - 1; // mantener número como Number
            await u.save();
        }

        // Actualizar contador al nuevo máximo
        const maxUser = await User.findOne().sort({ numero: -1 }).select('numero');
        const maxNumero = maxUser ? maxUser.numero : 0;

        await Counter.findByIdAndUpdate(
            'user',
            { seq: maxNumero },
            { new: true, upsert: true }
        );

        res.status(200).json({
            success: true,
            msg: 'Usuario eliminado y números reordenados correctamente',
            user
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error al eliminar usuario',
            error: error.message
        });
    }
};
