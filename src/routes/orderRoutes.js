const express = require("express");
const prisma = require("../config/prisma");

const router = express.Router();

// GET /api/orders - Obtener todos los pedidos (admin) o pedidos del usuario
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    
    // Por ahora, permitimos obtener todos los pedidos
    // En el futuro, aquí iría la lógica de autenticación
    const orders = await prisma.order.findMany({
      where: userId ? { userId } : {},
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        user: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
});

// GET /api/orders/:id - Obtener un pedido específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        user: true
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Error al obtener el pedido' });
  }
});

// POST /api/orders - Crear un nuevo pedido
router.post('/', async (req, res) => {
  try {
    const { items, total, userId } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'El carrito está vacío' });
    }

    // Verificar stock disponible
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      });

      if (!product) {
        return res.status(400).json({ 
          error: `Producto ${item.productId} no encontrado` 
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          error: `Stock insuficiente para ${product.name}` 
        });
      }
    }

    // Obtener el siguiente número de pedido
    const lastOrder = await prisma.order.findFirst({
      orderBy: { orderNumber: 'desc' }
    });
    
    const orderNumber = lastOrder ? lastOrder.orderNumber + 1 : 1;

    // Crear el pedido
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: userId || 'temp-user-id', // Temporal hasta implementar auth
        total,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        orderItems: {
          create: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          }))
        }
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        user: true
      }
    });

    // Actualizar stock de productos
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity
          }
        }
      });
    }

    res.status(201).json({
      orderNumber: order.orderNumber,
      orderId: order.id,
      message: 'Pedido creado exitosamente'
    });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Error al crear el pedido' });
  }
});

// PATCH /api/orders/:id - Actualizar estado del pedido
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Estado requerido' });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        user: true
      }
    });

    res.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Error al actualizar el pedido' });
  }
});

module.exports = router; 