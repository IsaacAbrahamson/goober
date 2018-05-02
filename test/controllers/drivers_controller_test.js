const assert = require('assert');
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');

const Driver = mongoose.model('driver');

describe('Drivers controller', () => {
  it('POST request to /api/drivers creates a new driver', (done) => {
    Driver.count().then(count => {
      request(app)
        .post('/api/drivers')
        .send({ email: 'test@test.com', name: 'John Doe' })
        .end(() => {
          Driver.count().then(newCount => {
            assert(count + 1 === newCount);
            Driver.findOne({ email: 'test@test.com' }).then(driver => {
              assert(driver.name === 'John Doe');
              done()
            });
          });
        });
    });
  });

  it('PUT request to /api/drivers/id edits an existing driver', (done) => {
    const driver = new Driver({ email: 't@t.com', driving: false })
    driver.save().then(() => {
      request(app)
        .put(`/api/drivers/${driver._id}`)
        .send({ driving: true })
        .end(() => {
          Driver.findOne({ email: 't@t.com' })
            .then(driver => {
              assert(driver.driving === true);
              done()
            });
        });
    });
  });

  it('DELETE request to /api/drivers/id deletes an existing driver', (done) => {
    const driver = new Driver({ email: 't2@t2.com', driving: false })
    driver.save().then(() => {
      request(app)
        .delete(`/api/drivers/${driver._id}`)
        .end(() => {
          Driver.findOne({ email: 't2@t2.com' })
            .then(driver => {
              assert(driver === null);
              done()
            });
        });
    });
  });

  it('GET request to /api/drivers/ finds drivers in a location', done => {
    const seattleDriver = new Driver({
      email: 'seattle@test.com',
      geometry: { type: 'Point', coordinates: [-122.475, 47.614] }
    });

    const miamiDriver = new Driver({
      email: 'miami@test.com',
      geometry: { type: 'Point', coordinates: [-80.253, 25.791] }
    });

    Promise.all([ seattleDriver.save(), miamiDriver.save() ])
      .then(() => {
        request(app)
          .get('/api/drivers?lng=-80&lat=25')
          .end((err, response) => {
            assert(response.body.length === 1);
            assert(response.body[0].obj.email === 'miami@test.com')
            done();
          });
      });
  });
});
