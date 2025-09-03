import { Schema, model } from "mongoose";
import User from "../users/user.model.js";

// Esquema para la colección de contadores
const CounterSchema = new Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 },
});

const Counter = model('Counter', CounterSchema);


// Función para obtener el siguiente valor de la secuencia
const getNextSequenceValue = async (sequenceName) => {
    const lastUser = await User.findOne({ status: true })
        .sort({ numero: -1 })
        .select('numero');

    let maxNumero = lastUser ? parseInt(lastUser.numero) : 0;
    return maxNumero + 1;
};


export { getNextSequenceValue };