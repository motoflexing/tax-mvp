const express = require('express');
const {
  createApplication,
  getApplications,
  getApplicationById,
  deleteApplication
} = require('../controllers/applicationController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.post('/', verifyToken, createApplication);
router.get('/', verifyToken, requireAdmin, getApplications);
router.get('/:id', verifyToken, requireAdmin, getApplicationById);
router.delete('/:id', verifyToken, requireAdmin, deleteApplication);

module.exports = router;
