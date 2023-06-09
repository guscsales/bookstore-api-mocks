const { faker } = require('@faker-js/faker/locale/pt_BR');

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
