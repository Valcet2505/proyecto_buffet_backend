const express = require("express");
const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  addProductsToCategory,
  removeProductsFromCategory
} = require("../controllers/categoryController");
const { checkRole } = require("../middleware/checkRole");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// GET /api/categories - Obtener todas las categorías
router.get('/', getAllCategories);

// GET /api/categories/:id - Obtener una categoría específica
router.get('/:id', getCategoryById);

// POST /api/categories - Crear una nueva categoría
router.post('/', authenticateToken, checkRole(['ADMIN']), createCategory);

// PUT /api/categories/:id - Actualizar una categoría
router.put('/:id', authenticateToken, checkRole(['ADMIN']), updateCategory);

// DELETE /api/categories/:id - Eliminar una categoría
router.delete('/:id', authenticateToken, checkRole(['ADMIN']), deleteCategory);

// POST /api/categories/:id/products - Agregar productos a una categoría
router.post('/:id/products', authenticateToken, checkRole(['ADMIN']), addProductsToCategory);

// DELETE /api/categories/:id/products - Quitar productos de una categoría
router.delete('/:id/products', authenticateToken, checkRole(['ADMIN']), removeProductsFromCategory);

module.exports = router; 