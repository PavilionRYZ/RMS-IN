const express = require('express');
const router = express.Router();
const { computeDailyAnalytics,getAnalytics } = require('../controllers/analysisController');
const { verifyToken, checkAdminOrPermission} = require('../middleware/authMiddleware');

router.route('/analytics/daily').get(verifyToken, checkAdminOrPermission("view_reports"), computeDailyAnalytics);
router.route('/analytics').get(verifyToken, checkAdminOrPermission("view_reports"), getAnalytics);

module.exports = router;