import xlsx from 'xlsx';

const path = 'C:\\Users\\JuanMartínezCarrillo\\Desktop\\Base de datos definitiva GFS\\Nuevo definitivo correos FUNDAE.xlsx';
const workbook = xlsx.readFile(path);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(sheet, { header: 1 }) as string[][];

const headers = data[0];
console.log(headers);

// Find rows with 'rebote'
let reboteCount = 0;
data.forEach((row, i) => {
    if (i === 0) return;
    const rowStr = row.map(v => String(v).toLowerCase()).join('|');
    if (rowStr.includes('rebot')) {
        console.log(`Row ${i} has rebote:`, row);
        reboteCount++;
    }
});
console.log("Total rebotados:", reboteCount);
