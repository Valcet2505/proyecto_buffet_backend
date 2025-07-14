const express = require("express");
const { register, login, getMe } = require("../controllers/authController");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// POST /api/auth/register - Registro de usuario
router.post("/register", register);

// POST /api/auth/login - Login de usuario
router.post("/login", login);

// GET /api/auth/me - Obtener usuario actual
router.get("/me", authenticateToken, getMe);



module.exports = router; 