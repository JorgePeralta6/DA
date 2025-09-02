import { response, request } from "express";
import { hash } from "argon2";
import User from "./user.model.js"

export const saveUser = async (req,res) =>{
    try {
 
        const data = req.body;
 
        const user = new User({
            ...data
        });
 
        await user.save();
 
        res.status(200).json({
            success: true,
            user
        })
 
    }catch(error){
        res.status(500).json({
            success: false,
            message: 'Error al guardar al niño',
            error: error.message || error,
        })
    }
}
 

export const getUsers = async (req = request, res = response) => {
    try {

        const { limite = 10, desde = 0} = req.query;
        const query = { status: true};

        const [total, users] = await Promise.all([
            User.countDocuments(query),
            User.find(query)
                .skip(Number(desde))
                .limit(Number(limite))
        ])

        res.status(200).json({
            success: true,
            total,
            users
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error al obtener usuarios",
            error
        })
    }
}

export const getDPI = async (req, res) => {
    try {
 
        const { DPI } = req.params;
 
        const users = await User.find({DPI});
 
        if(!users){
            return res.status(404).json({
                success: false,
                msg: 'Usuario not found'
            })
        }
 
        res.status(200).json({
            success: true,
            users
        })
 
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error al obtener usuarios',
            error
        })
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
        
        const { id } = req.params;

        const user = await User.findByIdAndUpdate(id, { status: false}, { new: true});

        const autheticatedUser = req.user;

        res.status(200).json({
            success: true,
            msg: 'Usuario desactivado',
            user,
            autheticatedUser
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error al desactivar usuario',
            error
        })
    }
}
