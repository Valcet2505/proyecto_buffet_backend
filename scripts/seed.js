const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Poblando base de datos con datos de ejemplo...');

  try {
    // Borrar datos existentes
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();

    // Crear categorías independientes
    const categorias = await prisma.category.createMany({
      data: [
        { name: 'Ofertas' },
        { name: 'Bebidas' },
        { name: 'Snacks' },
        { name: 'Comidas' }
      ]
    });
    console.log('✅ Categorías creadas');

    // Crear productos independientes
    await prisma.product.createMany({
      data: [
        { name: 'Pepsi', type: 'Bebida', price: 1.5, stock: 20 },
        { name: 'Manaos', type: 'Bebida', price: 1.0, stock: 15 },
        { name: 'Pancho', type: 'Comida', price: 2.5, stock: 10 },
        { name: 'Papas Fritas', type: 'Snack', price: 3.0, stock: 30 }
      ]
    });
    console.log('✅ Productos creados');

    // Crear usuario admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: {
        name: 'Administrador',
        email: 'admin@buffet.com',
        password: hashedPassword,
        role: 'ADMIN'
      }
    });
    console.log('✅ Usuario administrador creado');
    console.log('📧 Email: admin@buffet.com');
    console.log('🔑 Contraseña: admin123');

    console.log('\n🎉 Base de datos poblada exitosamente!');
  } catch (error) {
    console.error('❌ Error poblando la base de datos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed(); 