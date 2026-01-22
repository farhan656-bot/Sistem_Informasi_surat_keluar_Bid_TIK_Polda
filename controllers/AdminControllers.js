const db = require('../config/db');

const getDashboard = async (req, res) => {
    try {
        const [statsData] = await db.execute(`
            SELECT 
                (SELECT COUNT(*) FROM users) as totalUser,
                (SELECT COUNT(*) FROM letter_types) as jenisSurat,
                (SELECT COUNT(*) FROM letters WHERE MONTH(created_at) = MONTH(CURRENT_DATE()) AND YEAR(created_at) = YEAR(CURRENT_DATE())) as suratBulanIni,
                (SELECT COUNT(*) FROM letters WHERE status = 'APPROVED') as totalArsip
        `);

        const [activities] = await db.execute(`
            SELECT a.action, a.entity_type, a.created_at, u.full_name 
            FROM audit_logs a 
            JOIN users u ON a.actor_id = u.id 
            ORDER BY a.created_at DESC LIMIT 4
        `);

        const [recentLetters] = await db.execute(`
            SELECT l.subject, l.status, l.created_at, lt.name as type_name 
            FROM letters l 
            JOIN letter_types lt ON l.letter_type_id = lt.id 
            ORDER BY l.created_at DESC LIMIT 2
        `);

        res.render('admin/dashboard', {
            user: req.session.fullName,
            role: req.session.role, 
            stats: statsData[0],
            activities,
            recentLetters
        });
    } catch (error) {
        console.error('Admin Dashboard Error:', error);
        res.status(500).send('Terjadi kesalahan saat memuat Dashboard Admin');
    }
};


const getTemplateManagement = async (req, res) => {
    try {
        const [templates] = await db.execute(`
            SELECT 
                lt.id, 
                lt.name as jenis_surat, 
                lt.template_name, 
                lt.file_format, 
                lt.file_size, 
                lt.upload_date,
                (SELECT COUNT(*) FROM letters l WHERE l.letter_type_id = lt.id) as digunakan
            FROM letter_types lt
            WHERE lt.template_name IS NOT NULL
            ORDER BY lt.upload_date DESC
        `);

        res.render('admin/kelola_template', {
            user: req.session.fullName,
            role: req.session.role, 
            templates: templates,
            currentPage: 'templates'
        });
    } catch (error) {
        console.error('Template Management Error:', error);
        res.status(500).send('Gagal memuat manajemen template');
    }
};


const getUploadTemplatePage = async (req, res) => {
    try {
        // Ambil daftar jenis surat untuk dropdown di form unggah
        const [letterTypes] = await db.execute('SELECT id, name FROM letter_types');
        
        res.render('admin/upload_template', {
            user: req.session.fullName,
            role: req.session.role,
            letterTypes: letterTypes,
            currentPage: 'templates'
        });
    } catch (error) {
        console.error('Error loading upload page:', error);
        res.status(500).send('Terjadi kesalahan saat memuat halaman unggah');
    }
};


const getEditTemplateForm = async (req, res) => {
    try {
        const [type] = await db.execute('SELECT * FROM letter_types WHERE id = ?', [req.params.id]);
        
        if (type.length === 0) {
            return res.status(404).send('Jenis surat tidak ditemukan');
        }

        res.render('admin/edit_type', { 
            type: type[0], 
            user: req.session.fullName,
            role: req.session.role 
        });
    } catch (error) {
        console.error('Edit Form Error:', error);
        res.status(500).send('Gagal memuat halaman edit');
    }
};


const uploadTemplate = async (req, res) => {
    const { letter_type_id, template_name } = req.body;

    if (!req.file) {
        return res.status(400).send('Mohon pilih file Word (.docx) terlebih dahulu.');
    }

    const fileSize = (req.file.size / 1024).toFixed(0) + ' KB';

    try {
        // Update data template ke tabel letter_types
        await db.execute(
            `UPDATE letter_types SET 
                template_file = ?, 
                template_name = ?, 
                file_size = ?, 
                upload_date = NOW(),
                file_format = 'Docx'
             WHERE id = ?`,
            [req.file.buffer, template_name || req.file.originalname, fileSize, letter_type_id]
        );

        // Catat aksi admin ke log audit
        await db.execute(
            'INSERT INTO audit_logs (id, actor_id, action, entity_type, created_at) VALUES (UUID(), ?, "Update Template", "Letter Template", NOW())',
            [req.session.userId]
        );

        res.redirect('/admin/templates?status=success');
    } catch (error) {
        console.error('Upload Template Error:', error);
        res.status(500).send('Gagal memperbarui template surat.');
    }
};

module.exports = { 
    getDashboard, 
    getTemplateManagement, 
    getUploadTemplatePage, 
    uploadTemplate, 
    getEditTemplateForm 
};