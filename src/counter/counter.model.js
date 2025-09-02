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
    // Buscar el último número asignado
    const lastUser = await User.findOne().sort({ numero: -1 }).select('numero');

    // Si no hay usuarios, comenzamos desde 1
    let maxNumero = lastUser ? parseInt(lastUser.numero) : 0;

    // Devolver el siguiente número
    return maxNumero + 1;
};

export { getNextSequenceValue };