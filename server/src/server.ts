import express, { Request, Response } from 'express';
import { ApolloServer } from 'apollo-server-express';
import { fileURLToPath } from 'url';
import path from 'path';
import db from './config/connection.js';
import { typeDefs, resolvers } from './schemas/index.js';
import { authMiddleware } from './utils/auth.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Handle __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Apollo Server setup
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
  cache: 'bounded', // Prevent unbounded memory use
});

await server.start();
server.applyMiddleware({ app });

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// ✅ Root health check route (optional but helpful for Render)
app.get('/health', (_req: Request, res: Response) => {
  (res as any).send('API is up ✅'); // Fix for TS error
});

// ✅ Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/dist')));

  // React Router fallback route
  app.get('*', (_req: Request, res: Response) => {
    (res as any).sendFile(path.join(__dirname, '../../client/dist/index.html')); // Fix for TS error
  });
}

// Start the server
db.once('open', () => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}${server.graphqlPath}`);
  });
});