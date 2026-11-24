import app from './app.js';
import { connectDatabase } from './config/database.js';

const port = Number(process.env.PORT) || 3000;

connectDatabase(process.env.MONGODB_URI)
  .then(() => {
    app.listen(port, () => console.log(`API disponible en http://localhost:${port}`));
  })
  .catch((error) => {
    console.error('No se pudo conectar a MongoDB:', error.message);
    process.exit(1);
  });
