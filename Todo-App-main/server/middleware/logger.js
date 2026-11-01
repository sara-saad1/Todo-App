// Simple request logger — nothing fancy, just timestamps and method+url.
// Really helpful when running the server locally and you want to see exactly
// which endpoints the frontend is hitting and in what order.
const logger = (req, res, next) => {
  const time = new Date().toISOString();
  console.log(`[${time}]  ${req.method.padEnd(7)} ${req.originalUrl}`);
  next();
};

module.exports = logger;
