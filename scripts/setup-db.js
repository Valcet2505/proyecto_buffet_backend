const { execSync } = require('child_process');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

console.log('🔧 Configurando base de datos...');

console.log('Eliminando migraciones existentes...');
try {
  // Eliminar la carpeta de migraciones
  execSync('rm -rf prisma/migrations', { stdio: 'inherit' });
  console.log('Migraciones eliminadas correctamente.');
} catch (err) {
  console.log('No se encontraron migraciones existentes o no se pudieron eliminar.');
}

console.log('Reiniciando base de datos con Prisma...');
try {
  // Resetear la base de datos y aplicar el esquema
  execSync('npx prisma db push --force-reset', { stdio: 'inherit' });
  console.log('Base de datos reseteada correctamente.');
} catch (err) {
  console.error('Error al resetear la base de datos:', err);
  process.exit(1);
}

console.log('Generando cliente Prisma...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('Cliente Prisma generado correctamente.');
} catch (err) {
  console.error('Error al generar el cliente Prisma:', err);
  process.exit(1);
}

console.log('Ejecutando seed...');
try {
  execSync('node scripts/seed.js', { stdio: 'inherit' });
  console.log('Seed ejecutado correctamente.');
} catch (err) {
  console.error('Error al ejecutar el seed:', err);
  process.exit(1);
}

console.log('✅ Base de datos configurada correctamente!'); 