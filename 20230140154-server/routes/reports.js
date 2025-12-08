const express = require("express");
const router = express.Router();
const { authenticateToken, isAdmin } = require("../middleware/permissionMiddleware");
const { getDailyReport } = require("../controllers/reportController");

// Route hanya untuk admin
router.get("/daily", authenticateToken, isAdmin, getDailyReport);

module.exports = router;
