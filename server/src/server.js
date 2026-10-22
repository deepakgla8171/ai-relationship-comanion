const app = require('./app');
const config = require('./config/env');
const { connectDB, getDbStatus } = require('./config/db');

const startServer = async() => {
    console.log('✨ Starting AI Relationship Companion Server...');

    // Initialize DB or Demo store


    const server = app.listen(config.port, () => {
        console.log(`\n======================================================`);
        console.log(`🚀 AI Relationship Companion Server running on port ${config.port}`);
        console.log(`🌍 Environment: ${config.nodeEnv}`);
        console.log(`💾 Storage Engine: ${dbStatus.mode.toUpperCase()}`);
        console.log(`🤖 AI Provider: ${config.aiProvider} (Model: ${config.aiModel})`);
        console.log(`📡 Health Check: http://localhost:${config.port}/api/health`);
        console.log(`======================================================\n`);
    });

    // Graceful shutdown handling
    const shutdown = () => {
        console.log('\n🛑 Graceful shutdown initiated. Closing HTTP server...');
        server.close(() => {
            console.log('HTTP server closed.');
            process.exit(0);
        });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
};

if (require.main === module) {
    startServer();
}

module.exports = { startServer };