const request = require("supertest");
const { TestResult } = require("../../../models/testResult");

describe("[POST] /api/import", () => {
  let server;

  const exec = async (contentType, body) => {
    return await request(server)
      .post("/api/import")
      .set("Content-Type", contentType)
      .send(body);
  };

  beforeEach(async () => {
    if (server) {
      await server.close();
    }
    server = require("../../../index");
  });

  afterEach(async () => {
    await server.close();
    await TestResult.deleteMany({});
  });

  describe("Invalid Content Type", () => {
    it("should return 415 for xml", async () => {
      const res = await exec("text/xml", "<note><to>Tove</to></note>");
      expect(res.status).toBe(415);
    });

    it("should return 415 for json", async () => {
      const res = await exec("appliacation/json", {
        result: {}
      });
      expect(res.status).toBe(415);
    });
  });

  describe("Invalid XML", () => {
    it("should return 400 for not matching tags", async () => {
      const res = await exec("text/xml+markr", "<note><to>Tove</too></note>");
      expect(res.status).toBe(400);
    });

    it("should return 400 for plain text", async () => {
      const res = await exec("text/xml+markr", "my plain text");
      expect(res.status).toBe(400);
    });
  });

  describe("Invalid Test Result XML", () => {
    function assertion(res) {
      expect(res.status).toBe(400);
      expect(res.text).toBe(
        "The structure of the request does not comply with expected structure"
      );
    }

    it("should return 400 for not having the mcq-test-results tag", async () => {
      const res = await exec(
        "text/xml+markr",
        "<root><name>my name</name></root>"
      );
      assertion(res);
    });

    it("should return 400 for having nested mcq-test-results tag", async () => {
      const res = await exec(
        "text/xml+markr",
        `<?xml version="1.0" encoding="UTF-8" ?>
        <root>
          <mcq-test-results>
            <foo>bar</foo>
          </mcq-test-results>
        </root>`
      );
      assertion(res);
    });

    it("should return 400 for having empty mcq-test-results tag", async () => {
      const res = await exec(
        "text/xml+markr",
        `<?xml version="1.0" encoding="UTF-8" ?>
        <mcq-test-results>
        </mcq-test-results>`
      );
      assertion(res);
    });

    it("should return 400 for having empty mcq-test-result tag", async () => {
      const res = await exec(
        "text/xml+markr",
        `<?xml version="1.0" encoding="UTF-8" ?>
        <mcq-test-results>
          <mcq-test-result>
          </mcq-test-result>
        </mcq-test-results>`
      );
      assertion(res);
    });

    it("should return 400 for having no first name", async () => {
      const res = await exec(
        "text/xml+markr",
        `<?xml version="1.0" encoding="UTF-8" ?>
        <mcq-test-results>
          <mcq-test-result>
            <last-name>Ali</last-name>
            <student-number>456</student-number>
            <test-id>123</test-id>
            <summary-marks available="20" obtained="13" />
          </mcq-test-result>
        </mcq-test-results>`
      );
      assertion(res);
    });

    it("should return 400 for having combination of valid result and invalid", async () => {
      const res = await exec(
        "text/xml+markr",
        `<?xml version="1.0" encoding="UTF-8" ?>
        <mcq-test-results>
          <mcq-test-result>
            <first-name>Bashir</first-name>
            <last-name>Ali</last-name>
            <student-number>456</student-number>
            <test-id>123</test-id>
            <summary-marks available="20" obtained="13" />
          </mcq-test-result>
          <mcq-test-result>
            <first-name>Bashiri</first-name>
            <last-name>Ali</last-name>
            <student-number>4567</student-number>
            <summary-marks available="20" obtained="13" />
          </mcq-test-result>
        </mcq-test-results>`
      );
      assertion(res);
    });
  });

  describe("Valid payload", () => {
    const aggregate = ms => new Promise(res => setTimeout(res, ms));

    it("should return 200 for single new result", async () => {
      const res = await exec(
        "text/xml+markr",
        `<?xml version="1.0" encoding="UTF-8" ?>
        <mcq-test-results>
          <mcq-test-result>
            <first-name>Bashir</first-name>
            <last-name>Ali</last-name>
            <student-number>456</student-number>
            <test-id>123</test-id>
            <summary-marks available="20" obtained="13" />
          </mcq-test-result>
        </mcq-test-results>`
      );
      expect(res.status).toBe(200);

      await aggregate(3000);

      const testResult_Actual = await TestResult.findById("123");

      const testResult_Expected = {
        availableMarks: 20,
        studentResults: {
          "456": {
            percentage: 65,
            rank: 1,
            number: "456",
            firstName: "Bashir",
            lastName: "Ali",
            obtainedMarks: 13
          }
        },
        meanMark: 13,
        meanPercentage: 65,
        p25: 65,
        p50: 65,
        p75: 65,
        _id: "123",
        __v: 0
      };

      expect(JSON.stringify(testResult_Actual)).toEqual(
        JSON.stringify(testResult_Expected)
      );
    });

    it("should return 200 for single new test with multiple students", async () => {
      const res = await exec(
        "text/xml+markr",
        `<?xml version="1.0" encoding="UTF-8" ?>
        <mcq-test-results>
          <mcq-test-result>
            <first-name>Bashir</first-name>
            <last-name>Ali</last-name>
            <student-number>456</student-number>
            <test-id>123</test-id>
            <summary-marks available="20" obtained="13" />
          </mcq-test-result>
          <mcq-test-result>
            <first-name>Bashir</first-name>
            <last-name>Moh</last-name>
            <student-number>678</student-number>
            <test-id>123</test-id>
            <summary-marks available="20" obtained="18" />
          </mcq-test-result>
        </mcq-test-results>`
      );
      expect(res.status).toBe(200);

      await aggregate(3000);

      const testResult_Actual = await TestResult.findById("123");

      const testResult_Expected = {
        availableMarks: 20,
        studentResults: {
          "456": {
            percentage: 65,
            rank: 2,
            number: "456",
            firstName: "Bashir",
            lastName: "Ali",
            obtainedMarks: 13
          },
          "678": {
            percentage: 90,
            rank: 1,
            number: "678",
            firstName: "Bashir",
            lastName: "Moh",
            obtainedMarks: 18
          }
        },
        meanMark: 15.5,
        meanPercentage: 77.5,
        p25: 65,
        p50: 90,
        p75: 90,
        _id: "123",
        __v: 0
      };
      expect(JSON.stringify(testResult_Actual)).toEqual(
        JSON.stringify(testResult_Expected)
      );
    });

    it("should return 200 for single two tests with multiple students", async () => {
      const res = await exec(
        "text/xml+markr",
        `<?xml version="1.0" encoding="UTF-8" ?>
        <mcq-test-results>
          <mcq-test-result>
            <first-name>Bashir</first-name>
            <last-name>Ali</last-name>
            <student-number>456</student-number>
            <test-id>123</test-id>
            <summary-marks available="20" obtained="13" />
          </mcq-test-result>
          <mcq-test-result>
            <first-name>Bashir</first-name>
            <last-name>Moh</last-name>
            <student-number>678</student-number>
            <test-id>124</test-id>
            <summary-marks available="20" obtained="18" />
          </mcq-test-result>
        </mcq-test-results>`
      );
      expect(res.status).toBe(200);

      await aggregate(3000);

      let testResult_Actual = await TestResult.findById("123");

      let testResult_Expected = {
        availableMarks: 20,
        studentResults: {
          "456": {
            percentage: 65,
            rank: 1,
            number: "456",
            firstName: "Bashir",
            lastName: "Ali",
            obtainedMarks: 13
          }
        },
        meanMark: 13,
        meanPercentage: 65,
        p25: 65,
        p50: 65,
        p75: 65,
        _id: "123",
        __v: 0
      };

      expect(JSON.stringify(testResult_Actual)).toEqual(
        JSON.stringify(testResult_Expected)
      );

      testResult_Actual = await TestResult.findById("124");

      testResult_Expected = {
        availableMarks: 20,
        studentResults: {
          "678": {
            percentage: 90,
            rank: 1,
            number: "678",
            firstName: "Bashir",
            lastName: "Moh",
            obtainedMarks: 18
          }
        },
        meanMark: 18,
        meanPercentage: 90,
        p25: 90,
        p50: 90,
        p75: 90,
        _id: "124",
        __v: 0
      };

      expect(JSON.stringify(testResult_Actual)).toEqual(
        JSON.stringify(testResult_Expected)
      );
    });
  });
});
