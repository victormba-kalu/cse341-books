import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("MONGODB_URI is missing from environment variables!");
  process.exit(1);
}

const client = new MongoClient(uri);

async function testConnection() {
  try {
    await client.connect();
    await client.db().admin().ping();
    console.log("SUCCESS: Connected to MongoDB Atlas successfully!");
  } catch (error) {
    console.error("CONNECTION FAILED:", error);
  } finally {
    await client.close();
  }
}

testConnection();