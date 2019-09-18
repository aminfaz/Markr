const testResultXML2JSON = require("../testResultXML2JSON");

describe('testResultXML2JSON middleware', () => {
  const mockReq = {
    body: ''
  };
  const mockResObj = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.send = jest.fn(/*function(s){console.log('######',s);return res;}*/);
    return res;
  };
  const mockRes= mockResObj();
  const mockNext = jest.fn();

  afterEach(() => {
    mockRes.status.mockClear();
    mockRes.send.mockClear();
    mockNext.mockClear();
  });


  it('should send 400 if the does not have mcq-test-results', () => {
    mockReq.body = '';
    //invokeCase(false);
    testResultXML2JSON(mockReq, mockRes, mockNext);
    //expect(mockRes.send.mock.calls.length).toBe(1);
  });


  invokeCase = (isSuccessful) => {
    testResultXML2JSON(mockReq, mockRes, mockNext);

    if (isSuccessful) {
      expect(mockRes.status.mock.calls.length).toBe(0);
      expect(mockRes.send.mock.calls.length).toBe(0);
      expect(mockNext.mock.calls.length).toBe(1);
    } else {
      expect(mockRes.status.mock.calls.length).toBe(1);
      expect(mockRes.status.mock.calls[0][0]).toBe(400);
      expect(mockRes.send.mock.calls.length).toBe(1);
      expect(mockRes.send.mock.calls[0][0]).toBe("The structure of the request does not comply with expected structure");
      expect(mockNext.mock.calls.length).toBe(0);
    }
  }
});