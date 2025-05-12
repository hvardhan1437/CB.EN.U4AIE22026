// stockRoutes.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();
const { validTickers, fetchTickerList, isValidTicker } = require('../utils/tickers');


router.use(async (req, res, next) => {
    console.log("Using Access Token:", process.env.ACCESS_TOKEN);
    req.headers.Authorization = `Bearer ${process.env.ACCESS_TOKEN}`;
    next();
});


router.get('/', (req, res) => {
    res.send("Stock API is running with authentication");
});

router.get('/correlation', async (req, res) => {
    const tickers = req.query.ticker;
    const minutes = req.query.minutes || 60;

    if (!tickers || tickers.split(',').length !== 2) {
        console.log("Invalid ticker input:", tickers);
        return res.status(400).json({ error: "Please provide exactly two tickers for correlation." });
    }

    const [ticker1, ticker2] = tickers.split(',');

 
    const validTicker1 = await isValidTicker(ticker1);
    const validTicker2 = await isValidTicker(ticker2);

    if (!validTicker1 || !validTicker2) {
        console.log("Invalid tickers:", ticker1, ticker2);
        return res.status(400).json({ error: `Invalid tickers: ${ticker1}, ${ticker2}. Please check the available tickers.` });
    }

    try {
        const url1 = `http://20.244.56.144/evaluation-service/stocks/${ticker1}?minutes=${minutes}`;
        const url2 = `http://20.244.56.144/evaluation-service/stocks/${ticker2}?minutes=${minutes}`;

        console.log("Correlation URL 1:", url1);
        console.log("Correlation URL 2:", url2);

        
        const [response1, response2] = await Promise.all([
            axios.get(url1, {
                headers: { Authorization: `Bearer ${process.env.ACCESS_TOKEN}` }
            }),
            axios.get(url2, {
                headers: { Authorization: `Bearer ${process.env.ACCESS_TOKEN}` }
            })
        ]);

        console.log("Successfully fetched data for both tickers");

        const prices1 = response1.data;
        const prices2 = response2.data;

        
        if (!prices1 || prices1.length === 0) {
            console.log(`No price data available for ticker '${ticker1}'`);
            return res.status(404).json({ error: `No price data available for ticker '${ticker1}' in the last ${minutes} minutes.` });
        }

        if (!prices2 || prices2.length === 0) {
            console.log(`No price data available for ticker '${ticker2}'`);
            return res.status(404).json({ error: `No price data available for ticker '${ticker2}' in the last ${minutes} minutes.` });
        }

        console.log("Prices for", ticker1, ":", prices1);
        console.log("Prices for", ticker2, ":", prices2);

        const pricesList1 = prices1.map(item => item.price);
        const pricesList2 = prices2.map(item => item.price);

    
        const avg1 = pricesList1.reduce((sum, p) => sum + p, 0) / pricesList1.length;
        const avg2 = pricesList2.reduce((sum, p) => sum + p, 0) / pricesList2.length;

     
        const covariance = pricesList1.reduce((sum, p, i) => sum + (p - avg1) * (pricesList2[i] - avg2), 0) / pricesList1.length;
        const stdDev1 = Math.sqrt(pricesList1.reduce((sum, p) => sum + Math.pow(p - avg1, 2), 0) / pricesList1.length);
        const stdDev2 = Math.sqrt(pricesList2.reduce((sum, p) => sum + Math.pow(p - avg2, 2), 0) / pricesList2.length);


        const correlation = (covariance / (stdDev1 * stdDev2)).toFixed(4);

        console.log("Calculated Correlation:", correlation);

        res.json({
            correlation: parseFloat(correlation),
            stocks: {
                [ticker1]: {
                    averagePrice: avg1.toFixed(2),
                    priceHistory: prices1
                },
                [ticker2]: {
                    averagePrice: avg2.toFixed(2),
                    priceHistory: prices2
                }
            }
        });
    } catch (error) {
        console.error("Error fetching stock data:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "Failed to fetch correlation data" });
    }
});

// Average Stock Price Endpoint
router.get('/:ticker', async (req, res) => {
    const ticker = req.params.ticker;
    const minutes = req.query.minutes || 60;

    
    if (!(await isValidTicker(ticker))) {
        console.log(`Invalid ticker: ${ticker}`);
        return res.status(400).json({ error: `Ticker '${ticker}' is not a valid stock symbol.` });
    }

    try {
        const url = `http://20.244.56.144/evaluation-service/stocks/${ticker}?minutes=${minutes}`;
        console.log("Average Price URL:", url);

        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${process.env.ACCESS_TOKEN}`
            }
        });

        const prices = response.data;
        console.log("Raw API Response:", prices);

        // Check if prices array is empty
        if (!prices || prices.length === 0) {
            console.log("Empty price list received");
            return res.status(404).json({ error: `No price data available for ticker '${ticker}' in the last ${minutes} minutes.` });
        }

        const averagePrice = (prices.reduce((sum, item) => sum + item.price, 0) / prices.length).toFixed(2);
        console.log("Average Price Calculated:", averagePrice);

        res.json({
            averageStockPrice: parseFloat(averagePrice),
            priceHistory: prices
        });
    } catch (error) {
        console.error("Error fetching stock data:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "Failed to fetch stock data" });
    }
});

module.exports = router;
