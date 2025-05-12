// utils/tickers.js
require('dotenv').config();
const axios = require('axios');

let validTickers = [];


const fetchTickerList = async () => {
    try {
        const response = await axios.get('http://20.244.56.144/evaluation-service/stocks', {
            headers: {
                Authorization: `Bearer ${process.env.ACCESS_TOKEN}`
            }
        });

        
        validTickers = Object.values(response.data.stocks);
        console.log(" Ticker List Fetched Successfully:");
        console.log(validTickers);
    } catch (error) {
        console.error(" Error fetching ticker list:", error.response ? error.response.data : error.message);
    }
};


const isValidTicker = (ticker) => {
    if (validTickers.length === 0) {
        console.log(" Ticker list is empty, fetching now...");
        fetchTickerList(); 
    }
    return validTickers.includes(ticker);
};


fetchTickerList();

module.exports = { validTickers, fetchTickerList, isValidTicker };
