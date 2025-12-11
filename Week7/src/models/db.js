const { MongoClient } = require('mongodb');

// MongoDB URI and options
// Option 1: Local MongoDB (default)
const uri = 'mongodb://localhost:27017';

// Option 2: MongoDB Atlas (uncomment and add your connection string)
// const uri = 'mongodb+srv://<username>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority';

const dbName = 'demo';

let dbInstance;
let clientInstance;

async function connectToDb() {
  if (dbInstance) return dbInstance;

  try {
    clientInstance = new MongoClient(uri);
    await clientInstance.connect();
    console.log('✓ Connected to MongoDB successfully');
    console.log(`✓ Using database: ${dbName}`);
    dbInstance = clientInstance.db(dbName);
    return dbInstance;
  } catch (error) {
    console.error('✗ Failed to connect to MongoDB:', error.message);
    console.error('Make sure MongoDB is running or use MongoDB Atlas');
    throw error;
  }
}

module.exports = { connectToDb };