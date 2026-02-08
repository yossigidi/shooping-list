module.exports = (req, res) => {
  res.json({
    success: true,
    message: 'API is working!',
    time: new Date().toISOString()
  });
};
