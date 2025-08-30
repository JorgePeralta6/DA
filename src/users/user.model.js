import { Schema, model } from "mongoose";

const UserSchema = Schema({
    numero: {
        type: String
    },
    nombreE: {
        type: String,
        required: [true, "Nombre del encargado es requerido"],
    },
    nombreN: {
        type: String,
        required: [true, "Nombre del niño es requerido"],
    },
    comunidad: {
        type: String,
        required: [true, "La comunidad es requerida"],
    },
    direccion: {
        type: String,
        required: [true, "La direccion es requerida"],
    },
    email: {
        type: String
    },
    telefono: {
        type: String,
        minLength: 8,
        maxLength: 8,
        required: true,
    },
    genero: {
        type: String,
        required: true,
        enum: ["FEMENINO", "MASCULINO"],
    },
    notas:{
        type: String
    },
    status: {
        type: Boolean,
        default: true,
    },
},
    {
        timestamps: true,
        versionKey: false
    }
);

UserSchema.methods.toJSON = function () {
    const { __v, password, _id, ...usuario } = this.toObject();
    usuario.uid = _id;
    return usuario;
}

export default model('User', UserSchema);