const express = require("express");
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require("../controllers/productController");
const { checkRole } = require("../middleware/checkRole");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// GET /api/products - Obtener todos los productos
router.get('/', getAllProducts);

// GET /api/products/:id - Obtener un producto específico
router.get('/:id', getProductById);

// POST /api/products - Crear un nuevo producto
router.post('/', authenticateToken, checkRole(['ADMIN']), createProduct);

// PUT /api/products/:id - Actualizar un producto
router.put('/:id', authenticateToken, checkRole(['ADMIN']), updateProduct);

// DELETE /api/products/:id - Eliminar un producto (soft delete)
router.delete('/:id', authenticateToken, checkRole(['ADMIN']), deleteProduct);

module.exports = router; 