const mongoose = require('mongoose');
const config = require('./env');

let isConnected = false;
let isDemoStorage = true;



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