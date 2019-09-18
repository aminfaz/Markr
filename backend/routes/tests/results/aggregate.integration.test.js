const request = require('supertest');
const { TestResult } = require('../../../models/testResult');

describe('[GET] /api/results/:id/aggregate', () => {
  let server;

  beforeEach(async () => {
    if (server) {
      await server.close();
    }
    server = require('../../../index');
  });

  afterEach(async () => {
    await server.close();
    await TestResult.deleteMany({});
  });

  describe('Empty DB', () => {
    it('should return 404 for any test id', async () => {
      const res = await request(server).get('/api/results/testID1/aggregate');
      expect(res.status).toBe(404);
    });
  });

  describe('Loaded with data', () => {
    beforeEach(async () => {
      const result1 = { 
        _id: 'testID1', 
        availableMarks: 20,
        meanMark: 15,
        meanPercentage: 75,
        p25: 25,
        p50: 50,
        p75: 75,
        studentResults: {}
      };

      const result2 = { 
        _id: 'testID2', 
        availableMarks: 200,
        meanMark: 150,
        meanPercentage: 60,
        p25: 20,
        p50: 55,
        p75: 70,
        studentResults: new Map()
      }

      const studentResult = {
        number: '123',
        firstName: 'firstName',
        lastName: 'lastName',
        obtainedMarks: 10
      };
      result2.studentResults.set('123', studentResult);

      await TestResult.collection.insertMany([result1, result2]);
    });

    it('should return 404 for blank test', async () => {
      const res = await request(server).get('/api/results//aggregate');
      expect(res.status).toBe(404);
    });

    it('should return 404 for invalid test ID', async () => {
      const res = await request(server).get('/api/results/testID3/aggregate');
      expect(res.status).toBe(404);
    });

    it('should return appropriate data for a valid test ID with NO students', async () => {
      const res = await request(server).get('/api/results/testID1/aggregate');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ count: 0, p25: 25, p50: 50, p75: 75 });
    });

    it('should return appropriate data for a valid test ID with students', async () => {
      const res = await request(server).get('/api/results/testID2/aggregate');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ count: 1, p25: 20, p50: 55, p75: 70 });
    });
  });
});