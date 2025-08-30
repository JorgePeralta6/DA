import { Schema, model } from "mongoose";

const AppointmentSchema = Schema({
    date: {
        type: String,
        required: true
    },
    hour:{
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    location:{
        type: String,
        required: true
    },
    pet: {
        type: Schema.Types.ObjectId,
        ref: 'pet',
        required: true
    },
    keeper: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    status: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    versionKey: false
});


export default model('Appointment', AppointmentSchema);