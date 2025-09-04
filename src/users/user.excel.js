import Excel from 'excel4node';
import User from "./user.model.js";
import path from 'path';
import fs from 'fs';

export const generarExcel = async (req, res) => {
    const dirPath = path.resolve('src', 'reporteExcel');
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
    const filePath = path.join(dirPath, 'usuarios.xlsx');

    try {
        const users = await User.find({ status: true });

        const wb = new Excel.Workbook();
        const ws = wb.addWorksheet('Usuarios');

        // === Estilos ===

        // Estilo para encabezado (Ciruela claro)
// Estilo para encabezado (Ciruela claro)
    const headerStyle = wb.createStyle({
        fill: {
            type: 'pattern',
            patternType: 'solid',
            fgColor: '#D9D2E9' // Ciruela claro
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

    // Estilo para columnas específicas (Turquesa claro)
    const turquoiseStyle = wb.createStyle({
        fill: {
            type: 'pattern',
            patternType: 'solid',
            fgColor: '#CCEEFF' // Turquesa claro
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


        // === Cabecera ===
        const headers = ['No.', 'Nombre Encargado', 'Nombre Niño', 'DPI', 'Comunidad', 'Direccion', 'Correo', 'Telefono', 'Genero'];
        headers.forEach((header, i) => {
            ws.cell(1, i + 1).string(header).style(headerStyle);
        });

        // Ajustar ancho de columnas
        const widths = [3, 20, 20, 10, 18, 26, 18, 6, 7];
        widths.forEach((w, i) => ws.column(i + 1).setWidth(w));

        // === Cuerpo de la tabla ===
        users.forEach((user, index) => {
            const row = index + 2;

            // Estilo condicional por columna (turquesa o no)
            const turquoiseColumns = [0, 2, 4, 6, 8]; // Índices: No., Nombre Niño, Comunidad, Correo, Genero

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

                // Aplicar estilo turquesa si es columna designada
                if (turquoiseColumns.includes(colIndex)) {
                    cell.style(turquoiseStyle);
                } else {
                    cell.style(normalBorderStyle);
                }
            });
        });

        wb.write(filePath, (err) => {
            if (err) {
                return res.status(500).json({ success: false, msg: "Error al guardar el archivo Excel", error: err });
            }

            res.json({ success: true, msg: "Archivo Excel actualizado correctamente", path: filePath });
        });

    } catch (error) {
        return res.status(500).json({ success: false, msg: "Error al generar el archivo Excel", error: error.message });
    }
};
