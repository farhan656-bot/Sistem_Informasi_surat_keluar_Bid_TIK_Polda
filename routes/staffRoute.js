const express = require('express');
const router = express.Router();
const staffController = require('../controllers/StaffControllers'); 
const multer = require('multer');
const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/dashboard', staffController.getDashboard);


router.get('/buat-surat', staffController.getCreateLetterPage);
router.post('/store-letter', upload.single('attachment'), staffController.storeLetter);


router.get('/download-template/:id', staffController.downloadTemplate);
router.get('/buat-surat/template/:type_id', staffController.getSelectTemplatePage);
router.get('/buat-surat/isi-konten/:type_id', staffController.getFillContentPage);
module.exports = router;