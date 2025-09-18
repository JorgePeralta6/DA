import { Schema, model } from "mongoose";
import User from "../users/user.model.js";

// Esquema para la colección de contadores
const CounterSchema = new Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 },
});

const Counter = model('Counter', CounterSchema);


// Función para obtener el siguiente valor de la secuencia
const getNextSequenceValue = async () => {
    const maxUser = await User.findOne().sort({ numero: -1 }).select('numero');
    const maxNumero = maxUser ? maxUser.numero : 0;
    return maxNumero + 1;
};





export { getNextSequenceValue };