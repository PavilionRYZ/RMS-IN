const express = require('express');
const router = express.Router();
const { getAnalytics, generateAnalytics} = require('../controllers/analysisController');
const { verifyToken, checkAdminOrPermission} = require('../middleware/authMiddleware');

router.route('/analytics').get(verifyToken, checkAdminOrPermission("analytics_management"), getAnalytics);
router.route('/generate-analytics').post(verifyToken, checkAdminOrPermission("analytics_management'"), generateAnalytics);

module.exports = router;