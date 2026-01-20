const db = require('../config/db');

const getDashboard = async (req, res) => {
    try {
        // 1. Ambil Statistik Utama
        const [userCount] = await db.execute('SELECT COUNT(*) as count FROM users');
        const [typeCount] = await db.execute('SELECT COUNT(*) as count FROM letter_types');
        const [monthLetters] = await db.execute('SELECT COUNT(*) as count FROM letters WHERE MONTH(created_at) = MONTH(CURRENT_DATE())');
        const [archiveCount] = await db.execute('SELECT COUNT(*) as count FROM letters WHERE status = "APPROVED"'); // Contoh arsip

        // 2. Ambil Aktivitas Terbaru
        const [activities] = await db.execute(`
            SELECT a.*, u.full_name 
            FROM audit_logs a 
            JOIN users u ON a.actor_id = u.id 
            ORDER BY a.created_at DESC LIMIT 4`);

        // 3. Ambil Surat Terbaru
        const [recentLetters] = await db.execute(`
            SELECT l.*, lt.name as type_name 
            FROM letters l 
            JOIN letter_types lt ON l.letter_type_id = lt.id 
            ORDER BY l.created_at DESC LIMIT 2`);

        res.render('admin/dashboard', {
            user: req.session.fullName,
            stats: {
                totalUser: userCount[0].count,
                jenisSurat: typeCount[0].count,
                suratBulanIni: monthLetters[0].count,
                totalArsip: archiveCount[0].count
            },
            activities,
            recentLetters
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading admin dashboard');
    }
};

module.exports = { getDashboard };