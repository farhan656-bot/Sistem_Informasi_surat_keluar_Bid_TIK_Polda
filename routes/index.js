const express = require('express');
const router = express.Router();
const isLogin = require('../middleware/isLoginMiddleware'); 
const checkRole = require('../middleware/checkroleMiddleware'); 
const staffController = require('../controllers/StaffControllers');
const pimpinanController = require('../controllers/PimpinanControllers');
const adminController = require('../controllers/AdminControllers');


router.get('/admin/dashboard', isLogin, checkRole(['ADMIN']), adminController.getDashboard);

router.get('/pimpinan/dashboard', isLogin, checkRole(['PIMPINAN']), pimpinanController.getDashboard);

router.get('/staff/dashboard', isLogin, checkRole(['STAFF']), staffController.getDashboard);

module.exports = router;