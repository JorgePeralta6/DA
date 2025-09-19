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

        // === Encabezados ===
        const headers = ['No.', 'Nombre Encargado', 'Nombre Niño', 'DPI', 'Comunidad', 'Direccion', 'Correo', 'Telefono', 'Genero'];
        headers.forEach((header, i) => {
            ws.cell(1, i + 1).string(header).style(headerStyle);
        });

        const widths = [3, 20, 20, 10, 18, 26, 18, 6, 7];
        widths.forEach((w, i) => ws.column(i + 1).setWidth(w));

        // === Cuerpo de la tabla ===
        users.forEach((user, index) => {
            const row = index + 2;
            const turquoiseColumns = [0, 2, 4, 6, 8];

            const data = [
                user.numero,
                user.nombreE,
                user.nombreN,
                user.DPI,
                user.comunidad,
                user.direccion,
                user.email,
                user.telefono,
                user.genero
            ];

            data.forEach((value, colIndex) => {
                const cell = ws.cell(row, colIndex + 1);

                if (typeof value === 'number') {
                    cell.number(value);
                } else {
                    cell.string(value || '');
                }

                // Estilo condicional
                if (turquoiseColumns.includes(colIndex)) {
                    cell.style(turquoiseStyle);
                } else {
                    cell.style(normalBorderStyle);
                }
            });
        });

        // === Guardar y enviar el archivo al cliente ===
        wb.write(filePath, (err) => {
            if (err) {
                return res.status(500).json({ success: false, msg: "Error al guardar el archivo Excel", error: err });
            }
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=usuarios_${timestamp}.xlsx`);

            // Enviar el archivo como descarga al navegador del cliente
            res.download(filePath, `usuarios_${timestamp}.xlsx`, (downloadErr) => {
                if (downloadErr) {
                    console.error("Error al enviar el archivo:", downloadErr);
                    return res.status(500).json({ success: false, msg: "Error al enviar el archivo" });
                }

                // Eliminar archivo después de enviarlo
                fs.unlink(filePath, (unlinkErr) => {
                    if (unlinkErr) console.error("Error al eliminar archivo:", unlinkErr);
                });
            });
        });

    } catch (error) {
        return res.status(500).json({ success: false, msg: "Error al generar el archivo Excel", error: error.message });
    }
};
