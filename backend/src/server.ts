import app from './app';
import dotenv from 'dotenv';
import { connectDatabase, closeDatabaseConnection } from './config/database';

// Load environment variables
dotenv.config();

const PORT = parseInt(process.env.PORT || '5000', 10);
const NODE_ENV = process.env.NODE_ENV || 'development';

// Start server with database connection
const startServer = async () => {
  try {
    // Connect to database first
    await connectDatabase();

    // Then start the server - listen on 0.0.0.0 for WSL compatibility
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running in ${NODE_ENV} mode on port ${PORT}`);
      console.log(`📡 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 API endpoint: http://localhost:${PORT}/api`);
    });

    // Graceful shutdown with timeout
    let isShuttingDown = false;

    const gracefulShutdown = async (signal: string) => {
      if (isShuttingDown) {
        console.log('⚠️ Shutdown already in progress...');
        return;
      }

      isShuttingDown = true;
      console.log(`\n${signal} signal received: closing HTTP server`);

      // Set a timeout for forced shutdown (5 seconds)
      const forceShutdownTimer = setTimeout(() => {
        console.error('⚠️ Forcing shutdown after timeout');
        process.exit(1);
      }, 5000);

      try {
        // Close HTTP server (stops accepting new connections)
        await new Promise<void>((resolve) => {
          server.close(() => {
            console.log('✅ HTTP server closed');
            resolve();
          });
        });

        // Close database connection
        await closeDatabaseConnection();

        clearTimeout(forceShutdownTimer);
        console.log('👋 Shutdown complete');
        process.exit(0);
      } catch (error) {
        console.error('❌ Error during shutdown:', error);
        clearTimeout(forceShutdownTimer);
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle unhandled promise rejections
    process.on('unhandledRejection', async (err: Error) => {
      console.error('Unhandled Promise Rejection:', err);
      // Close server and exit process
      server.close(async () => {
        await closeDatabaseConnection();
        process.exit(1);
      });
    });

    return server;
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
const server = startServer();

export default server;