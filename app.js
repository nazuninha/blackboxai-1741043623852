const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false
}));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Authentication middleware
const authMiddleware = (req, res, next) => {
    if (req.session.isAuthenticated) {
        next();
    } else {
        res.redirect('/login');
    }
};

// Routes
app.get('/login', (req, res) => {
    if (req.session.isAuthenticated) {
        return res.redirect('/dashboard');
    }
    res.render('login');
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (email === process.env.USER_EMAIL && password === process.env.USER_PASS) {
        req.session.isAuthenticated = true;
        res.redirect('/dashboard');
    } else {
        res.render('login', { error: 'Invalid credentials' });
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

// Protected routes
app.get('/', authMiddleware, (req, res) => {
    res.redirect('/dashboard');
});

app.get('/dashboard', authMiddleware, (req, res) => {
    res.render('dashboard');
});

// API Routes
const apiRoutes = require('./routes/api');
app.use('/api', authMiddleware, apiRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});