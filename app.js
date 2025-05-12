
// app.js
require('dotenv').config();
const express = require('express');
const stockRoutes = require('./routes/stockRoutes');

const app = express();
app.use(express.json());

app.use('/stocks', stockRoutes);


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(` Backend server is running at:`);
    console.log(` API Base URL: http://localhost:${PORT}`);
    console.log(` Stock Price Endpoint: http://localhost:${PORT}/stocks/NVDA?minutes=30`);
});
