const db = require('../config/db');

class User {
    static async findByUsername(username) {
        const [rows] = await db.execute('SELECT * FROM users WHERE username = ? AND is_active = 1', [username]);
        return rows[0];
    }

    static async updateLastLogin(userId) {
        return db.execute('UPDATE users SET updated_at = NOW() WHERE id = ?', [userId]);
    }
}

module.exports = User;