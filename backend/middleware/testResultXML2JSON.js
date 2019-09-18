const winston = require("winston");
const xml2js = require("xml2js");

const xmlParser = new xml2js.Parser();

module.exports = async function(req, res, next) {
  try {
    const reqObj = await xmlParser.parseStringPromise(req.body);

    if (
      !reqObj ||
      !reqObj["mcq-test-results"] ||
      !reqObj["mcq-test-results"]["mcq-test-result"]
    ) {
      throw "[Invalid Payload]: Invalid result collection";
    }

    const results = reqObj["mcq-test-results"]["mcq-test-result"];

    req.body = results.map(extractResult);

    next();

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
  } catch (ex) {
    winston.error(ex.message, ex);
    return res
      .status(400)
      .send(
        "The structure of the request does not comply with expected structure"
      );
  }
};
