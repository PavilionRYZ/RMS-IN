const express = require('express');
const router = express.Router();
const { getAnalytics, generateAnalytics} = require('../controllers/analysisController');
const { verifyToken, checkAdminOrPermission} = require('../middleware/authMiddleware');

router.route('/analytics').get(verifyToken, checkAdminOrPermission("view_analytics"), getAnalytics);
router.route('/generate-analytics').post(verifyToken, checkAdminOrPermission("view_analytics"), generateAnalytics);

module.exports = router;