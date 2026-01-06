const express = require('express');
const router = express.Router();
const iotController = require('../controllers/iotController');

router.post('/data', iotController.receiveSensorData);
router.get('/history', iotController.getSensorHistory);

module.exports = router;