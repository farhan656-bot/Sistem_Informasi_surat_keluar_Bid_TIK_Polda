const db = require('../config/db');

const getDashboard = async (req, res) => {
    try {
        
        const [stats] = await db.execute(`
            SELECT 
                COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pendingCount,
                COUNT(CASE WHEN status = 'APPROVED' AND MONTH(updated_at) = MONTH(CURRENT_DATE()) THEN 1 END) as approvedCount,
                COUNT(CASE WHEN status = 'REJECTED' AND MONTH(updated_at) = MONTH(CURRENT_DATE()) THEN 1 END) as rejectedCount,
                COUNT(CASE WHEN MONTH(created_at) = MONTH(CURRENT_DATE()) THEN 1 END) as totalCount
            FROM letters`);

        const [pendingLetters] = await db.execute(`
            SELECT l.*, lt.name as type_name, u.full_name as sender_name 
            FROM letters l
            JOIN letter_types lt ON l.letter_type_id = lt.id
            JOIN users u ON l.created_by_id = u.id
            WHERE l.status = 'PENDING'
            ORDER BY l.created_at DESC`);

        res.render('pimpinan/dashboard', { 
            user: req.session.fullName,
            stats: stats[0], 
            pendingLetters: pendingLetters
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading pimpinan dashboard');
    }
};

module.exports = { getDashboard };