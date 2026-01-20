const checkRole = (roles) => {
    return (req, res, next) => {
        // Pastikan role pengguna ada di dalam daftar role yang diizinkan
        if (roles.includes(req.session.role)) {
            next();
        } else {
            // Jika role tidak sesuai, berikan pesan error atau redirect ke halaman awal
            res.status(403).send('Akses Ditolak: Anda tidak memiliki wewenang untuk halaman ini.');
        }
    };
};

module.exports = checkRole;