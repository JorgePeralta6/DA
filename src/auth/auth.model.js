import { Schema, model } from "mongoose";

const AuthSchema = Schema(
    {
        nombre: {
            type: String,
            required: [true, "Nombre es requerido"]
        },
        apellido: {
            type: String,
            required: [true, "Apellido es requerido"]
        },
        username: {
            type: String,
            unique: true
        },
        email: {
            type: String,
            required: [true, "Email es necesario"],
            unique: true
        },
        password: {
            type: String,
            required: [true, "La contraseña es requerida"]
        },
        phone: {
            type: String,
            minLength: 8,
            maxLength: 8,
            required: true,
        },
        status: {
            type: Boolean,
            default: true,
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
)

export default model("Auth", AuthSchema)