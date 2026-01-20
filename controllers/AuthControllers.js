const User = require('../models/user');
const bcrypt = require('bcrypt'); 

const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findByUsername(username);
        if (!user) {
            return res.status(401).send('Username tidak ditemukan atau akun tidak aktif');
        }

        // Bandingkan password input dengan password_hash di database
        // Catatan: Jika password di DB belum di-hash, gunakan perbandingan string biasa sementara
        if (password !== user.password_hash) {
            return res.status(401).send('Password salah');
        }

        // Jika berhasil, simpan data ke session
        req.session.userId = user.id;
        req.session.role = user.role;

        
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        res.status(500).send('Terjadi kesalahan pada server');
    }
};

module.exports = { login };