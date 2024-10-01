// server.js

import express from 'express';
import routes from './routes/index.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Load routes
app.use('/', routes);

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
