const express = require("express");
const winston = require("winston");
const router = express.Router();
const { TestResult } = require("../models/testResult");

router.get('/:id/aggregate', async (req, res) => {
  const testResult = await TestResult.findById(req.params.id);
  if (!testResult){
    return res.status(404).send('The test with the given ID was not found.');
  }

  res.send({
    mean: testResult.mean,
    count: testResult.studentResults.size,
    p25: testResult.p25,
    p50: testResult.p50,
    p75: testResult.p75
  });
});

module.exports = router;