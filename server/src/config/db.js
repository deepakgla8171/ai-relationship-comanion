const mongoose = require('mongoose');
const config = require('./env');

let isConnected = false;
let isDemoStorage = true;

const connectDB = async() => {
    if (!config.mongodbUri || config.mongodbUri.trim() === '' || config.mongodbUri === 'demo') {
        console.log('ℹ️  No MongoDB URI provided. Running in LOCAL IN-MEMORY DEMO MODE.');
        console.log('   All data is stored in memory for this session and fully isolated.');
        isConnected = false;
        isDemoStorage = true;
        return false;
    }
    try {
        const conn = await mongoose.connect(config.mongodbUri, {
            serverSelectionTimeoutMS: 4000,
            connectTimeoutMS: 4000
        });

        isConnected = true;
        isDemoStorage = false;
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        return true;
    } catch (error) {
        console.warn(`⚠️  MongoDB Connection failed (${error.message}).`);
        console.warn('   Falling back to LOCAL IN-MEMORY DEMO MODE automatically.');
        isConnected = false;
        isDemoStorage = true;
        return false;
    }
};

const getDbStatus = () => ({
    isConnected,
    isDemoStorage,
    mode: isDemoStorage ? 'in-memory-demo' : 'mongodb'
});

module.exports = {
    connectDB,
    getDbStatus
};