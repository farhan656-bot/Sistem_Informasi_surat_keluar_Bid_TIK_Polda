const express = require('express');
const app = express();
const path = require('path');
const session = require('express-session');
require('dotenv').config();


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.use(express.static(path.join(__dirname, 'public'))); 


app.use(session({
    secret: process.env.SESSION_SECRET || 'secret_tik_polda',
    resave: false,
    saveUninitialized: true,
    cookie: { 
        maxAge: 1000 * 60 * 60 * 24 
    }
}));


const authRoute = require('./routes/authRoute');
const indexRoute = require('./routes/index');


app.use('/auth', authRoute);


app.use('/', indexRoute);


app.get('/', (req, res) => {
    res.redirect('/auth/login');
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Aplikasi SIPRESISI TIK berjalan di http://localhost:${PORT}`);
});