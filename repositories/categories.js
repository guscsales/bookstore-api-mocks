const { faker } = require('@faker-js/faker/locale/pt_BR');

const tableName = 'categorias';

function generateCategory({ nome }) {
  return {
    id: faker.number.bigInt().toString(),
    nome,
  };
}

const defaultCategories = [
  generateCategory({ nome: 'Romance' }),
  generateCategory({ nome: 'Fantasia' }),
  generateCategory({ nome: 'Drama' }),
];

module.exports = (db) => {
  try {
    db.set(tableName, defaultCategories);
    console.log(`Table "${tableName}" created`);
  } catch (e) {
    console.error(`Error on creating table "${tableName}"`, e);
  }
};

module.exports.defaultCategories = defaultCategories;

function getCategories(db) {
  return db.get(tableName) || [];
}
module.exports.getCategories = getCategories;

function getCategoryById(db, { id }) {
  const items = getCategories(db);
  return items.find((item) => item.id === id);
}
module.exports.getCategoryById = getCategoryById;
