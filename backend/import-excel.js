import dotenv from 'dotenv';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { importarExcel } from './services/importadorExcel.js';

dotenv.config();

const argumentos = process.argv.slice(2);
const reemplazar = argumentos.includes('--replace');
const rutaArchivo =
  argumentos.find((argumento) => !argumento.startsWith('--')) ||
  process.env.EXCEL_PATH ||
  '../REPORTES DE LINEAS NOV 2026 ANALISTAS.xlsx';

async function ejecutarImportacion() {
  await connectDatabase(process.env.MONGODB_URI);
  const resultado = await importarExcel(rutaArchivo, { reemplazar });
  console.log('Importación completada:', JSON.stringify(resultado, null, 2));
}

ejecutarImportacion()
  .catch((error) => {
    console.error('Error importando el Excel:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDatabase();
  });
