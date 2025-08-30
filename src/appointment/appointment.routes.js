import { Router } from 'express';
import { check } from 'express-validator';
import { validarCampos } from '../middlewares/validar-campos.js';
import { validarJWT } from '../middlewares/validar-jwt.js';
import { deleteAppointment, getAppointments, saveAppointment, searchAppointment, updateAppointment } from './appointment.controller.js';
import { existeAppointmentById } from '../helpers/db-validator.js';

const router = Router();

router.post(
    '/',
    [
        validarJWT,
        validarCampos
    ],
    saveAppointment
);

router.get('/', getAppointments);

router.get(
    '/:id',
    [
        validarJWT,
        check('id', 'id isnt valid').isMongoId(),
        validarCampos
    ],
    searchAppointment
);

router.delete(
    '/:id',
    [
        validarJWT,
        check('id', 'id is not valid').isMongoId(),
        validarCampos
    ],
    deleteAppointment
);

router.put(
    '/:id',
    [
        validarJWT,
        check('id', 'No es un ID valido').isMongoId(),
        check('id').custom(existeAppointmentById),
        validarCampos
    ],
    updateAppointment
);

export default router;