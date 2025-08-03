const express = require('express');
const bodyParser = require('body-parser');
// const path = require('path');
// const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
let rsvpData = [];

// Middleware
app.use(cors());
app.use(bodyParser.json());
// app.use(express.static(path.join(__dirname, 'public')));

// Database setup (using JSON file)
// const DB_FILE = path.join(__dirname, 'rsvp.json');

// // Initialize DB file if not exists
// if (!fs.existsSync(DB_FILE)) {
//     fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2));
// }

// Helper functions for database operations
// function readDatabase() {
//     try {
//         const data = fs.readFileSync(DB_FILE, 'utf8');
//         return JSON.parse(data);
//     } catch (err) {
//         console.error('Error reading database:', err);
//         return [];
//     }
// }

// function writeDatabase(data) {
//     try {
//         fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
//         return true;
//     } catch (err) {
//         console.error('Error writing to database:', err);
//         return false;
//     }
// }

// API untuk RSVP
app.post('/api/rsvp', (req, res) => {
    const { name, message, attending } = req.body;
    
    if (!name) {
        return res.status(400).json({ 
            success: false,
            message: 'Nama wajib diisi'
        });
    }
    
    // const rsvpData = readDatabase();
    const newRsvp = {
        id: Date.now().toString(),
        name,
        message: message || '',
        attending: attending !== 'false',
        createdAt: new Date().toISOString()
    };
    
    rsvpData.push(newRsvp);
    // const success = writeDatabase(rsvpData);
    
    // if (!success) {
    //     return res.status(500).json({ 
    //         success: false,
    //         message: 'Gagal menyimpan konfirmasi'
    //     });
    // }
    
    res.status(201).json({ 
        success: true,
        data: newRsvp,
        message: 'Terima kasih atas konfirmasi Anda!'
    });
});

// API untuk mendapatkan daftar RSVP dengan pagination
app.get('/api/rsvp', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    // const rsvpData = readDatabase();
    
    // Sort by date (newest first)
    const sortedData = [...rsvpData].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
    );
    
    const total = sortedData.length;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const totalHadir = sortedData.filter(x => x.attending).length;
    const totalTidakHadir = sortedData.filter(x => !x.attending).length;
    const paginatedItems = sortedData.slice(startIndex, endIndex);
    
    res.json({
        success: true,
        items: paginatedItems,
        total,
        page,
        totalHadir,
        totalTidakHadir,
        totalPages: Math.ceil(total / limit)
    });
});

// Serve the main HTML file
// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
