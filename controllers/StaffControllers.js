const db = require('../config/db');

const getDashboard = async (req, res) => {
    try {
        const userId = req.session.userId;

        // Mengambil jumlah surat berdasarkan status untuk user tersebut
        const [stats] = await db.execute(`
            SELECT 
                COUNT(CASE WHEN status = 'DRAFT' THEN 1 END) as draftCount,
                COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pendingCount,
                COUNT(CASE WHEN status = 'APPROVED' THEN 1 END) as approvedCount,
                COUNT(CASE WHEN status = 'REJECTED' THEN 1 END) as rejectedCount
            FROM letters WHERE created_by_id = ?`, [userId]);

        res.render('staff/dashboard', { 
            user: req.session.fullName,
            stats: stats[0] 
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading dashboard');
    }
};

module.exports = { getDashboard };