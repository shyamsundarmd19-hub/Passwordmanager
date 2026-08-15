const express = require('express');
const router = express.Router();
const passwordController = require('../controllers/passwordController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/', passwordController.getPasswords);
router.get('/metrics', passwordController.getSecurityMetrics);
router.get('/generate', passwordController.generatePasswordHandler);
router.get('/:id', passwordController.getPasswordById);
router.get('/:id/reveal', passwordController.revealPassword);
router.post('/', passwordController.createPassword);
router.put('/:id', passwordController.updatePassword);
router.patch('/:id/favorite', passwordController.toggleFavorite);
router.delete('/:id', passwordController.deletePassword);

module.exports = router;
