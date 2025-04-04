import { Router, Request, Response } from 'express';
import { Db, ObjectId } from 'mongodb';
import { Contact, validateContact } from '../models/contact'; 

export default  (db: Db) => {
    const router = Router();

    // Route POST pour ajouter un contact
    router.post('/contacts', async (req: Request, res: Response) => {

        // Récupération et validation des données 
        const contact: Contact = req.body;
        contact.createdAt = new Date(); // Ajout de la date de création
        const validationError = validateContact(contact);
        
        if (validationError) {
            res.status(400).send({ error: validationError });
            return;
        }
        
        // Insertion en BDD
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

    // Route GET pour récupérer un contact par ID
    router.get('/contacts/:id', async (req: Request, res: Response) => {
        try {
            const contactId = req.params.id;
            const contact = await db.collection('contacts').findOne({ _id: new ObjectId(contactId) });
            if (!contact) {
                res.status(404).send('Contact non trouvé.');
                return;
            }
            res.status(200).send(contact);
        }
        catch (error) { 
            console.error('Erreur lors de la récupération du contact:', error);
            res.status(500).send('Erreur interne du serveur.');
        }
    });
    

    // Route DELETE pour supprimer un contact par ID
    router.delete('/contacts/:id', async (req: Request, res: Response) => {
        try {
            const contactId = req.params.id;
            const result = await db.collection('contacts').deleteOne({ _id: new ObjectId(contactId) });
            if (result.deletedCount === 0) {
                res.status(404).send('Contact non trouvé.');
                return;
            }
            res.status(200).send('Contact supprimé avec succès!');
        } catch (error) {
            console.error('Erreur lors de la suppression du contact:', error);
            res.status(500).send('Erreur interne du serveur.');
        }
    });

    //  Route UPDATE pour mettre à jour un contact par ID
    router.put('/contacts/:id', async (req: Request, res: Response) => {
        const contactId = req.params.id;
        const updatedContact: Partial<Contact> = req.body; 
        const validationError = validateContact(updatedContact);
        
        if (validationError) {
            res.status(400).send({ error: validationError });
            return;
        }
        
        // Insertion en BDD
        try {
            const result = await db.collection('contacts').updateOne({ _id: new ObjectId(contactId)}, {$set: updatedContact});
            if (result.matchedCount === 0) {
                res.status(404).send('Contact non trouvé.');
                return;
            }
            res.status(200).send({ message: 'Contact mis à jour avec succès!' });
        }
        catch (error) {
            console.error('Erreur lors de l\'insertion dans MongoDB:', error);
            res.status(500).send('Erreur interne du serveur lors de l update.');
        }
    });    

    return router;
};