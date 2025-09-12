import User from '../users/user.model.js';

export const validarRepetido = async (req, res, next) => {
    const { DPI, nombreN } = req.body;
    const { numero } = req.params; // ID o número del usuario que se está editando

    if (!DPI || !nombreN) {
        // Si no vienen los campos, no validar duplicados
        return next();
    }

    try {
        // Busca pacientes con el mismo DPI pero que NO sean el paciente que estamos editando
        const pacientesConDPI = await User.find({ DPI, numero: { $ne: numero } });

        if (pacientesConDPI.length === 0) {
            // No hay registros con ese DPI (que no sea el actual), se permite continuar
            return next();
        }

        // Hay registros con ese DPI, verifica si alguno tiene el mismo nombreN
        const pacienteExistente = pacientesConDPI.find(paciente => paciente.nombreN.toLowerCase() === nombreN.toLowerCase());

        if (pacienteExistente) {
            return res.status(400).json({
                msg: 'Este paciente ya ha sido registrado con este DPI y nombre.',
            });
        }

        // Mismo DPI pero diferente nombre del niño, se permite continuar
        return next();

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            msg: 'Error al validar duplicados en el sistema',
        });
    }
};
