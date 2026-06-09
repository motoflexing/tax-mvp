const express = require('express');
const {
  createApplication,
  getApplications,
  getApplicationById,
  deleteApplication
} = require('../controllers/applicationController');

const router = express.Router();

router.post('/', createApplication);
router.get('/', getApplications);
router.get('/:id', getApplicationById);
router.delete('/:id', deleteApplication);

module.exports = router;
