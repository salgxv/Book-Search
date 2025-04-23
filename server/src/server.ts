import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { fileURLToPath } from 'url';
import path from 'path';
import db from './config/connection.js';
import { typeDefs, resolvers } from './schemas/index.js';
import { authMiddleware } from './utils/auth.js';
import type { Request, Response } from 'express';

const app = express() as any;
const PORT = process.env.PORT || 3001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
});

await server.start();
server.applyMiddleware({ app });

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// ✅ Serve Vite frontend build files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/dist')));

  app.get('*', (_: Request, res: Response) => {
    (res as any).sendFile(path.join(__dirname, '../../client/dist/index.html'));
  });
}

db.once('open', () => {
  app.listen(PORT, () => {
    console.log(`🌍 Now listening on http://localhost:${PORT}${server.graphqlPath}`);
  });
});