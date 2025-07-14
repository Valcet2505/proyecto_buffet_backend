const mercadopago = require('mercadopago');
const prisma = require("../config/prisma");

// Configurar Mercado Pago con la versión actual
mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
});

// Crear preferencia de pago
const createPaymentPreference = async (req, res) => {
  try {
    const { orderId } = req.body;

    console.log('Creating payment preference for orderId:', orderId);

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: { include: { product: true } },
        user: true
      }
    });

    if (!order) return res.status(404).json({ error: 'Pedido no encontrado' });

    console.log('Order found:', {
      id: order.id,
      total: order.total,
      itemsCount: order.orderItems.length
    });

    // Crear items para Mercado Pago con formato correcto
    const items = order.orderItems.map(item => {
      const unitPrice = Number(Number(item.price).toFixed(2));
      const quantity = parseInt(item.quantity);
      
      console.log('Processing item:', {
        name: item.product.name,
        originalPrice: item.price,
        convertedPrice: unitPrice,
        originalQuantity: item.quantity,
        convertedQuantity: quantity
      });

      return {
        title: item.product.name,
        unit_price: unitPrice,
        quantity: quantity,
        currency_id: 'ARS'
      };
    });

    console.log('Processed items:', items);

    // Crear preferencia con la API actual
    const preferenceData = {
      items: items,
      back_urls: {
        success: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/success`,
        failure: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/failure`,
        pending: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/pending`
      },
      external_reference: orderId,
      notification_url: `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/payments/webhook`
    };

    console.log("Preference data to send:", JSON.stringify(preferenceData, null, 2));

    // Usar la API actual de Mercado Pago
    const response = await mercadopago.preferences.create(preferenceData);

    console.log('Mercado Pago response:', response);

    // Actualizar el pedido con el ID de preferencia
    await prisma.order.update({
      where: { id: orderId },
      data: { paymentId: response.body.id }
    });

    res.json({
      paymentUrl: response.body.init_point,
      preferenceId: response.body.id
    });

  } catch (error) {
    console.error('Error creating payment preference:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.status,
      cause: error.cause
    });
    
    res.status(500).json({ error: 'Error al crear preferencia de pago' });
  }
};

// Webhook para recibir notificaciones de pago
const handleWebhook = async (req, res) => {
  try {
    const { type, data } = req.body;

    if (type === 'payment') {
      const paymentId = data.id;
      
      // Obtener información del pago con la API actual
      const paymentInfo = await mercadopago.payment.findById(paymentId);
      const orderId = paymentInfo.body.external_reference;

      if (paymentInfo.body.status === 'approved') {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: 'APPROVED',
            status: 'PREPARING'
          }
        });
      } else if (paymentInfo.body.status === 'rejected') {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: 'REJECTED',
            status: 'CANCELLED'
          }
        });
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).send('Error');
  }
};

// Obtener estado del pago
const getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order || !order.paymentId) {
      return res.status(404).json({ error: 'Pedido o pago no encontrado' });
    }

    // Obtener información del pago con la API actual
    const paymentInfo = await mercadopago.payment.findById(order.paymentId);

    res.json({
      status: paymentInfo.body.status,
      paymentStatus: order.paymentStatus
    });

  } catch (error) {
    console.error('Error getting payment status:', error);
    res.status(500).json({ error: 'Error al obtener estado del pago' });
  }
};

module.exports = {
  createPaymentPreference,
  handleWebhook,
  getPaymentStatus
}; 