import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "";

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable in .env");
}

type MongooseCache = {
  conn: typeof mongoose | null;
};

const globalForMongo = globalThis as typeof globalThis & {
  _mongo?: MongooseCache;
};

const cached = globalForMongo._mongo ?? {
  conn: null,
};

export async function connectToDatabase() {
  if (cached.conn) return cached.conn;

  const conn = await mongoose.connect(MONGODB_URI);
  cached.conn = conn;
  globalForMongo._mongo = cached;
  return conn;
}

export default connectToDatabase;
