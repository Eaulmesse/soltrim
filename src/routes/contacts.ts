import { Router, Request, Response } from 'express';
import { Db } from 'mongodb';

export default  (db: Db) => {
    const router = Router();

    // Route POST pour ajouter un contact
    router.post('/contacts', async (req: Request, res: Response) => {
        const contact = req.body;
        if (!contact || !contact.name || !contact.email) {
            res.status(400).send('Les champs "name" et "email" sont requis.');
            return;
        }

        try {
            const result = await db.collection('contacts').insertOne(contact);
            res.status(201).send({ message: 'Contact ajouté avec succès!', contactId: result.insertedId });
        } catch (error) {
            console.error('Erreur lors de l\'insertion dans MongoDB:', error);
            res.status(500).send('Erreur interne du serveur.');
        }
    });

    // Route GET pour récupérer les contacts
    router.get('/contacts', async (req: Request, res: Response) => {
        try {
            const contacts = await db.collection('contacts').find().toArray();
            res.status(200).send(contacts);
        } catch (error) {
            console.error('Erreur lors de la récupération des contacts:', error);
            res.status(500).send('Erreur interne du serveur.');
        }
    });

    return router;
};