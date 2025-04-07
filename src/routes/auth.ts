import { Router, Request, Response } from 'express';
import { Db, ObjectId } from 'mongodb';

export default (db: Db) => {
    const router = Router();

    // route LOGIN
    router.post('/login', async (req: Request, res: Response) => {
        const { email, password } = req.body;
        // Validation des données
        if (!email || !password) {
            res.status(400).send('Nom d\'utilisateur et mot de passe requis.');
            return ;
        }

        // Vérification des informations d'identification
        try {
            const user = await db.collection('users').findOne({ email, password });
            if (!user) {
                res.status(401).send('Nom d\'utilisateur ou mot de passe incorrect.');
                return ;
            }
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
        if (!email || !password) {
            res.status(400).send('Nom d\'utilisateur et mot de passe requis.');
            return ;
        }

        // Vérification si l'utilisateur existe déjà
        try {
            const existingUser = await db.collection('users').findOne({ email });
            if (existingUser) {
                res.status(409).send('Nom d\'utilisateur déjà pris.');
                return ;
            }

            // Insertion de l'utilisateur dans la base de données
            await db.collection('users').insertOne({ email, password });
            res.status(201).send({ message: 'Inscription réussie!' });
        } catch (error) {
            console.error('Erreur lors de l\'inscription:', error);
            res.status(500).send('Erreur interne du serveur.');
        }
    });

    return router;
}

