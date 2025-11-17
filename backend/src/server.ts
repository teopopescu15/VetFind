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

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('SIGTERM signal received: closing HTTP server');
      server.close(async () => {
        console.log('HTTP server closed');
        await closeDatabaseConnection();
        process.exit(0);
      });
    });

    process.on('SIGINT', async () => {
      console.log('SIGINT signal received: closing HTTP server');
      server.close(async () => {
        console.log('HTTP server closed');
        await closeDatabaseConnection();
        process.exit(0);
      });
    });

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