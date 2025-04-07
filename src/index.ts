import express from 'express';
import { MongoClient, Db } from 'mongodb';
import contactsRouter from './routes/contacts'; // Import du routeur
import notesRouter from './routes/notes'; // Import du routeur
import authRouter from './routes/auth'; 
import authMiddleware from './middlewares/authMiddleware'; // Import du middleware
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';


const url = 'mongodb://localhost:27017/';
const dbName = 'soltrim-database';

const app = express();
dotenv.config();
app.use(express.json());
app.use(cookieParser());

let db: Db; // Variable pour stocker la connexion MongoDB

async function connectToMongo() {
  try {
    const client = await MongoClient.connect(url);
    console.log("Connecté à MongoDB");
    db = client.db(dbName);

    // Injecter la base de données dans le routeur
    app.use('/api', authMiddleware); // Utiliser le middleware d'authentification
    
    app.use('/api', contactsRouter(db)); 
    app.use('/api', notesRouter(db));
    app.use('/api', authRouter(db));    

    // Démarrer le serveur après la connexion à MongoDB
    app.listen(3000, () => {
      console.log('Server is running on port 3000');
    });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Quitter le processus en cas d'erreur
  }
}

// Connecter à MongoDB
connectToMongo();

