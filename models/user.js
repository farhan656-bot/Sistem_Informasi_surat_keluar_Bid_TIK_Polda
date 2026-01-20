const db = require('../config/db'); // Menggunakan koneksi mysql2/promise

class User {
    // Mencari user berdasarkan username sesuai tabel users di db_sisk
    static async findByUsername(username) {
        try {
            const [rows] = await db.execute(
                'SELECT * FROM users WHERE username = ? AND is_active = 1', 
                [username]
            );
            return rows[0];
        } catch (error) {
            throw error;
        }
    }
}

module.exports = User;