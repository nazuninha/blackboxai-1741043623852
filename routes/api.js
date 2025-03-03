const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

// Helper function to read JSON file
async function readJsonFile(filename) {
    try {
        const data = await fs.readFile(path.join(__dirname, '../data', filename));
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return null;
        }
        throw error;
    }
}

// Helper function to write JSON file
async function writeJsonFile(filename, data) {
    await fs.writeFile(
        path.join(__dirname, '../data', filename),
        JSON.stringify(data, null, 2)
    );
}

// Get metrics
router.get('/metrics', async (req, res) => {
    const metrics = {
        messagesPerDay: 150,
        chatsInteracted: 45,
        activeMenus: 12,
        submenus: 34,
    };
    res.json(metrics);
});

// Get active numbers
router.get('/active-numbers', async (req, res) => {
    const numbers = await readJsonFile('numbers.json') || [];
    res.json(numbers);
});

// Generate connection code
router.post('/bot/code-gen', async (req, res) => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    res.json({ code });
});

// Add new number
router.post('/numbers', async (req, res) => {
    const { number, name } = req.body;
    const numbers = await readJsonFile('numbers.json') || [];
    
    const newNumber = {
        id: Date.now().toString(),
        number,
        name,
        photo: 'https://via.placeholder.com/50',
        status: 'online'
    };
    
    numbers.push(newNumber);
    await writeJsonFile('numbers.json', numbers);
    res.json(newNumber);
});

// Update number status
router.put('/numbers/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const numbers = await readJsonFile('numbers.json') || [];
    
    const numberIndex = numbers.findIndex(n => n.id === id);
    if (numberIndex === -1) {
        return res.status(404).json({ error: 'Number not found' });
    }
    
    numbers[numberIndex].status = status;
    await writeJsonFile('numbers.json', numbers);
    res.json(numbers[numberIndex]);
});

// Delete number
router.delete('/numbers/:id', async (req, res) => {
    const { id } = req.params;
    const numbers = await readJsonFile('numbers.json') || [];
    
    const filteredNumbers = numbers.filter(n => n.id !== id);
    await writeJsonFile('numbers.json', filteredNumbers);
    res.json({ success: true });
});

// Get menus
router.get('/menus', async (req, res) => {
    const menus = await readJsonFile('menus.json') || [];
    res.json(menus);
});

// Add new menu
router.post('/menus', async (req, res) => {
    const { name, type, text, ative, submenus, back } = req.body;
    const menus = await readJsonFile('menus.json') || [];
    
    const newMenu = {
        name,
        type: type || 'final',
        text: text || 'Digite o texto do menu aqui',
        ative: ative || false,
        submenus: submenus || false,
        back: back || false
    };
    
    menus.push(newMenu);
    await writeJsonFile('menus.json', menus);
    res.json(newMenu);
});

// Update menu
router.put('/menus/:index', async (req, res) => {
    const { index } = req.params;
    const updateData = req.body;
    const menus = await readJsonFile('menus.json') || [];
    
    if (index >= menus.length) {
        return res.status(404).json({ error: 'Menu not found' });
    }
    
    menus[index] = { ...menus[index], ...updateData };
    await writeJsonFile('menus.json', menus);
    res.json(menus[index]);
});

// Delete menu
router.delete('/menus/:index', async (req, res) => {
    const { index } = req.params;
    const menus = await readJsonFile('menus.json') || [];
    
    if (index >= menus.length) {
        return res.status(404).json({ error: 'Menu not found' });
    }
    
    menus.splice(index, 1);
    await writeJsonFile('menus.json', menus);
    res.json({ success: true });
});

// Get bot configuration
router.get('/bot-config', async (req, res) => {
    const config = await readJsonFile('bot-config.json') || {
        markAsOnline: true,
        markAsRead: true,
        responseDelay: {
            type: 'fixed',
            value: 500
        },
        menuTrigger: {
            type: 'newChat',
            value: ''
        }
    };
    res.json(config);
});

// Update bot configuration
router.put('/bot-config', async (req, res) => {
    const config = req.body;
    await writeJsonFile('bot-config.json', config);
    res.json(config);
});

module.exports = router;