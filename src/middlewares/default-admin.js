import argon2 from "argon2";
import Auth from '../auth/auth.model.js'

export const createAdmin = async () => {
    try {
        const existAdmin = await Auth.findOne({ role: "ADMIN_ROLE" });
        
        if (!existAdmin) {
            const hashed = await argon2.hash("12345678");
            const adminUser = new Auth({
                nombre: "Admin",
                apellido: "Admin",
                username: "admin",
                email: "admin@gmail.com",
                phone: "12345667",
                password: hashed,
                role: "ADMIN_ROLE"
            });

            await adminUser.save();
        } 
    } catch (error) {
        console.error("Error creating admin:", error);
    }
};