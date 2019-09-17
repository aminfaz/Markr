const express = require("express");
const winston = require("winston");
const router = express.Router();
const markrXML = require("../middleware/markrXML");
const bodyParser = require("body-parser");
const xml2js = require("xml2js");
const { TestResult } = require("../models/testResult");

const xmlBodyParser = bodyParser.text({
  type: "text/xml+markr",
  limit: "50mb"
});
const xmlParser = new xml2js.Parser();

router.post("", [markrXML, xmlBodyParser], async (req, res) => {
  req = await xmlParser.parseStringPromise(req.body);
  if (!req["mcq-test-results"] || !req["mcq-test-results"]["mcq-test-result"]) {
    res.status(400).send("Bad Request");
  }
  const results = req["mcq-test-results"]["mcq-test-result"];
  const session = {
    created: {},
    updated: {}
  };
  try {
    for (let i = 0; i < results.length; i++) {
      await processResult(results[i], session);
    }

    saveSession(session);
  } catch (ex) {
    winston.error(ex);

    if (typeof ex === "string" && ex.indexOf("[Invalid Payload]:") === 0) {
      res.status(400).send("Could not process content of the file");
    }
    res
      .status(500)
      .send("Could not process content of the file due to internal error");
  }
  res.send("bingo");

  async function processResult(param, session) {
    let result = extractResult(param);

    let testResult = await getTestResult(result.testId, session);
    // Create the TestResult
    if (!testResult) {
      testResult = new TestResult({
        _id: result.testId,
        availableMarks: result.availableMarks,
        studentResults: {}
      });

      session.created[result.testId] = testResult;
    }
    // Update the TestResult
    else if (result.availableMarks > testResult.availableMarks) {
      testResult.availableMarks = result.availableMarks;
    }

    let isChanged = processStudentData(testResult, result.student);
    if (isChanged) {
      updateTestResult(testResult, session);
    }
  }

  function processStudentData(testResult, student) {
    let studentResult = testResult.studentResults.get(student.number);
    if (student.number === "2306") {
      //console.dir(testResult.studentResults)
      console.log("###studentResult: ", studentResult);
      console.log("###student: ", student);
    }
    let isChanged = false;
    if (!studentResult) {
      testResult.studentResults.set(student.number, student);
      if (student.number === "2306") {
        console.log("###79", testResult.studentResults.get(student.number));
      }
      isChanged = true;
    } else if (
      student.firstName !== studentResult.firstName ||
      student.lastName !== studentResult.lastName
    ) {
      throw "[Invalid Payload]: Student number used for different names";
    } else if (studentResult.obtainedMarks < student.obtainedMarks) {
      studentResult.obtainedMarks = student.obtainedMarks;
      isChanged = true;
    }
    return isChanged;
  }

  function extractResult(result) {
    if (!result["test-id"] || !result["test-id"][0]) {
      throw "[Invalid Payload]: Test ID is required";
    }

    if (
      !result["summary-marks"] ||
      !result["summary-marks"][0] ||
      !result["summary-marks"][0]["$"] ||
      !result["summary-marks"][0]["$"].available
    ) {
      throw "[Invalid Payload]: Available marks is required";
    }

    if (!result["student-number"] || !result["student-number"][0]) {
      throw "[Invalid Payload]: Student number is required";
    }

    if (!result["first-name"] || !result["first-name"][0]) {
      throw "[Invalid Payload]: Student first name is required";
    }

    if (!result["last-name"] || !result["last-name"][0]) {
      throw "[Invalid Payload]: Student last name is required";
    }

    if (!result["summary-marks"][0]["$"].obtained) {
      throw "[Invalid Payload]: Student obtained marks is required";
    }

    return {
      testId: result["test-id"][0],
      availableMarks: result["summary-marks"][0]["$"].available,
      student: {
        number: result["student-number"][0],
        firstName: result["first-name"][0],
        lastName: result["last-name"][0],
        obtainedMarks: result["summary-marks"][0]["$"].obtained
      }
    };
  }

  async function getTestResult(id, session) {
    let result;

    if (session.created[id]) {
      result = session.created[id];
    }

    if (session.updated[id]) {
      result = session.updated[id];
    }

    result = await TestResult.findById(id);

    return result;
  }

  function updateTestResult(testResult, session) {
    if (!session.created[testResult._id]) {
      session.updated[testResult._id] = testResult;
    }
  }

  async function saveSession(session) {
    console.dir(session);
  }
});

module.exports = router;
