import { Router, Request, Response } from 'express';
import { Db, ObjectId } from 'mongodb';
import { Note, validateNote } from '../models/note'; 

export default (db: Db) => {
    const router = Router();

    // Route POST pour ajouter une note
    router.post('/notes', async (req: Request, res: Response) => {
        const note: Note = req.body;
        note.createdAt = new Date(); 
        const validationError = validateNote(note);
        
        if (validationError) {
            res.status(400).send({ error: validationError });
            return;
        }
        
        // Insertion en BDD
        try {
            const result = await db.collection('notes').insertOne(note);
            res.status(201).send({ message: 'Note ajoutée avec succès!', noteId: result.insertedId });
        } catch (error) {
            console.error('Erreur lors de l\'insertion dans MongoDB:', error);
            res.status(500).send('Erreur interne du serveur.');
        }
    });

    // Route GET pour récupérer les notes   
    router.get('/notes', async (req: Request, res: Response) => {   
        try {
            const notes = await db.collection('notes').find().toArray();
            res.status(200).send(notes);
        } catch (error) {
            console.error('Erreur lors de la récupération des notes:', error);
            res.status(500).send('Erreur interne du serveur.');
        }
    });

    // Route GET pour récupérer une note par ID
    router.get('/notes/:id', async (req: Request, res: Response) => {
        try {
            const noteId = req.params.id;
            const note = await db.collection('notes').findOne({ _id: new ObjectId(noteId) });
            if (!note) {
                res.status(404).send('Note non trouvée.');
                return;
            }
            res.status(200).send(note);
        } catch (error) {
            console.error('Erreur lors de la récupération de la note:', error);
            res.status(500).send('Erreur interne du serveur.');
        }
    });

    // Route DELETE pour supprimer une note par ID
    router.delete('/notes/:id', async (req: Request, res: Response) => {
        try {
            const noteId = req.params.id;
            const result = await db.collection('notes').deleteOne({ _id: new ObjectId(noteId) });
            if (result.deletedCount === 0) {
                res.status(404).send('Note non trouvée.');
                return;
            }
            res.status(200).send({ message: 'Note supprimée avec succès!' });
        } catch (error) {
            console.error('Erreur lors de la suppression de la note:', error);
            res.status(500).send('Erreur interne du serveur.');
        }
    });


    // Route PUT pour mettre à jour une note par ID
    router.put('/notes/:id', async (req: Request, res: Response) => {
        const noteId = req.params.id;
        const updatedNote: Partial<Note> = req.body;
        updatedNote.updatedAt = new Date(); // Ajout de la date de mise à jour
    
        const validationError = validateNote(updatedNote);
    
        if (validationError) {
            res.status(400).send({ error: validationError });
            return;
        }
    
        try {
            const result = await db.collection('notes').updateOne(
                { _id: new ObjectId(noteId) }, // Filtre pour trouver la note par ID
                { $set: updatedNote } // Mise à jour des champs spécifiés
            );
    
            if (result.matchedCount === 0) {
                res.status(404).send('Note non trouvée.');
                return;
            }
    
            res.status(200).send({ message: 'Note mise à jour avec succès!' });
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la note:', error);
            res.status(500).send('Erreur interne du serveur.');
        }
    });


    return router;
}