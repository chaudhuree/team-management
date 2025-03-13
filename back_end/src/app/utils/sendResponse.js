const sendResponse = (res, data) => {
  const responseData = {
    success: data.success,
    statusCode: data.statusCode,
    message: data.message || null,
    meta: data.meta || null,
    data: data.data || null,
  };

  res.status(data.statusCode || 200).json(responseData); // Apply the default here
};

module.exports = sendResponse;