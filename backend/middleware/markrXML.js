module.exports = function(req, res, next) {
  const contentType = req.headers["content-type"];
  if (contentType !== "text/xml+markr") {
    return res.status(415).send("Unsupported Media Type");
  }
  next();
};
