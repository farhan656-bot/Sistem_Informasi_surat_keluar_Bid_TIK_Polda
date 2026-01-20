const User = require('../models/user');
const bcrypt = require('bcryptjs'); 

const login = async (req, res) => {
    const { username, password } = req.body;
    
    try {
        const user = await User.findByUsername(username);

        if (!user) {
            return res.render('login', { error: 'Username tidak ditemukan' });
        }

        // Langsung bandingkan tanpa variabel tambahan
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (isMatch) {
            req.session.userId = user.id;
            req.session.role = user.role;
            req.session.fullName = user.full_name;

            return req.session.save(() => {
                if (user.role === 'ADMIN') return res.redirect('/admin/dashboard');
                if (user.role === 'PIMPINAN') return res.redirect('/pimpinan/dashboard');
                return res.redirect('/staff/dashboard');
            });
        } else {
            return res.render('login', { error: 'Password salah' });
        }
    } catch (error) {
        res.render('login', { error: 'Terjadi kesalahan sistem' });
    }
};
const logout = (req, res) => {
    req.session.destroy();
    res.redirect('/auth/login');
};


module.exports = { login, logout };
