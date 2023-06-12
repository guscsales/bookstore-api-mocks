const { faker } = require('@faker-js/faker/locale/pt_BR');
const { z } = require('zod');

const tableName = 'autores';

function generateAuthor() {
  return {
    id: faker.number.bigInt().toString(),
    nome: faker.person.fullName(),
    email: faker.internet.email(),
    telefone: faker.phone.number('###########'),
    bio: faker.lorem.paragraph(),
  };
}

const defaultAuthors = Array.from({ length: 20 }).map(() => generateAuthor());

module.exports = (db) => {
  try {
    db.set('autores', defaultAuthors);
    console.log(`Table "${tableName}" created`);
  } catch (e) {
    console.error(`Error on creating table "${tableName}"`, e);
  }
};

module.exports.defaultAuthors = defaultAuthors;

function getAuthors(db) {
  return db.get(tableName) || [];
}
module.exports.getAuthors = getAuthors;

function getAuthorById(db, { id }) {
  const items = getAuthors(db);
  return items.find((item) => item.id === id);
}
module.exports.getAuthorById = getAuthorById;

function getAuthorBooks(db, { id }) {
  const books = db.get('livros') || [];

  const authorBooks = books.filter((item) => item.autor.id === id);

  return authorBooks;
}
module.exports.getAuthorBooks = getAuthorBooks;

const authorSchema = z.object({
  nome: z.string(),
  email: z.string().email(),
  telefone: z.string(),
  bio: z.string(),
});
module.exports.authorSchema = authorSchema;

function createAuthor(db, { nome, email, telefone, bio }) {
  const data = {
    id: faker.number.bigInt().toString(),
    nome,
    email,
    telefone,
    bio,
  };

  const items = db.get(tableName) || [];

  db.set(tableName, [...items, data]);

  return data;
}
module.exports.createAuthor = createAuthor;

const updateAuthorSchema = authorSchema.extend({
  id: z.string(),
});
module.exports.updateAuthorSchema = updateAuthorSchema;

function updateAuthor(db, id, { nome, email, telefone, bio }) {
  const items = db.get(tableName) || [];

  let data = {
    nome,
    email,
    telefone,
    bio,
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
module.exports.updateAuthor = updateAuthor;

const deleteAuthorSchema = z.object({
  id: z.string(),
});
module.exports.deleteAuthorSchema = deleteAuthorSchema;

function deleteAuthor(db, id) {
  const items = db.get(tableName) || [];

  db.set(
    tableName,
    items.filter((item) => {
      return item.id !== id;
    })
  );
}
module.exports.deleteAuthor = deleteAuthor;
