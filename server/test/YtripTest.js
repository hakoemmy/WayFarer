import jwt from 'jsonwebtoken';

import chai from 'chai';

import dotenv from 'dotenv';

import chaiHttp from 'chai-http';

import app from '../index';

import trip from '../models/trips';

import status from '../helpers/StatusCode';

const { expect } = chai;

dotenv.config();

chai.use(chaiHttp);


// ############ trip TEST ############
// Create a true token for testing
const token = jwt.sign({ id: 1, is_admin: true }, process.env.Token_Key);
// Create a token with invalid user
const Invalidtoken = jwt.sign({ id: 0, is_admin: true }, process.env.Token_Key);
// Create a token without admin prevelege
const NonAdmintoken = jwt.sign({ id: 1, is_admin: false }, process.env.Token_Key);
// Test to View all trips

describe('GET Both Admin and Users can see all trips, api/v2/trips', () => {
  it('should return all trips', (done) => {
    chai.request(app)
      .get('/api/v2/trips')
      .set('x-auth-token', token)
      .set('Accept', 'application/json')
      .end((err, res) => {
        expect(res.body).to.be.an('object');
        expect(res.body.status).to.equal(status.REQUEST_SUCCEDED);
        expect(res.body.data[0].trip_id).to.equal(1);
        expect(res.body.data[0].origin).to.equal('Kenya');
        expect(res.body.data[0].seating_capacity).to.equal(40);
        expect(res.body.data[0].status).to.equal('active');
        expect(res.status).to.equal(status.REQUEST_SUCCEDED);
        // expect(res.body.data.token).to.be.a('string');
        done();
      });
  });
});

describe('GET View a specific trip api/v2/trips/{Trip_id}', () => {
  it('should return a specific trip', (done) => {
    chai.request(app)
      .get('/api/v2/trips/1')
      .set('Accept', 'application/json')
      .end((err, res) => {
        expect(res.body).to.be.an('object');
        expect(res.body.status).to.equal(status.REQUEST_SUCCEDED);
        // expect(res.body.data.token).to.be.a('string');
        done();
      });
  });
});
describe('GET View specifc trip with an id not an integer', () => {
  it('should return an error', (done) => {
    chai.request(app)
      .get('/api/v2/trips/k')
      .set('x-auth-token', token)
      .set('Accept', 'application/json')
      .end((err, res) => {
        expect(res.body).to.be.an('object');
        expect(res.body.status).to.equal(status.BAD_REQUEST);
        expect(res.body.error).to.equal('Trip id should be an integer');
        expect(res.status).to.equal(status.BAD_REQUEST);
        // expect(res.body.data.token).to.be.a('string');
        done();
      });
  });
});

describe('GET view specific invalid trip, api/v2/trips', () => {
  it('should return an error', (done) => {
    chai.request(app)
      .get('/api/v2/trips/9000')
      .set('Accept', 'application/json')
      .end((err, res) => {
        expect(res.body).to.be.an('object');
        expect(res.body.status).to.equal(status.NOT_FOUND);
        expect(res.body.error).to.equal('Trip not found');
        expect(res.status).to.equal(status.NOT_FOUND);
        // expect(res.body.data.token).to.be.a('string');
        done();
      });
  });
});


// Test to create a new trip

describe('POST Admin can create a trip, api/v2/trips', () => {
  it('should create a new trip successfully', (done) => {
    chai.request(app)
      .post('/api/v2/trips')
      .set('x-auth-token', token)
      .set('Accept', 'application/json')
      .send(trip[0])
      .end((err, res) => {
        expect(res.body).to.be.an('object');
        expect(res.body.status).to.equal(status.RESOURCE_CREATED);
        expect(res.status).to.equal(status.RESOURCE_CREATED);
        // expect(res.body.data.token).to.be.a('string');
        done();
      });
  });
});

// Test to cancel a specific trip

describe('PATCH Admin can cancel a trip, api/v2/trips', () => {
  it('should create a new trip successfully', (done) => {
    chai.request(app)
      .patch('/api/v2/trips/1/cancel')
      .set('x-auth-token', token)
      .set('Accept', 'application/json')
      .end((err, res) => {
        expect(res.body).to.be.an('object');
        expect(res.body.status).to.equal(status.FORBIDDEN);
        expect(res.body.error).to.equal('You can not cancel this trip, It has some bookins already');
        expect(res.status).to.equal(status.FORBIDDEN);
        // expect(res.body.data.token).to.be.a('string');
        done();
      });
  });
});
describe('POST Admin is able to create an active trip api/v2/trips', () => {
  it('must create a new trip successfully', (done) => {
    chai.request(app)
      .post('/api/v2/trips')
      .set('x-auth-token', token)
      .set('Accept', 'application/json')
      .send(trip[1])
      .end((err, res) => {
        expect(res.body).to.be.an('object');
        expect(res.body.status).to.equal(status.RESOURCE_CREATED);
        expect(res.status).to.equal(status.RESOURCE_CREATED);
        // expect(res.body.data.token).to.be.a('string');
        done();
      });
  });
});

describe('PATCH params incompleteness, api/v2/trips', () => {
  it('should return an error', (done) => {
    chai.request(app)
      .patch('/api/v2/trips/1/cance')
      .set('x-auth-token', token)
      .set('Accept', 'application/json')
      .end((err, res) => {
        expect(res.body).to.be.an('object');
        expect(res.body.status).to.equal(status.BAD_REQUEST);
        expect(res.body.error).to.equal('Please supply :cancel param!');
        expect(res.status).to.equal(status.BAD_REQUEST);
        // expect(res.body.data.token).to.be.a('string');
        done();
      });
  });
});

describe('PATCH trip id which is not an integer, api/v2/trips', () => {
  it('should return an error', (done) => {
    chai.request(app)
      .patch('/api/v2/trips/g/cancel')
      .set('x-auth-token', token)

      .set('Accept', 'application/json')
      .end((err, res) => {
        expect(res.body).to.be.an('object');
        expect(res.body.status).to.equal(status.BAD_REQUEST);
        expect(res.body.error).to.equal('Trip id should be an integer');
        expect(res.status).to.equal(status.BAD_REQUEST);
        // expect(res.body.data.token).to.be.a('string');
        done();
      });
  });
});

describe('PATCH admin provide wrong id, api/v2/trips', () => {
  it('should return an error', (done) => {
    chai.request(app)
      .patch('/api/v2/trips/900/cancel')
      .set('x-auth-token', token)
      .set('Accept', 'application/json')
      .end((err, res) => {
        expect(res.body).to.be.an('object');
        expect(res.body.status).to.equal(status.NOT_FOUND);
        expect(res.body.error).to.equal('Such trip is not found!');
        expect(res.status).to.equal(status.NOT_FOUND);
        // expect(res.body.data.token).to.be.a('string');
        done();
      });
  });
});

describe('PATCH user without admin previlege, api/v2/trips', () => {
  it('should return forbidden status code', (done) => {
    chai.request(app)
      .patch('/api/v2/trips/1/cancel')
      .set('x-auth-token', NonAdmintoken)
      .set('Accept', 'application/json')
      .end((err, res) => {
        expect(res.body).to.be.an('object');
        expect(res.body.status).to.equal(status.FORBIDDEN);
        expect(res.body.error).to.equal('You are not authorized to perform this action.');
        expect(res.status).to.equal(status.FORBIDDEN);
        // expect(res.body.data.token).to.be.a('string');
        done();
      });
  });
});

// Test for JWT
