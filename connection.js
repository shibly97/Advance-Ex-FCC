// Do not change this file
require('dotenv').config();
const { MongoClient } = require('mongodb');

async function main(callback) {
    const URI = process.env.MONGO // Declare MONGO_URI in your .env file
    console.log(URI)
    const client = new MongoClient(URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log(client)

    try {
        // Connect to the MongoDB cluster
        const connection = await client.connect();

        // Make the appropriate DB calls
        await callback(connection);

    } catch (e) {
        // Catch any errors
        console.error(e);
        throw new Error('Unable to Connect to Database')
    } 
} 

module.exports = main;