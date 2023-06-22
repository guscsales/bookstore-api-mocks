const { faker } = require('@faker-js/faker/locale/pt_BR');
const { z } = require('zod');

const tableName = 'usuarios';

function generateUser() {
  return {
    id: faker.number.bigInt().toString(),
    email: 'admin@livraria.com.br',
    senha: 'admin',
  };
}

module.exports = (db) => {
  try {
    db.set(tableName, [generateUser()]);
    console.log(`Table "${tableName}" created`);
  } catch (e) {
    console.error(`Error on creating table "${tableName}"`, e);
  }
};

function getUserByEmailAndPassword(db, { email, senha }) {
  const users = db.get(tableName) || [];
  return users.find((item) => item.email === email && item.senha === senha);
}
module.exports.getUserByEmailAndPassword = getUserByEmailAndPassword;

const userSchema = z.object({
  email: z.string().email(),
  senha: z.string(),
});
module.exports.userSchema = userSchema;

function createUser(db, { email, senha }) {
  const users = db.get(tableName) || [];

  const emailExists = users.find((item) => item.email === email);

  if (emailExists) {
    return { error: 'Email já cadastrado' };
  }

  const data = {
    id: faker.number.bigInt().toString(),
    email,
    senha,
  };

  const items = db.get(tableName) || [];

  db.set(tableName, [...items, data]);

  return data;
}
module.exports.createUser = createUser;
