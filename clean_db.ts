import xlsx from 'xlsx';

const inputPath = 'C:\\Users\\JuanMartínezCarrillo\\Desktop\\Base de datos definitiva GFS\\Nuevo definitivo correos FUNDAE.xlsx';
const outputPath = 'C:\\Users\\JuanMartínezCarrillo\\Desktop\\Base de datos definitiva GFS\\Base de datos definitiva GFS_Limpia.xlsx';

const workbook = xlsx.readFile(inputPath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

// Leemos como array de arrays de strings (texto crudo)
const rawData: string[][] = xlsx.utils.sheet_to_json(sheet, { header: 1 }) as string[][];

// Cabeceras originales reales:
// 0: N, 1: correo electrónico, 2: nombre, 3: nombre, 4: apellidos, 
// 5: Nombre y apellido, 6: organización, 7: cargo, 8: Enviado , 
// 9: Hora finalización , 10: retargueting enviado 

// Las cabeceras deseadas y su orden final
const desiredHeaders = [
    "correo electrónico",
    "nombre",
    "apellido",
    "nombre y apellido",
    "organización",
    "cargo",
    "Enviado",
    "Hora finalización",
    "retargeting enviado"
];

const cleanedRows: string[][] = [];
const bouncedRows: string[][] = [];
const emailSet = new Set<string>();

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const trimString = (s: any) => (s == null) ? "" : String(s).trim();

// Nos saltamos la fila de cabecera (i=0)
for (let i = 1; i < rawData.length; i++) {
    const row = rawData[i];
    // Evitar filas totalmente vacías
    if (!row || row.length === 0 || row.join("").trim() === '') continue;

    // Extraer valores. Notar que 'nombre' está repetido en índice 2 y 3, cogeremos el primero
    let rawEmail = trimString(row[1]);
    let nombre = trimString(row[2]) || trimString(row[3]);
    let apellido = trimString(row[4]);
    let nombreApellido = trimString(row[5]);
    let organizacion = trimString(row[6]);
    let cargo = trimString(row[7]);
    let enviado = trimString(row[8]);
    let horaFin = trimString(row[9]);
    let retargeting = trimString(row[10]);

    if (!nombreApellido && nombre && apellido) {
        nombreApellido = `${nombre} ${apellido}`.trim();
    }

    // Comprobar rebote de Outlook/sistema
    const isRebotado = enviado.toUpperCase().includes('REBOTADO') ||
        enviado.toUpperCase().includes('ERROR') ||
        (row.join('|').toUpperCase().includes('REBOTADO'));

    const mappedRow = [
        rawEmail,
        nombre,
        apellido,
        nombreApellido,
        organizacion,
        cargo,
        enviado,
        horaFin,
        retargeting
    ];

    if (isRebotado) {
        bouncedRows.push(mappedRow);
        continue;
    }

    // Reglas de limpieza de correos para los buenos:
    if (!rawEmail) continue; // Si no hay mail, descartar pura basura

    const emailLower = rawEmail.toLowerCase();

    // Validar formato de mail
    if (!emailRegex.test(emailLower)) {
        continue; // descartar la fila entera si no es un correo válido
    }

    // Eliminar duplicados
    if (emailSet.has(emailLower)) {
        continue;
    }

    emailSet.add(emailLower);

    // Mapear limpios
    cleanedRows.push([
        emailLower,
        nombre,
        apellido,
        nombreApellido,
        organizacion,
        cargo,
        enviado,
        horaFin,
        retargeting
    ]);
}

// Crear nuevo Excel
const newWb = xlsx.utils.book_new();

const cleanSheetData = [desiredHeaders, ...cleanedRows];
const cleanSheet = xlsx.utils.aoa_to_sheet(cleanSheetData);
xlsx.utils.book_append_sheet(newWb, cleanSheet, "Contactos Limpios");

const bouncedSheetData = [desiredHeaders, ...bouncedRows];
const bouncedSheet = xlsx.utils.aoa_to_sheet(bouncedSheetData);
xlsx.utils.book_append_sheet(newWb, bouncedSheet, "Históricos de rebotes");

// Escribir archivo
xlsx.writeFile(newWb, outputPath);
console.log(`Archivo limpiado guardado en: ${outputPath}`);
console.log(`Contactos limpios: ${cleanedRows.length}`);
console.log(`Rebotes movidos: ${bouncedRows.length}`);
