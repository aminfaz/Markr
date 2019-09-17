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
    obtainedMarks: {
      type: Number,
      required: true,
      min: 1
    },
    percentage: {
      type: Number,
      default: 0,
      required: false,
      min: 0,
      max: 100
    },
    rank: {
      type: Number,
      default: 0,
      required: false,
      min: 0
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
    },
    meanMark: {
      type: Number,
      default: 0,
      required: false,
      min: 0
    },
    meanPercentage: {
      type: Number,
      default: 0,
      required: false,
      min: 0,
      max: 100
    },
    p25: {
      type: Number,
      default: 0,
      required: false,
      min: 0,
      max: 100
    },
    p50: {
      type: Number,
      default: 0,
      required: false,
      min: 0,
      max: 100
    },
    p75: {
      type: Number,
      default: 0,
      required: false,
      min: 0,
      max: 100
    }
  })
);

exports.TestResult = TestResult;
