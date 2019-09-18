const { TestResult } = require("../models/testResult");

async function recalculateTests(ids) {
  let testResult;
  for (let i = 0; i < ids.length; i++) {
    testResult = await TestResult.findById(ids[i]);

    if (!testResult) {
      continue;
    }

    const studentMarksArr = [];

    const total = recalculateStudentsMarks(
      testResult.studentResults,
      testResult.availableMarks,
      studentMarksArr
    );

    testResult.meanMark = total / testResult.studentResults.size;
    testResult.meanPercentage =
      (testResult.meanMark * 100) / testResult.availableMarks;

    studentMarksArr.sort((a, b) => a.obtainedMarks - b.obtainedMarks);

    recalculatePercentiles(testResult, studentMarksArr);

    captureRankings(studentMarksArr);

    await TestResult.findByIdAndUpdate(ids[i], testResult);
  }
}

function recalculateStudentsMarks(
  studentResults,
  availableMarks,
  studentMarksArr
) {
  let total = 0;
  studentResults.forEach(studentResult => {
    studentResult.percentage =
      (studentResult.obtainedMarks * 100) / availableMarks;
    total += studentResult.obtainedMarks;
    studentMarksArr.push(studentResult);
  });
  return total;
}

function recalculatePercentiles(testResult, studentMarksArr) {
  function calculateIndex(percentile) {
    return Math.floor((percentile / 100) * studentMarksArr.length);
  }

  testResult.p25 = studentMarksArr[calculateIndex(25)].percentage;
  testResult.p50 = studentMarksArr[calculateIndex(50)].percentage;
  testResult.p75 = studentMarksArr[calculateIndex(75)].percentage;
}

function captureRankings(studentMarksArr) {
  studentMarksArr.forEach((studentResult, index, array) => {
    studentResult.rank = array.length - index;
  });
}

exports.calculateAggregates = recalculateTests;
