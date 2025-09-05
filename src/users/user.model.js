import { Schema, model } from "mongoose";
import { getNextSequenceValue } from "../counter/counter.model.js";

const UserSchema = Schema({
    numero: {
        type: String
    },
    nombreE: {
        type: String,
        required: [true, "Campo vacío"],
    },
    nombreN: {
        type: String,
        required: [true, "Campo vacío"],
    },
    DPI: {
        type: String,
        minLength: 13,
        maxLength: 13,
        required: [true, "Campo vacío"],
    },
    comunidad: {
        type: String,
        required: [true, "Campo vacío"],
    },
    direccion: {
        type: String,
        required: [true, "Campo vacío"],
    },
    email: {
        type: String,
    },
    telefono: {
        type: Number,
        minLength: 8,
        maxLength: 8,
        required: true,
    },
    genero: {
        type: String,
        required: true,
        enum: ["FEMENINO", "MASCULINO"],
    },
    notas: {
        type: String,
        required: [true, "Campo vacío"],
    },
    status: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
    versionKey: false
});

UserSchema.pre('save', async function (next) {
    if (this.isNew) {
        const numero = await getNextSequenceValue('numero');
        this.numero = numero.toString();  // Aseguramos que sea un string
    }
    next();
});

UserSchema.methods.toJSON = function () {
    const { __v, _id, ...user } = this.toObject();
    user.uid = _id;
    return user;
}

export default model('User', UserSchema);
