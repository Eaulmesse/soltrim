import { Router, Request, Response } from 'express';
import { Db, ObjectId } from 'mongodb';
import { User, validateUser, hashPassword, comparePassword } from '../models/user';

export default (db: Db) => {
    const router = Router();

    // route LOGIN
    router.post('/login', async (req: Request, res: Response) => {
        const { email, password } = req.body;
    
        // Validation des données
        if (!email || !password) {
            res.status(400).send('Email et mot de passe requis.');
            return;
        }
    
        try {
            const user = await db.collection('users').findOne({ email });
            if (!user) {
                res.status(401).send('Email ou mot de passe incorrect.');
                return;
            }
            
            const passwordMatch = comparePassword(password, user.hashedPassword); 
            if (!passwordMatch) {
                res.status(401).send('Email ou mot de passe incorrect.');
                return;
            }
    
            // Création d'un token JWT (JSON Web Token) pour l'utilisateur
            res.status(200).send({ message: 'Connexion réussie!' });
        } catch (error) {
            console.error('Erreur lors de la connexion:', error);
            res.status(500).send('Erreur interne du serveur.');
        }
    });


    // route REGISTER
    router.post('/register', async (req: Request, res: Response) => {
        const { email, password } = req.body;
        // Validation des données
        

        // Vérification si l'utilisateur existe déjà
        try {
            const validationError = validateUser({ email, password });
            if (validationError) {
                res.status(400).send(validationError);
                return ;
            }

            const existingUser = await db.collection('users').findOne({ email });
            if (existingUser) {
                res.status(409).send('Nom d\'utilisateur déjà pris.');
                return ;
            }


            const hashedPassword = hashPassword(password); 
            // Insertion de l'utilisateur dans la base de données
            await db.collection('users').insertOne({ email, hashedPassword });
            res.status(201).send({ message: 'Inscription réussie!' });
        } catch (error) {
            console.error('Erreur lors de l\'inscription:', error);
            res.status(500).send('Erreur interne du serveur.');
        }
    });

    return router;
}

