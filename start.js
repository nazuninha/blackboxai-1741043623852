const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs').promises;

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 60 * 1000 // 30 minutes
    }
}));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Ensure data directory exists
async function ensureDataDirectory() {
    const dataDir = path.join(__dirname, 'data');
    try {
        await fs.access(dataDir);
    } catch {
        await fs.mkdir(dataDir);
        
        // Create initial JSON files if they don't exist
        const initialFiles = {
            'numbers.json': [],
            'menus.json': [{
                name: "Menu Principal",
                type: "sub",
                text: "Digite o texto do menu aqui",
                ative: false,
                submenus: [],
                back: false
            }],
            'bot-config.json': {
                markAsOnline: true,
                markAsRead: true,
                responseDelay: {
                    type: "fixed",
                    value: 500
                },
                menuTrigger: {
                    type: "newChat",
                    value: ""
                }
            }
        };

        for (const [filename, content] of Object.entries(initialFiles)) {
            const filePath = path.join(dataDir, filename);
            try {
                await fs.access(filePath);
            } catch {
                await fs.writeFile(filePath, JSON.stringify(content, null, 2));
            }
        }
    }
}

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
    res.render('login', { error: null });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (email === process.env.USER_EMAIL && password === process.env.USER_PASS) {
        req.session.isAuthenticated = true;
        res.redirect('/dashboard');
    } else {
        res.render('login', { error: 'Credenciais inválidas' });
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

app.get('/active-numbers', authMiddleware, (req, res) => {
    res.render('active-numbers');
});

app.get('/bot-config', authMiddleware, (req, res) => {
    res.render('bot-config');
});

app.get('/menus', authMiddleware, (req, res) => {
    res.render('menus');
});

// API Routes
const apiRoutes = require('./routes/api');
app.use('/api', authMiddleware, apiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Algo deu errado!',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
async function startServer() {
    try {
        await ensureDataDirectory();
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`Login credentials:`);
            console.log(`Email: ${process.env.USER_EMAIL}`);
            console.log(`Password: ${process.env.USER_PASS}`);
        });
    } catch (error) {
        console.error('Error starting server:', error);
        process.exit(1);
    }
}

startServer();