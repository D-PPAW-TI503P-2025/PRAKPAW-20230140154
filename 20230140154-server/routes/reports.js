const express = require("express");
const router = express.Router();
const { addUserData, isAdmin } = require("../middleware/permissionMiddleware");
const { getDailyReport } = require("../controllers/reportController");

// Middleware untuk menambahkan data user dummy
router.use(addUserData);

// Route hanya untuk admin
router.get("/daily", isAdmin, getDailyReport);

module.exports = router;
