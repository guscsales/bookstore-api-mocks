const { faker } = require('@faker-js/faker/locale/pt_BR');

const tableName = 'editoras';

function generatePublisher() {
  return {
    id: faker.number.bigInt().toString(),
    nome: faker.company.name(),
    endereco: `${faker.location.street()} ${faker.location.buildingNumber()} - ${faker.location.city()} - ${faker.location.state()} - ${faker.location.zipCode()}`,
    telefone: faker.phone.number('###########'),
  };
}

const defaultPublishers = Array.from({ length: 10 }).map(() =>
  generatePublisher()
);

module.exports = (db) => {
  try {
    db.set(tableName, defaultPublishers);
    console.log(`Table "${tableName}" created`);
  } catch (e) {
    console.error(`Error on creating table "${tableName}"`, e);
  }
};

module.exports.defaultPublishers = defaultPublishers;

function getPublishers(db) {
  return db.get(tableName) || [];
}
module.exports.getPublishers = getPublishers;

function getPublisherById(db, { id }) {
  const items = getPublishers(db);
  return items.find((item) => item.id === id);
}
module.exports.getPublisherById = getPublisherById;
