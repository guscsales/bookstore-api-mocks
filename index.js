const express = require('express');
const NodeCache = require('node-cache');
const normalizeString = require('./helpers/normalize-string');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const {
  createBook,
  getBooks,
  bookSchema,
  updateBook,
  updateBookSchema,
  deleteBook,
  deleteBookSchema,
} = require('./repositories/books');
const {
  getAuthors,
  getAuthorBooks,
  authorSchema,
  updateAuthorSchema,
  deleteAuthorSchema,
  createAuthor,
  updateAuthor,
  deleteAuthor,
} = require('./repositories/authors');
const { getCategories } = require('./repositories/categories');
const { getPublishers } = require('./repositories/publishers');
const {
  userSchema,
  createUser,
  getUserByEmailAndPassword,
} = require('./repositories/users');

const app = express();
const port = 3000;
const db = new NodeCache();

app.use(bodyParser.json());
app.use(cors());

require('./repositories/init')(db);

// LIVROS
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

app.get('/livros/:id', (req, res) => {
  const bookId = req.params.id || '';

  const book = getBooks(db).find((book) => book.id === bookId);

  if (!book) {
    return res.sendStatus(404);
  }

  return res.status(200).json(book);
});

app.put('/livros/:id', (req, res) => {
  const bookId = req.params.id || '';
  const payload = req.body;

  try {
    updateBookSchema.parse({ id: bookId, ...payload });

    const data = updateBook(db, bookId, payload);

    return res.status(200).json(data);
  } catch (e) {
    console.error(e);
    return res.status(400).json({ errors: JSON.parse(e.message) });
  }
});

app.delete('/livros/:id', (req, res) => {
  const bookId = req.params.id || '';

  try {
    deleteBookSchema.parse({ id: bookId });

    deleteBook(db, bookId);

    return res.status(200).send('');
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

app.get('/autores/:id/livros', (req, res) => {
  const authorId = req.params.id || '';

  const items = getAuthorBooks(db, { id: authorId });

  return res.status(200).json({ total: items.length, items });
});

app.post('/autores', (req, res) => {
  const payload = req.body;

  try {
    authorSchema.parse(payload);

    const data = createAuthor(db, payload);

    return res.status(200).json(data);
  } catch (e) {
    console.error(e);
    return res.status(400).json({ errors: JSON.parse(e.message) });
  }
});

app.get('/autores/:id', (req, res) => {
  const authorId = req.params.id || '';

  const book = getAuthors(db).find((book) => book.id === authorId);

  if (!book) {
    return res.sendStatus(404);
  }

  return res.status(200).json(book);
});

app.put('/autores/:id', (req, res) => {
  const authorId = req.params.id || '';
  const payload = req.body;

  try {
    updateAuthorSchema.parse({ id: authorId, ...payload });

    const data = updateAuthor(db, authorId, payload);

    return res.status(200).json(data);
  } catch (e) {
    console.error(e);
    return res.status(400).json({ errors: JSON.parse(e.message) });
  }
});

app.delete('/autores/:id', (req, res) => {
  const authorId = req.params.id || '';

  try {
    deleteAuthorSchema.parse({ id: authorId });

    deleteAuthor(db, authorId);

    return res.status(200).send('');
  } catch (e) {
    console.error(e);
    return res.status(400).json({ errors: JSON.parse(e.message) });
  }
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
    .json({ total: items.length, count: items.length, items });
});

// LOGIN
app.post('/auth/login', (req, res) => {
  const payload = req.body;

  try {
    userSchema.parse(payload);

    const data = getUserByEmailAndPassword(db, payload);

    if (!data) {
      return res.status(403).json({ error: 'Email ou senha inválidos' });
    }

    const token = jwt.sign(data, 'mock-for-secret-key', { expiresIn: '1d' });
    const { exp } = jwt.verify(token, 'mock-for-secret-key');

    return res.status(200).json({ token, exp });
  } catch (e) {
    console.error(e);
    return res.status(400).json({ errors: JSON.parse(e.message) });
  }
});

app.post('/auth/signup', (req, res) => {
  const payload = req.body;

  try {
    userSchema.parse(payload);

    const data = createUser(db, payload);

    if (data.error) {
      return res.status(409).json(data);
    }

    const token = jwt.sign(data, 'mock-for-secret-key', { expiresIn: '1d' });
    const { exp } = jwt.verify(token, 'mock-for-secret-key');

    return res.status(200).json({ token, exp });
  } catch (e) {
    console.error(e);
    return res.status(400).json({ errors: JSON.parse(e.message) });
  }
});

app.listen(port, () => {
  console.log(`Bookstore API Mocks is running on port ${port}`);
});
