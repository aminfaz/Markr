const markrXML = require("../markrXML");

describe('markrXML middleware', () => {
  const mockResObj = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
  };
  const mockRes= mockResObj();
  const mockNext = jest.fn();

  afterEach(() => {
    mockRes.status.mockClear();
    mockRes.send.mockClear();
    mockNext.mockClear();
  });

  it('should proceed if the content type is valid', () => {
    const mockReq = {
      header: jest.fn().mockReturnValue("text/xml+markr")
    };

    markrXML(mockReq, mockRes, mockNext);

    expect(mockRes.status.mock.calls.length).toBe(0);
    expect(mockRes.send.mock.calls.length).toBe(0);
    expect(mockNext.mock.calls.length).toBe(1);
  });

  it('should send 415 if the content type is xml', () => {
    invalidCase('text/xml');
  });

  it('should send 415 if the content type is json', () => {
    invalidCase('application/json');
  });

  it('should send 415 if the content type is not defined', () => {
    invalidCase(undefined);
  });

  function invalidCase(contentType){
    const mockReq = {
      header: jest.fn().mockReturnValue(contentType)
    };

    markrXML(mockReq, mockRes, mockNext);

    expect(mockRes.status.mock.calls.length).toBe(1);
    expect(mockRes.status.mock.calls[0][0]).toBe(415);
    expect(mockRes.send.mock.calls.length).toBe(1);
    expect(mockRes.send.mock.calls[0][0]).toBe("Unsupported Media Type");
    expect(mockNext.mock.calls.length).toBe(0);
  }
});