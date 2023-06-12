const { faker } = require('@faker-js/faker/locale/pt_BR');
const { defaultCategories, getCategoryById } = require('./categories');
const { defaultAuthors, getAuthorById } = require('./authors');
const { defaultPublishers, getPublisherById } = require('./publishers');
const _ = require('lodash');
const { z } = require('zod');

const tableName = 'livros';

function generateBook() {
  return {
    id: faker.number.bigInt().toString(),
    titulo: _.startCase(
      _.camelCase(faker.word.words({ count: { min: 3, max: 6 } }))
    ),
    isbn: `${faker.number.int({ min: 100, max: 999 })}-${faker.number.int({
      min: 10,
      max: 99,
    })}-${faker.number.int({ min: 10000, max: 99999 })}-${faker.number.int({
      min: 1,
      max: 9,
    })}`,
    paginas: faker.number.int({ min: 10, max: 9999 }),
    codigo: `${defaultCategories[
      faker.number.int({ min: 0, max: defaultCategories.length - 1 })
    ].nome
      .substring(0, 3)
      .toUpperCase()}${faker.number
      .int({ max: 99999 })
      .toString()
      .padStart(5, '0')}`,
    ano: faker.date.past().getFullYear(),
    capa: faker.image.urlLoremFlickr({
      width: 1080,
      height: 1920,
      category: 'book,cover',
    }),
    categoria:
      defaultCategories[
        faker.number.int({ min: 0, max: defaultCategories.length - 1 })
      ],
    editora:
      defaultPublishers[
        faker.number.int({ min: 0, max: defaultPublishers.length - 1 })
      ],
    autor:
      defaultAuthors[
        faker.number.int({ min: 0, max: defaultAuthors.length - 1 })
      ],
  };
}

module.exports = (db) => {
  try {
    db.set(
      tableName,
      Array.from({ length: 100 }).map(() => generateBook())
    );
    console.log(`Table "${tableName}" created`);
  } catch (e) {
    console.error(`Error on creating table "${tableName}"`, e);
  }
};

const bookSchema = z.object({
  titulo: z.string(),
  isbn: z.string(),
  paginas: z.number(),
  ano: z
    .number()
    .positive()
    .refine(
      (value) => {
        const currentYear = new Date().getFullYear();
        return value >= 1900 && value <= currentYear;
      },
      { message: 'Invalid year' }
    ),
  capa: z.string().url(),
  categoriaId: z.string(),
  editoraId: z.string(),
  autorId: z.string(),
});
module.exports.bookSchema = bookSchema;

function getBooks(db) {
  return db.get(tableName) || [];
}
module.exports.getBooks = getBooks;

function createBook(
  db,
  { titulo, isbn, paginas, ano, categoriaId, editoraId, autorId }
) {
  const data = {
    id: faker.number.bigInt().toString(),
    codigo: `${defaultCategories[
      faker.number.int({ min: 0, max: defaultCategories.length - 1 })
    ].nome
      .substring(0, 3)
      .toUpperCase()}${faker.number
      .int({ max: 99999 })
      .toString()
      .padStart(5, '0')}`,
    titulo,
    isbn,
    paginas,
    ano,
    categoria: getCategoryById(db, { id: categoriaId }),
    editora: getPublisherById(db, { id: editoraId }),
    autor: getAuthorById(db, { id: autorId }),
  };

  const items = db.get(tableName) || [];

  db.set(tableName, [...items, data]);

  return data;
}
module.exports.createBook = createBook;

const updateBookSchema = bookSchema.extend({
  id: z.string(),
});
module.exports.updateBookSchema = updateBookSchema;

function updateBook(
  db,
  id,
  { titulo, isbn, paginas, ano, categoriaId, editoraId, autorId }
) {
  const items = db.get(tableName) || [];

  let data = {
    id,
    titulo,
    isbn,
    paginas,
    ano,
    categoria: getCategoryById(db, { id: categoriaId }),
    editora: getPublisherById(db, { id: editoraId }),
    autor: getAuthorById(db, { id: autorId }),
  };

  db.set(
    tableName,
    items.map((item) => {
      if (item.id === id) {
        data = { ...item, ...data };
        return data;
      }

      return item;
    })
  );

  return data;
}
module.exports.updateBook = updateBook;

const deleteBookSchema = z.object({
  id: z.string(),
});
module.exports.deleteBookSchema = deleteBookSchema;

function deleteBook(db, id) {
  const items = db.get(tableName) || [];

  db.set(
    tableName,
    items.filter((item) => {
      return item.id !== id;
    })
  );
}
module.exports.deleteBook = deleteBook;
