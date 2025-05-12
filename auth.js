// utils/auth.js
require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const getAuthToken = async () => {
    try {
        console.log("\nEnvironment Variables:");
        console.log("EMAIL:", process.env.EMAIL);
        console.log("NAME:", process.env.NAME);
        console.log("ROLL_NO:", process.env.ROLL_NO);
        console.log("ACCESS_CODE:", process.env.ACCESS_CODE);
        console.log("CLIENT_ID:", process.env.CLIENT_ID);
        console.log("CLIENT_SECRET:", process.env.CLIENT_SECRET);

        const response = await axios.post('http://20.244.56.144/evaluation-service/auth', {
            email: process.env.EMAIL,
            name: process.env.NAME,
            rollNo: process.env.ROLL_NO,
            accessCode: process.env.ACCESS_CODE,
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET
        });

        const token = response.data.access_token;
        console.log("New Access Token Generated:", token);

 
        const envFilePath = path.join(__dirname, '../.env');
        let envContent = fs.readFileSync(envFilePath, 'utf8');
        
    
        if (envContent.includes("ACCESS_TOKEN=")) {
            envContent = envContent.replace(/ACCESS_TOKEN=.*/, `ACCESS_TOKEN=${token}`);
        } else {
            envContent += `\nACCESS_TOKEN=${token}\n`;
        }

        fs.writeFileSync(envFilePath, envContent);
        console.log(".env file updated with new access token.");

        return token;
    } catch (error) {
        console.error("Error generating token:", error.response ? error.response.data : error.message);
        return null;
    }
};


if (require.main === module) {
    getAuthToken();
}

module.exports = { getAuthToken };
