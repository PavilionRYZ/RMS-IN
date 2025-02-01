const express = require('express');
const router = express.Router();
const { getSalesAndSpendAnalysis } = require('../controllers/analysisController');
const { verifyAdmin, checkAdminOrPermission} = require('../middleware/authMiddleware');

router.route('/admin/analytics').get(getSalesAndSpendAnalysis);

module.exports = router;