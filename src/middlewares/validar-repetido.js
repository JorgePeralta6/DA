import User from '../users/user.model.js';

export const validarRepetido = async (req, res, next) => {
    const { DPI, nombreN } = req.body;

    try {
        const pacientesConDPI = await User.find({ DPI });

        if (pacientesConDPI.length === 0) {
            // No hay registros con ese DPI, se permite continuar
            return next();
        }

        // Hay registros con ese DPI, ahora verifica el nombre del niño
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
