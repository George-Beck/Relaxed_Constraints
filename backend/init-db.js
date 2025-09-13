const { initializeDatabase, seedInitialData } = require('./database/db');

async function init() {
  try {
    console.log('🚀 Initializing Research Portfolio Database...');
    await initializeDatabase();
    await seedInitialData();
    console.log('✅ Database initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

init();
