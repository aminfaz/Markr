const express = require("express");
const winston = require("winston");
const router = express.Router();
const markrXML = require("../middleware/markrXML");
const bodyParser = require("body-parser");
const testResultXML2JSON = require("../middleware/testResultXML2JSON");
const { TestResult } = require("../models/testResult");
const { calculateAggregates } = require("../services/calculateAggregates");

const xmlBodyParser = bodyParser.text({
  type: "text/xml+markr",
  limit: "50mb"
});

router.post("", [markrXML, xmlBodyParser, testResultXML2JSON], async (req, res) => {
  const session = {
    created: {},
    updated: {}
  };

  try {
    for (let i = 0; i < req.body.length; i++) {
      await processResult(req.body[i], session);
    }

    await saveSession(session);
  } catch (ex) {
    winston.error(ex.message, ex);

    if (typeof ex === "string" && ex.indexOf("[Invalid Payload]:") === 0) {
      return res.status(400).send("Could not process content of the file");
    }
    return res
      .status(500)
      .send("Could not process content of the file due to internal error");
  }

  res.send("All of the records have been successfully processed");

  try {
    const ids = Object.keys(session.created).concat(
      Object.keys(session.updated)
    );
    await calculateAggregates(ids);
  } catch (ex) {
    winston.error(ex.message, ex);
  }

  //#region Processing Payload
  async function processResult(result, session) {
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
    let isChanged = false;
    let studentResult = testResult.studentResults.get(student.number);

    if (!studentResult) {
      testResult.studentResults.set(student.number, student);
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

  async function getTestResult(id, session) {
    let result;
    if (session.created[id]) {
      result = session.created[id];
    } else if (session.updated[id]) {
      result = session.updated[id];
    } else {
      result = await TestResult.findById(id);
    }

    return result;
  }

  function updateTestResult(testResult, session) {
    if (!session.created[testResult._id]) {
      session.updated[testResult._id] = testResult;
    }
  }

  async function saveSession(session) {
    let objects = Object.values(session.created);
    for (let i = 0; i < objects.length; i++) {
      await objects[i].save();
    }

    for (key in session.updated) {
      await TestResult.findByIdAndUpdate(key, session.updated[key]);
    }
  }
  //#endregion Processing Payload

  //#region Recalculating for reporting
  
  //#endregion Recalculating for reporting
});

module.exports = router;
