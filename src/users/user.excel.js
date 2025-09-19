import Excel from 'excel4node';
import User from "./user.model.js";
import path from 'path';
import fs from 'fs';

const TEMP_FOLDER = '/tmp';

export const generarExcel = async (req, res) => {
    // Asegura que la carpeta temporal exista
    if (!fs.existsSync(TEMP_FOLDER)) {
        fs.mkdirSync(TEMP_FOLDER, { recursive: true });
    }

    const timestamp = Date.now();
    const fileName = `usuarios_${timestamp}.xlsx`;
    const filePath = path.join(TEMP_FOLDER, fileName);

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
        const headers = ['No.', 'Nombre Encargado', 'Nombre Niño', 'DPI', 'Comunidad', 'Dirección', 'Correo', 'Teléfono', 'Género'];
        headers.forEach((header, i) => {
            ws.cell(1, i + 1).string(header).style(headerStyle);
        });

        const widths = [3, 20, 20, 10, 18, 26, 18, 10, 7];
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

                if (turquoiseColumns.includes(colIndex)) {
                    cell.style(turquoiseStyle);
                } else {
                    cell.style(normalBorderStyle);
                }
            });
        });

        // === Guardar y enviar ===
        wb.write(filePath, (err) => {
            if (err) {
                return res.status(500).json({ success: false, msg: "Error al guardar el archivo Excel", error: err });
            }

            // Enviar el archivo como descarga
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

            res.download(filePath, fileName, (downloadErr) => {
                if (downloadErr) {
                    console.error("Error al enviar el archivo:", downloadErr);
                    return res.status(500).json({ success: false, msg: "Error al enviar el archivo" });
                }

                // Eliminar el archivo después de enviarlo
                fs.unlink(filePath, (unlinkErr) => {
                    if (unlinkErr) {
                        console.error("Error al eliminar archivo temporal:", unlinkErr);
                    }
                });
            });
        });

    } catch (error) {
        console.error("Error al generar Excel:", error);
        return res.status(500).json({ success: false, msg: "Error al generar el archivo Excel", error: error.message });
    }
};
