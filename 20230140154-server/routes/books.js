const express = require('express'); //mengimpor modul express
const router = express.Router(); //membuat instance router dari express

// Data dummy untuk buku
let books = [
  { id: 1, title: 'Book 1', author: 'Author 1' }, //data buku pertama
  { id: 2, title: 'Book 2', author: 'Author 2' } //data buku kedua
];

// GET semua buku
router.get('/', (req, res) => { //Endpoint get / untuk ambil semua data buku
  res.json(books); //mengirim semua data buku dalam format JSON
});

// GET buku berdasarkan ID
router.get('/:id', (req, res) => { //Endpoint GET /:id untuk ambil buku berdasarkan ID
  const book = books.find(b => b.id === parseInt(req.params.id)); //mencari buku dengan ID tertentu
  if (!book) { //Jika buku tidak ditemukan
    return res.status(404).json({ message: 'Book not found' }); //Kirim respons 404 (Tidak ditemukan)
  }
  res.json(book); // Jika ditemukan. kirim data buku dalam format JSON
});

// POST tambah buku baru
router.post('/', (req, res) => { //endpoint POST / untuk menambah buku baru
  const { title, author } = req.body; //mengambil data title dan author dari body request

  if (!title || !author) {
    return res.status(400).json({ message: 'Title and author are required' });
  }

  const newBook = {
    id: books.length + 1,
    title,
    author
  };

  books.push(newBook);
  res.status(201).json(newBook);
});

// PUT update buku
router.put('/:id', (req, res) => {
  const book = books.find(b => b.id === parseInt(req.params.id));
  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }

  const { title, author } = req.body;
  if (!title || !author) {
    return res.status(400).json({ message: 'Title and author are required' });
  }

  book.title = title;
  book.author = author;
  res.json(book);
});

// DELETE hapus buku
router.delete('/:id', (req, res) => {
  const index = books.findIndex(b => b.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ message: 'Book not found' });
  }

  const deletedBook = books.splice(index, 1)[0];
  res.json(deletedBook);
});

module.exports = router;
