// Do not change this file
require('dotenv').config();
const MongoClient= require('mongodb').MongoClient;

async function main(callback) {
    const URI = process.env.MONGO // Declare MONGO_URI in your .env file
    console.log(URI)
  

    try {
        // Connect to the MongoDB cluster
         const client = MongoClient.connect(URI, { useNewUrlParser: true, useUnifiedTopology: true });

        // Make the appropriate DB calls
        await callback();
 
    } catch (e) { 
        // Catch any errors
        console.error(e);
        throw new Error('Unable to Connect to Database')
    } 
} 

module.exports = main;