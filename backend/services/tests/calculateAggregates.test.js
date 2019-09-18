const { calculateAggregates } = require("../calculateAggregates");
const { TestResult } = require('../../models/testResult');

describe('Calculate Aggregates Service', () => {

  beforeEach(async() => {
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

    await TestResult.insertMany([result1, result2]);
  });

  afterEach(async () => {
    await TestResult.deleteMany({});
  });

  it('Invalid id should not change other objects', async () => {
    await TestResult.findByIdAndUpdate('testID1', { $set: { availableMarks: 30 }});
    await calculateAggregates(['22']);
    let testResult = await TestResult.findById('testID1');
    expect(testResult.availableMarks).toBe(30);
    expect(testResult.meanPercentage).toBe(75);
  });
});