// Vercel serverless function wrapper for Express app
// Import the Express app (which is exported from server/index.js)
const app = require('../server/index.js');

// Vercel expects a default export function
module.exports = app;

