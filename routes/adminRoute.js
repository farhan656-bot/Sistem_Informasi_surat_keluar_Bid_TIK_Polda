const express = require('express');
const router = express.Router();
const multer = require('multer');
const adminController = require('../controllers/AdminControllers');


const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
      
        if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            cb(null, true);
        } else {
            cb(new Error('Hanya file .docx yang diizinkan!'), false);
        }
    }
});
router.get('/dashboard', adminController.getDashboard);
router.get('/templates', adminController.getTemplateManagement);
router.get('/templates/new', adminController.getUploadTemplatePage);
router.get('/templates/edit/:id', adminController.getEditTemplateForm);
router.post('/templates/upload', upload.single('template_file'), adminController.uploadTemplate);

module.exports = router;
