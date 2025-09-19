import Excel from 'excel4node';
import User from "./user.model.js";
import path from 'path';
import fs from 'fs';
import os from 'os';

export const generarExcel = async (req, res) => {
    const downloadsPath = path.join(os.homedir(), 'Downloads');

    // Crear carpeta Downloads si no existe (en servidores puede no ser necesario)
    if (!fs.existsSync(downloadsPath)) {
        fs.mkdirSync(downloadsPath, { recursive: true });
    }

    const timestamp = Date.now();
    const filePath = path.join(downloadsPath, `usuarios_${timestamp}.xlsx`);

    try {
        const users = await User.find({ status: true });

        const wb = new Excel.Workbook();
        const ws = wb.addWorksheet('Usuarios');

        // === Estilos ===

        const headerStyle = wb.createStyle({
            fill: {
                type: 'pattern',
                patternType: 'solid',
                fgColor: '#D9D2E9'
            },
            font: {
                name: 'Calibri',
                size: 7,
                bold: true,
                color: '#000000'
            },
            alignment: {
                horizontal: 'center'
            },
            border: {
                left: { style: 'thin', color: '#000000' },
                right: { style: 'thin', color: '#000000' },
                top: { style: 'thin', color: '#000000' },
                bottom: { style: 'thin', color: '#000000' }
            }
        });

        const turquoiseStyle = wb.createStyle({
            fill: {
                type: 'pattern',
                patternType: 'solid',
                fgColor: '#CCEEFF'
            },
            font: {
                name: 'Calibri',
                size: 8
            },
            border: {
                left: { style: 'thin', color: '#000000' },
                right: { style: 'thin', color: '#000000' },
                top: { style: 'thin', color: '#000000' },
                bottom: { style: 'thin', color: '#000000' }
            }
        });

        const normalBorderStyle = wb.createStyle({
            font: {
                name: 'Calibri',
                size: 7
            },
            border: {
                left: { style: 'thin', color: '#000000' },
                right: { style: 'thin', color: '#000000' },
                top: { style: 'thin', color: '#000000' },
                bottom: { style: 'thin', color: '#000000' }
            }
        });

        // === Guardar y enviar el archivo al cliente ===
        wb.write(filePath, async (err) => {
            if (err) {
                return res.status(500).json({ success: false, msg: "Error al guardar el archivo Excel", error: err });
            }

            if (!fs.existsSync(filePath)) {
                return res.status(404).json({ success: false, msg: 'Archivo no encontrado' });
            }

            // Establece los headers adecuados
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=usuarios_${timestamp}.xlsx`);

            // Envía el archivo como descarga
            res.download(filePath, `usuarios_${timestamp}.xlsx`, (downloadErr) => {
                if (downloadErr) {
                    console.error("Error al enviar el archivo:", downloadErr);
                    return res.status(500).json({ success: false, msg: "Error al enviar el archivo" });
                }

                // Elimina el archivo después de enviarlo
                fs.unlink(filePath, (unlinkErr) => {
                    if (unlinkErr) console.error("Error al eliminar archivo:", unlinkErr);
                });
            });
        });


    } catch (error) {
        return res.status(500).json({ success: false, msg: "Error al generar el archivo Excel", error: error.message });
    }
};
