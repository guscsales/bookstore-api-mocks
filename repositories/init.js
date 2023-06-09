module.exports = (db) => {
  require('./authors')(db);
  require('./categories')(db);
  require('./publishers')(db);
  require('./books')(db);
};
