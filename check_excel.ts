import xlsx from 'xlsx';

const path = 'C:\\Users\\JuanMartínezCarrillo\\Desktop\\Base de datos definitiva GFS\\Nuevo definitivo correos FUNDAE.xlsx';
const workbook = xlsx.readFile(path);
console.log("Sheet names: ", workbook.SheetNames);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
console.log("Headers:");
console.log(data[0]);
console.log("First row:");
console.log(data[1]);
