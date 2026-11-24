import dotenv from 'dotenv';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { importarSeed } from './services/seed.js';

dotenv.config();

async function ejecutarSeed() {
  await connectDatabase(process.env.MONGODB_URI);
  const resultado = await importarSeed();
  console.log('Seed completado:', JSON.stringify(resultado, null, 2));
}

ejecutarSeed()
  .catch((error) => {
    console.error('Error ejecutando seed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDatabase();
  });
