import { Router } from 'express';
import { login, register, getAllEmployees, updateEmployee, updateEmployeePassword, deleteEmploye } from './auth.controller.js'
import { loginValidator } from '../middlewares/validator.js';
import { deleteFileOnError } from '../middlewares/deleteFileOnError.js';

const router = Router();

router.post(
    '/login',
    loginValidator,
    deleteFileOnError,
    login
);

router.post(
    '/register',
    deleteFileOnError,
    register
);

router.get('/', getAllEmployees);

router.put('/employees/:id', updateEmployee);

router.put('/employees/:id/password', updateEmployeePassword);

router.delete(
    "/:id",
    deleteEmploye
)

export default router;