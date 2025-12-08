// controllers/reportController.js

const { Presensi, User } = require('../models'); // Pastikan User diimpor
const { Op } = require('sequelize');
const { format, toZonedTime } = require('date-fns-tz');

// ... (Jika ada fungsi lain di atas, biarkan saja) ...

exports.getDailyReport = async (req, res) => {
    try {
        const { date } = req.query; // Ambil tanggal dari query
        const timeZone = 'Asia/Jakarta';
        
        // 1. Tentukan rentang waktu untuk hari yang diminta
        // Kita menggunakan date sebagai string (misal: '2025-12-07')
        const startOfDay = new Date(date + 'T00:00:00');
        const endOfDay = new Date(date + 'T23:59:59');

        const records = await Presensi.findAll({
            where: {
                checkIn: {
                    [Op.between]: [startOfDay, endOfDay],
                },
            },
            // 2. Lakukan JOIN ke tabel User untuk mengambil nama
            include: [{
                model: User,
                as: 'user', // Sesuai dengan definisi di models/presensi.js
                attributes: ['nama'], // Hanya ambil kolom nama
            }],
            order: [['checkIn', 'ASC']],
        });

        if (records.length === 0) {
            return res.status(404).json({ message: 'Tidak ada data presensi pada tanggal tersebut.' });
        }

        // 3. Format hasil dan sertakan buktiFoto serta nama User
        const formattedData = records.map((record) => ({
            id: record.id,
            userId: record.userId,
            nama: record.user.nama, // Mengambil nama dari hasil JOIN
            checkIn: record.checkIn
                ? format(toZonedTime(record.checkIn, timeZone), "yyyy-MM-dd HH:mm:ssXXX", { timeZone })
                : null,
            checkOut: record.checkOut
                ? format(toZonedTime(record.checkOut, timeZone), "yyyy-MM-dd HH:mm:ssXXX", { timeZone })
                : null,
            latitude: record.latitude,
            longitude: record.longitude,
            buktiFoto: record.buktiFoto, // Menyertakan path bukti foto
        }));

        res.status(200).json({ data: formattedData });
    } catch (error) {
        console.error('ERROR getDailyReport:', error);
        res.status(500).json({ message: 'Gagal mengambil laporan presensi.' });
    }
};