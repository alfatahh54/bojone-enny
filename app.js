const express = require('express');
const bodyParser = require('body-parser');
// const path = require('path');
require('dotenv').config();
// const fs = require('fs');
const { neon } = require('@neondatabase/serverless');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const sql = neon(process.env.DATABASE_URL);
// Middleware
app.use(cors());
app.use(bodyParser.json());
// app.use(express.static(path.join(__dirname, 'public')));

// API untuk RSVP
app.post('/api/rsvp', async (req, res) => {
    const { name, message, attending } = req.body;
    if (!name) {
        return res.status(400).json({ 
            success: false,
            message: 'Nama wajib diisi'
        });
    }
    try {
        const success = await sql `INSERT INTO undanganku.wishes ( name,message, attending) VALUES ( ${name},${message}, ${attending}) RETURNING *;`;
        if (!success) {
            return res.status(500).json({ 
                success: false,
                message: 'Gagal menyimpan konfirmasi'
            });
        }
        res.status(201).json({ 
            success: true,
            message: 'Terima kasih atas konfirmasi Anda!'
        });     
    } catch (err) {
        return res.status(500).json({ 
            success: false,
            message: 'Gagal menyimpan konfirmasi'
        });
    }
});

// API untuk mendapatkan daftar RSVP dengan pagination
app.get('/api/rsvp', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    // const rsvpData = readDatabase();
    
    // Sort by date (newest first)
    try {
        const data = await sql `SELECT * FROM undanganku.wishes ORDER BY wishes."createdAt" DESC LIMIT ${limit} OFFSET ${limit * (page - 1)};`;
        const total = await sql `SELECT COUNT(*) FROM undanganku.wishes;`;
        const totalHadir = await sql `SELECT COUNT(*) FROM undanganku.wishes WHERE wishes.attending = true;`;
        const totalTidakHadir = parseInt(total[0].count) - parseInt(totalHadir[0].count);
        
        res.json({
            success: true,
            items: data,
            page,
            total: parseInt(total[0].count),
            totalHadir: parseInt(totalHadir[0].count),
            totalTidakHadir,
            totalPages: Math.ceil(parseInt(total[0].count) / limit)
        });
    } catch (err) {
        console.log(err);
        
        res.status(500).json({ success: false, message: 'Gagal mengambil data RSVP' });
    }
    
});

app.get('/api/absensi', async (req, res) => {
    try {
        const data = await sql `SELECT * FROM undanganku.absensi ORDER BY absensi.time DESC;`;
        res.json({ success: true, items: data });
    } catch (err) {
        console.log(err);
        
        res.status(500).json({ success: false, message: 'Gagal mengambil data absensi' });
    }
});

app.post('/api/absensi', async (req, res) => {
    const { name, from, time, status } = req.body;
    try {
        const cekData = await sql `SELECT * FROM undanganku.absensi WHERE name = ${name} AND from = ${from};`;
        if (cekData.length > 0) {
            return res.status(200).json({ 
                success: true,
                message: 'Anda sudah absen'
            });
        }
        const success = await sql `INSERT INTO undanganku.absensi ( name, from, time, status) VALUES ( ${id},${name}, ${from}, ${time}, ${status}) RETURNING *;`;
        if (!success) {
            return res.status(500).json({ 
                success: false,
                message: 'Gagal absen'
            });
        }
        res.status(201).json({ 
            success: true,
            message: 'Terima kasih atas kehadiran Anda!'
        });     
    } catch (err) {
        console.log(err);
        
        return res.status(500).json({ 
            success: false,
            message: 'Gagal absen'
        });
    }
})

// Serve the main HTML file
// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
