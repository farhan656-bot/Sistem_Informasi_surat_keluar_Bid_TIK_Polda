const express = require('express');
const app = express();
const path = require('path');
const session = require('express-session');
const helmet = require('helmet');
require('dotenv').config();


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: [
                    "'self'",
                    "'unsafe-inline'",
                    "https://cdn.tailwindcss.com",
                    "https://cdnjs.cloudflare.com",
                    "https://fonts.googleapis.com"
                ],
                scriptSrc: [
                    "'self'",
                    "'unsafe-inline'",
                    "https://cdn.tailwindcss.com"
                ],
                fontSrc: [
                    "'self'",
                    "https://cdnjs.cloudflare.com",
                    "https://fonts.gstatic.com"
                ],
                imgSrc: [
                    "'self'",
                    "data:",
                    "https://*"
                ]
            }
        }
    })
);


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 4. SESSION (ANTI-HACKER)
app.use(session({
    secret: process.env.SESSION_SECRET || 'kunci_polda_sangat_rahasia_2026',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,     // Mencegah pencurian cookie lewat JavaScript
        secure: false,      // Set ke TRUE jika sudah menggunakan HTTPS
        sameSite: 'strict', // Mencegah serangan CSRF (Phishing)
        maxAge: 1000 * 60 * 60 * 2 // Sesi berlaku 2 jam
    }
}));

// 5. ROUTES REGISTRATION
const authRoute = require('./routes/authRoute');
const indexRoute = require('./routes/index');
const adminRoute = require('./routes/adminRoute'); 
const staffRoute = require('./routes/staffRoute'); 

app.use('/auth', authRoute);
app.use('/admin', adminRoute); 
app.use('/staff', staffRoute); 
app.use('/', indexRoute);

// 6. DEFAULT REDIRECT
app.get('/', (req, res) => {
    res.redirect('/auth/login');
});


app.use((req, res) => {
    res.status(404).render('errors/404', { 
        title: 'Halaman Tidak Ditemukan',
        user: req.session.fullName || null 
    });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Aplikasi SIPRESISI TIK berjalan di http://localhost:${PORT}`);
});