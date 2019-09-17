const Joi = require("joi");
const mongoose = require("mongoose");

const StudentResult = new mongoose.Schema(
  {
    number: {
      type: String,
      required: true
    },
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    marksObtained: {
      type: Number,
      required: true,
      min: 1
    }
  },
  { _id: false }
);

const TestResult = mongoose.model(
  "TestResult",
  new mongoose.Schema({
    _id: {
      type: String,
      required: true
    },
    availableMarks: {
      type: Number,
      default: 0,
      min: 0,
      required: true
    },
    studentResults: {
      type: Map,
      required: false,
      default: {},
      of: StudentResult
    }
  })
);

function validateResult(result) {
  const schema = {
    name: Joi.string()
      .min(5)
      .max(50)
      .required(),
    phone: Joi.string()
      .min(5)
      .max(50)
      .required(),
    isGold: Joi.boolean()
  };

  return Joi.validate(result, schema);
}

exports.TestResult = TestResult;
exports.validate = validateResult;
