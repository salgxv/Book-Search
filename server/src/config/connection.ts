import mongoose from 'mongoose';

const connectionString = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/booksearch';

mongoose.connect(connectionString); // ✅ no options needed

export default mongoose.connection;