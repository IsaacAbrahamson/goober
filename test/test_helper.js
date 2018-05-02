require('dotenv').config()

const mongoose = require('mongoose');

before(done => {
  mongoose.connect(`mongodb://IsaacAbrahamson:${process.env.GOOBER_TEST_PASS}@ds119129.mlab.com:19129/goober_test`, {
    useMongoClient: true
  });
  mongoose.connection
    .once('open', () => done())
    .on('error', err => {
      console.warn('Warning', err);
    });
});

beforeEach(done => {
  const { drivers } = mongoose.connection.collections;
  drivers.drop()
    .then(() => drivers.createIndex({ 'geometry.coordinates': '2dsphere' }))
    .then(() => done())
    .catch(() => done());
})
