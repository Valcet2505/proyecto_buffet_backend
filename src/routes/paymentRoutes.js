const express = require('express');
const { createPaymentPreference, handleWebhook, getPaymentStatus } = require('../controllers/paymentController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Crear preferencia de pago (requiere autenticación)
router.post('/create-preference', authenticateToken, createPaymentPreference);

// Webhook para notificaciones de Mercado Pago (sin autenticación)
router.post('/webhook', handleWebhook);

// Obtener estado del pago (requiere autenticación)
router.get('/status/:orderId', authenticateToken, getPaymentStatus);

module.exports = router; 