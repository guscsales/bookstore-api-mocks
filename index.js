const express = require('express');
const NodeCache = require('node-cache');
const normalizeString = require('./helpers/normalize-string');
const bodyParser = require('body-parser');
const { createBook, getBooks, bookSchema } = require('./repositories/books');
const { getAuthors } = require('./repositories/authors');
const { getCategories } = require('./repositories/categories');
const { getPublishers } = require('./repositories/publishers');

const app = express();
const port = 3000;
const db = new NodeCache();

app.use(bodyParser.json());

require('./repositories/init')(db);

// LIVROS
app.get('/livros/:id', (req, res) => {
  const bookId = req.params.id || '';

  const book = getBooks(db).find((book) => book.id === bookId);

  if (!book) {
    return res.sendStatus(404);
  }

  return res.status(200).json(book);
});

app.get('/livros', (req, res) => {
  // Params
  const q = normalizeString(req.query.q || '');
  const limit = req.query.limit || 10;
  const take = (req.query.page || 0) * limit;

  // Search
  const books = getBooks(db);
  const items = books
    .filter(
      (book) =>
        normalizeString(book.titulo).includes(q) ||
        normalizeString(book.isbn).includes(q) ||
        normalizeString(book.codigo).includes(q) ||
        normalizeString(book.autor.nome).includes(q)
    )
    .slice(take, take + limit);

  return res
    .status(200)
    .json({ total: books.length, count: items.length, items });
});

app.post('/livros', (req, res) => {
  const payload = req.body;

  try {
    bookSchema.parse(payload);

    const data = createBook(db, payload);

    return res.status(200).json(data);
  } catch (e) {
    console.error(e);
    return res.status(400).json({ errors: JSON.parse(e.message) });
  }
});

// AUTORES
app.get('/autores', (req, res) => {
  // Params
  const q = normalizeString(req.query.q || '');
  const limit = req.query.limit || 10;
  const take = (req.query.page || 0) * limit;

  // Search
  const authors = getAuthors(db);
  const items = authors
    .filter((author) => normalizeString(author.nome).includes(q))
    .slice(take, take + limit);

  return res
    .status(200)
    .json({ total: authors.length, count: items.length, items });
});

// CATEGORIAS
app.get('/categorias', (req, res) => {
  // Search
  const items = getCategories(db);

  return res
    .status(200)
    .json({ total: items.length, count: items.length, items });
});

// EDITORAS
app.get('/editoras', (req, res) => {
  // Params
  const q = normalizeString(req.query.q || '');
  const limit = req.query.limit || 10;
  const take = (req.query.page || 0) * limit;

  // Search
  const items = getPublishers(db)
    .filter(
      (publisher) =>
        normalizeString(publisher.nome).includes(q) ||
        normalizeString(publisher.endereco).includes(q)
    )
    .slice(take, take + limit);

  return res
    .status(200)
    .json({ total: publishers.length, count: items.length, items });
});

app.listen(port, () => {
  console.log(`Bookstore API Mocks is running on port ${port}`);
});
