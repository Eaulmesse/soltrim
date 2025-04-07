import { Router, Request, Response } from 'express';
import { Db, ObjectId } from 'mongodb';
import { User, validateUser, hashPassword, comparePassword } from '../models/user';
const jwt = require('jsonwebtoken');

export default (db: Db) => {
    const router = Router();

    // route LOGIN
    router.post('/login', async (req: Request, res: Response) => {
        const { email, password } = req.body;
    
        
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
    
            
            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
                expiresIn: '1h',
            });

            res.cookie('token', token, { httpOnly: true, secure: true });
            res.status(200).send({ message: 'Connexion réussie!' , token });

            return;
        } catch (error) {
            console.error('Erreur lors de la connexion:', error);
            res.status(500).send('Erreur interne du serveur.');
        }
    });


    // route REGISTER
    router.post('/register', async (req: Request, res: Response) => {
        const { email, password } = req.body;
        
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
            
            await db.collection('users').insertOne({ email, hashedPassword });
            res.status(201).send({ message: 'Inscription réussie!' });
        } catch (error) {
            console.error('Erreur lors de l\'inscription:', error);
            res.status(500).send('Erreur interne du serveur.');
        }
    });


    // Route Logout
    router.post('/logout', (req: Request, res: Response) => {
        res.clearCookie('token', { httpOnly: true, secure: true });
        res.status(200).send('Déconnexion réussie!');
    });

    return router;
}

