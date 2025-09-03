import { Router } from "express";
import { check } from "express-validator";
import { saveUser, getUsers, getDPI, updateUser, deleteUser } from "./user.controller.js"
import { existeUsuarioById, existeDPI } from "../helpers/db-validator.js"
import { validarCampos } from "../middlewares/validar-campos.js";
import { validarRepetido } from "../middlewares/validar-repetido.js"

const router = Router();

router.post(
    "/",
    [
        check('nombreE', 'El nombre es obligatorio').notEmpty(),
        check('nombreN', 'El nombre de niño es obligatorio').notEmpty(),
        check('DPI', "El dpi tiene que ser obligatorio").notEmpty(),
        check('comunidad', 'La comunidad es obligatoria').notEmpty(),
        check('direccion', 'La dirección es obligatoria').notEmpty(),
        check('telefono', 'El teléfono debe tener exactamente 8 dígitos').isLength({ min: 8, max: 8 }),
        check('email', 'El correo electrónico no es válido').isEmail(),
        validarCampos,
        validarRepetido
    ],
    saveUser
)

router.get("/", getUsers);

router.get(
    "/findUser/:DPI",
    [
        check("DPI", "El DPI debe ser una cadena de 13 caracteres").isString().isLength({ min: 13, max: 13 }),
        check("DPI").custom(existeDPI), 
        validarCampos
    ],
    getDPI
)

router.put(
    "/:numero",
    [
        check("numero", "El número es obligatorio").not().isEmpty(),
        validarCampos
    ],
    updateUser
);


router.delete(
    "/:numero",
    [
        check("numero", "El número es obligatorio").not().isEmpty(),
        validarCampos
    ],
    deleteUser
)


export default router;