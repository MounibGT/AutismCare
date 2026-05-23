import mongoose from "mongoose";
import { config } from "dotenv";
import dns from "dns";

// Load environment variables
config({
  path: ".env",
  override: false,
});

// Force Node.js to use IPv4 DNS first (fixes SRV lookup issues with IPv6 DNS)
dns.setDefaultResultOrder("ipv4first");

/**
 * Fix for MongoDB Atlas SRV DNS resolution on some networks/routers.
 *
 * Symptom: `querySrv ECONNREFUSED _mongodb._tcp.<cluster>.mongodb.net`
 *
 * Root cause: the machine's configured DNS server (often an IPv6 router DNS)
 * fails SRV queries. The MongoDB driver uses SRV DNS for `mongodb+srv://`.
 *
 * Solutions:
 * - Best: fix Windows DNS (e.g. set to 8.8.8.8 / 1.1.1.1).
 * - App-level workaround: force Node's DNS resolver to use known-good servers.
 *
 * Configure via env:
 *   MONGODB_DNS_SERVERS=8.8.8.8,1.1.1.1
 */
const dnsServers = process.env.MONGODB_DNS_SERVERS
  ? process.env.MONGODB_DNS_SERVERS.split(",").map((s) => s.trim()).filter(Boolean)
  : (process.env.NODE_ENV !== "production" ? ["8.8.8.8", "1.1.1.1"] : null);

if (dnsServers && dnsServers.length > 0) {
  dns.setServers(dnsServers);
}

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env",
  );
}

// Define proper type for mongoose cache
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached: MongooseCache;

const globalMongoose = global as unknown as { mongoose?: MongooseCache };

if (globalMongoose.mongoose) {
  cached = globalMongoose.mongoose;
} else {
  cached = { conn: null, promise: null };
  globalMongoose.mongoose = cached;
}

async function connectToDatabase(retries = 3, delay = 2000) {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    }).catch((err) => {
      console.error("MongoDB Connection Error:", err.message);
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    
    // Retry logic
    if (retries > 0) {
      console.log(`Retrying MongoDB connection... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return connectToDatabase(retries - 1, delay * 2);
    }
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase;