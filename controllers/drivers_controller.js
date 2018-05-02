const Driver = require('../models/driver')

module.exports = {
  greeting(req, res) {
    res.send({ hi: 'there' });
  },

  index(req, res, next) {
    const maxDistance = 50 / 0.00062137; // miles to meters 
    const { lng, lat } = req.query;

    Driver.geoNear(
      { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
      { spherical: true, maxDistance }
    )
      .then(drivers => res.send(drivers))
      .catch(next);
  },

  create(req, res, next) {
    const driverProps = req.body;

    Driver.create(driverProps)
      .then(driver => {
        res.send(driver);
      })
      .catch(next)
  },

  edit(req, res, next) {
    const driverID = req.params.id;
    const driverProps = req.body;

    Driver.findByIdAndUpdate({ _id: driverID }, driverProps)
      .then(() => Driver.findById({ _id: driverID }))
      .then(driver => res.send(driver))
      .catch(next);
  },

  delete(req, res, next) {
    const driverID = req.params.id;

    Driver.remove({ _id: driverID })
      .then(driver => res.status(204).send(driver))
      .catch(next);
  }
};
