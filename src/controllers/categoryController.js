const prisma = require("../config/prisma");

// Obtener todas las categorías
const getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
};

// Obtener una categoría específica con sus productos
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await prisma.category.findUnique({ 
      where: { id },
      include: {
        products: {
          where: { isActive: true },
          orderBy: { name: 'asc' }
        }
      }
    });
    if (!category) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    res.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: 'Error al obtener la categoría' });
  }
};

// Crear una nueva categoría
const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'El nombre de la categoría es requerido' });
    }
    const category = await prisma.category.create({ data: { name } });
    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Error al crear la categoría' });
  }
};

// Actualizar una categoría
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const category = await prisma.category.update({
      where: { id },
      data: { name }
    });
    res.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Error al actualizar la categoría' });
  }
};

// Eliminar una categoría
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.category.delete({ where: { id } });
    res.json({ message: 'Categoría eliminada correctamente' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Error al eliminar la categoría' });
  }
};

// Agregar productos a una categoría
const addProductsToCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { productIds } = req.body;
    
    if (!productIds || !Array.isArray(productIds)) {
      return res.status(400).json({ error: 'Se requiere un array de IDs de productos' });
    }

    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    // Verificar que todos los productos existan
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } }
    });

    if (products.length !== productIds.length) {
      return res.status(400).json({ error: 'Algunos productos no existen' });
    }

    // Agregar productos a la categoría
    await prisma.category.update({
      where: { id },
      data: {
        products: {
          connect: productIds.map(productId => ({ id: productId }))
        }
      }
    });

    res.json({ message: 'Productos agregados a la categoría correctamente' });
  } catch (error) {
    console.error('Error adding products to category:', error);
    res.status(500).json({ error: 'Error al agregar productos a la categoría' });
  }
};

// Quitar productos de una categoría
const removeProductsFromCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { productIds } = req.body;
    
    if (!productIds || !Array.isArray(productIds)) {
      return res.status(400).json({ error: 'Se requiere un array de IDs de productos' });
    }

    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    // Quitar productos de la categoría
    await prisma.category.update({
      where: { id },
      data: {
        products: {
          disconnect: productIds.map(productId => ({ id: productId }))
        }
      }
    });

    res.json({ message: 'Productos removidos de la categoría correctamente' });
  } catch (error) {
    console.error('Error removing products from category:', error);
    res.status(500).json({ error: 'Error al quitar productos de la categoría' });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  addProductsToCategory,
  removeProductsFromCategory
}; 