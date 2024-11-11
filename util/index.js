function responseHandler(res, error, result) {
  if (error) {
    res.status(400).send(error.message);
  } else {
    res.status(200).send(result);
  }
}

module.exports = {
  responseHandler,
};
