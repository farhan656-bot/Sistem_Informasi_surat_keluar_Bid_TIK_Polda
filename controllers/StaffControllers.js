const db = require('../config/db');

/**
 * 1. Menampilkan Dashboard Staff
 * Mengambil statistik dan riwayat surat milik staff yang sedang login
 */
const getDashboard = async (req, res) => {
    const staffId = req.session.userId;

    try {
        const [myLetters] = await db.execute(`
            SELECT l.*, lt.name as type_name 
            FROM letters l 
            JOIN letter_types lt ON l.letter_type_id = lt.id 
            WHERE l.created_by_id = ? 
            ORDER BY l.created_at DESC`, 
            [staffId]
        );

        const [statsResult] = await db.execute(`
            SELECT 
                COUNT(CASE WHEN status = 'DRAFT' THEN 1 END) as draftCount,
                COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pendingCount,
                COUNT(CASE WHEN status = 'APPROVED' THEN 1 END) as approvedCount,
                COUNT(CASE WHEN status = 'REJECTED' THEN 1 END) as rejectedCount
            FROM letters 
            WHERE created_by_id = ?`, 
            [staffId]
        );

        res.render('staff/dashboard', { 
            user: req.session.fullName, 
            role: req.session.role,
            letters: myLetters,
            stats: statsResult[0] || { draftCount: 0, pendingCount: 0, approvedCount: 0, rejectedCount: 0 }
        });

    } catch (error) {
        console.error('Staff Dashboard Error:', error);
        res.status(500).send('Terjadi kesalahan sistem saat memuat dashboard');
    }
};

/**
 * 2. LANGKAH 1: Menampilkan Halaman Pilih Jenis Surat
 *
 */
const getCreateLetterPage = async (req, res) => {
    try {
        const [templates] = await db.execute(`
            SELECT id, name, template_name 
            FROM letter_types 
            WHERE template_file IS NOT NULL 
            ORDER BY name ASC
        `);

        res.render('staff/buat_surat', {
            user: req.session.fullName, 
            role: req.session.role,     
            templates: templates,
            currentPage: 'buat-surat'
        });
    } catch (error) {
        console.error('Error Step 1:', error);
        res.status(500).send('Gagal memuat halaman buat surat');
    }
};

/**
 * 3. LANGKAH 2: Menampilkan Halaman Pilih Template
 *
 */
const getSelectTemplatePage = async (req, res) => {
    try {
        const typeId = req.params.type_id;

        const [letterType] = await db.execute('SELECT name FROM letter_types WHERE id = ?', [typeId]);
        
        if (letterType.length === 0) {
            return res.status(404).send('Jenis surat tidak ditemukan');
        }

        const [templates] = await db.execute(
            'SELECT id, template_name FROM letter_types WHERE id = ? AND template_file IS NOT NULL', 
            [typeId]
        );

        res.render('staff/pilih_template', {
            user: req.session.fullName,
            role: req.session.role,
            letterType: letterType[0],
            templates: templates,
            typeId: typeId,
            currentPage: 'buat-surat'
        });
    } catch (error) {
        console.error('Error Step 2:', error);
        res.status(500).send('Gagal memuat daftar template');
    }
};

/**
 * 4. LANGKAH 3: Menampilkan Form Pengisian Konten (FIX 404)
 * Fungsi ini menangani rute /staff/buat-surat/isi-konten/:type_id
 */
const getFillContentPage = async (req, res) => {
    try {
        const typeId = req.params.type_id;

        
        const [letterType] = await db.execute('SELECT name FROM letter_types WHERE id = ?', [typeId]);

        if (letterType.length === 0) {
            return res.status(404).send('Jenis surat tidak ditemukan');
        }

        res.render('staff/isi_konten', {
            user: req.session.fullName,
            role: req.session.role,
            letterType: letterType[0],
            typeId: typeId,
            currentPage: 'buat-surat'
        });
    } catch (error) {
        console.error('Error Step 3:', error);
        res.status(500).send('Gagal memuat halaman isi konten');
    }
};

/**
 * 5. Fungsi Mengunduh Template Word (BLOB)
 * Menambahkan ekstensi .docx otomatis jika tidak ada
 */
const downloadTemplate = async (req, res) => {
    const { id } = req.params;

    try {
        const [rows] = await db.execute(
            'SELECT template_file, template_name FROM letter_types WHERE id = ?', 
            [id]
        );

        if (rows.length === 0 || !rows[0].template_file) {
            return res.status(404).send('Maaf, template belum tersedia.');
        }

        const file = rows[0];
        let filename = file.template_name;
        if (!filename.toLowerCase().endsWith('.docx')) {
            filename += '.docx';
        }

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(file.template_file);

    } catch (error) {
        console.error('Download Template Error:', error);
        res.status(500).send('Terjadi kesalahan saat mengunduh template.');
    }
};

/**
 * 6. Proses Simpan Surat Baru ke Database
 */
const storeLetter = async (req, res) => {
    const { letter_type_id, recipient, subject, content } = req.body;
    const actorId = req.session.userId;
    
    // Menangkap data file jika ada yang diunggah
    const attachmentFile = req.file ? req.file.buffer : null;
    const attachmentName = req.file ? req.file.originalname : null;

    try {
        // Pastikan tabel 'letters' Anda memiliki kolom untuk menyimpan lampiran (misal: attachment_blob dan attachment_name)
        await db.execute(
            `INSERT INTO letters 
            (id, letter_type_id, recipient, subject, content, attachment_blob, attachment_name, created_by_id, status, created_at) 
            VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, "PENDING", NOW())`,
            [letter_type_id, recipient, subject, content, attachmentFile, attachmentName, actorId]
        );

        res.redirect('/staff/dashboard');
    } catch (error) {
        console.error('Gagal menyimpan surat dengan lampiran:', error);
        res.status(500).send('Gagal menyimpan surat');
    }
};

module.exports = { 
    getDashboard, 
    getCreateLetterPage, 
    getSelectTemplatePage, 
    getFillContentPage, 
    storeLetter, 
    downloadTemplate 
};