const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      // Verificar que el usuario esté autenticado
      if (!req.user) {
        return res.status(401).json({ error: "Usuario no autenticado" });
      }

      // Verificar que el usuario tenga uno de los roles permitidos
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ error: "Acceso denegado. Rol insuficiente." });
      }

      next();
    } catch (error) {
      console.error("Error checking role:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  };
};

module.exports = { checkRole }; 