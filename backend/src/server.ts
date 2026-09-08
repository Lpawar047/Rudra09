import app from './app';
import { initDb } from './config/db';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await initDb();
    app.listen(PORT, () => {
      console.log(`🚀 Rudra Services Backend API server running on port ${PORT}`);
      console.log(`📡 Health Check URL: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Fatal Server Initialization Error:', error);
    process.exit(1);
  }
}

startServer();
