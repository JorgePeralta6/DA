import User from "../users/user.model.js";
import Pet from "../pet/pet.model.js";
import Appointment from "./appointment.model.js"

export const saveAppointment = async (req, res) => {
    try{

        const data = req.body;
        const user = await User.findOne({ email: data.email});
        const pet = await Pet.findOne({ name: data.name});

        if(!user || !pet){
            return res.status(404).json({
                success: false,
                msg: "Propietario o mascota no encontrada"
            })
        }

        const appointment = new Appointment({
            ...data,
            keeper: user._id, 
            pet: pet._id
            
        });

        await appointment.save();

        res.status(200).json({
            success: true,
            appointment
        })

    } catch(error){
        res.status(500).json({
            success: false,
            msg: "Error al guardar el appointment",
            error
        })
    }
}

export const getAppointments = async(req, res) => {
    const { limit = 10, desde = 0 } = req.query;
    const query = { status: true };

    try{

        const appointments = await Appointment.find(query)
            .skip(Number(desde))
            .limit(Number(limit));
        
        const appointmentWithOwnerNames = await Promise.all(appointments.map(async(appointment) =>{
            const pet = await Pet.findById(appointment.pet);
            const owner = await User.findById(appointment.keeper);
            return{
                ...appointment.toObject(),
                pet: pet ? pet.name : "Propetario no encontrado",
                keeper: owner ? owner.name : "Propetario no encontrado_"
            }
        }))

        const total = await Appointment.countDocuments(query);

        res.status(200).json({
            success: true,
            total,
            appointments: appointmentWithOwnerNames
        })

    }catch(error){
        res.status(500).json({
            success: false,
            msg: "Error al obtener appointments",
            error
        })
    }
}

export const searchAppointment = async (req, res) => {
    
    const { id } = req.params;
    
    try {

        const appointment = await Appointment.findById(id);

        if(!appointment){
            return res.status(400).json({
                success: false,
                msg: "Appointment no encontrado"
            })
        }

        const pet = await Pet.findById(appointment.pet);
        const owner = await User.findById(appointment.keeper);

        res.status(200).json({
            success: true,
            appointment: {
                ...appointment.toObject(),
                pet: pet ? pet.name : "Mascota no encontrada",
                keeper: owner ? owner.name : "Propietario no encontrado"
            }
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error al buscar el appointment',
            error
        })
    }
}

export const deleteAppointment = async(req, res) => {
    
    const { id } = req.params;

    try {

        await Appointment.findByIdAndUpdate(id, { status: false });

        res.status(200).json({
            sucess: true,
            msg: "Appoitment elimando exitosamente"
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error al eliminar el appointment"
        })
    }
}

export const updateAppointment = async (req, res = response) => {
    try {

        const { id } = req.params;
        const { _id, ...data} = req.body;
        let { email, name } = req.body;

        if(email) {
            const user = await User.findOne({ email });
 
            if (!user) {
                return res.status(400).json({
                    success: false,
                    msg: 'Usuario con ese correo electrónico no encontrado',
                });
            }
            data.keeper = user._id;
        };
        
        if(name) {
            const pet = await Pet.findOne({ name });
 
            if (!pet) {
                return res.status(400).json({
                    success: false,
                    msg: 'mascota con ese correo electrónico no encontrado',
                });
            }
            data.pet = pet._id;
        }  

        const appointment = await Appointment.findByIdAndUpdate(id, data, {new: true});

        res.status(200).json({
            success: true,
            msg: 'Cita actualizada',
            appointment
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error al actualizar la cita',
            error
        })
    }
}