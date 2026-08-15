const express = require('express');
const router = express.Router();
const folderController = require('../controllers/folderController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/', folderController.getFolders);
router.post('/', folderController.createFolder);
router.put('/:id', folderController.updateFolder);
router.delete('/:id', folderController.deleteFolder);

module.exports = router;
