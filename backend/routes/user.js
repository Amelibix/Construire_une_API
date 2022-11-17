const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');

const userControllers = require('../controllers/user');

router.post('/signup', auth, userControllers.signup);
router.post('/login', userControllers.login);

module.exports = router;