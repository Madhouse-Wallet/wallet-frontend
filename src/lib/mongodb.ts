import { MongoClient } from "mongodb";

if (!process.env.NEXT_PUBLIC_MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.NEXT_PUBLIC_MONGODB_URI;
const options = { appName: "devrel.template.nextjs" };

let client: MongoClient;

if (process.env.NEXT_PUBLIC_NODE_ENV === "development") {
  let globalWithMongo = global as typeof globalThis & {
    _mongoClient?: MongoClient;
  };

  if (!globalWithMongo._mongoClient) {
    globalWithMongo._mongoClient = new MongoClient(uri, options);
  }
  client = globalWithMongo._mongoClient;
} else {
  client = new MongoClient(uri, options);
}

export default client;