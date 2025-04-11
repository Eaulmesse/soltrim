import { NextFunction, Request, Response } from "express";
import { Db, ObjectId } from "mongodb";
import { User } from "../models/user"; // Assurez-vous que le chemin est correct
import { log } from "node:console";
const jwt = require("jsonwebtoken"); // Utilisez l'import ES6 si possible

export default function authMiddleware(db: Db) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {

            if (checkReqUser(req)) {
                return next();
            }

            if (isPublicRoute(req.originalUrl)) {
                return next();
            }

            const token = extractToken(req);
            if (!token) {
                res.status(401).send({ error: "Token manquant." });
                return ;
            }

            const decodedToken = verifyToken(token);
            if (!decodedToken?.userId) {
                res.status(403).send({ error: "Token invalide : userId manquant." });
                return;
            }

            const user = await findUserById(db, decodedToken.userId);
            if (!user) {
                res.status(401).send({ error: "Utilisateur non trouvé." });
                return;
            }
            const { password, ...userWithoutPassword } = user;
            
            req.user = userWithoutPassword as User;
            console.log("Utilisateur ajouté à la requête:", req.user);
            
            next();
        } catch (error) {
            console.error("Erreur dans authMiddleware:", error);
            res.status(403).send({ error: "Token invalide ou expiré." });
        }
    };

}

function checkReqUser(req: Request): boolean {
    return !!req.user;
}

// Fonction pour vérifier si une route est publique
function isPublicRoute(url: string): boolean {
    return /\/api\/(login|register)/.test(url);
}

// Fonction pour extraire le token depuis l'en-tête Authorization
function extractToken(req: Request): string | null {
    const authHeader = req.header("authorization");
    return authHeader?.replace("Bearer ", "") || null;
}

// Fonction pour vérifier et décoder le token JWT
function verifyToken(token: string): { userId?: string } | null {
    try {
        const secret = process.env.JWT_SECRET as string;
        return jwt.verify(token, secret) as { userId?: string };
    } catch (error) {
        console.error("Erreur lors de la vérification du token:", error);
        return null;
    }
}

// Fonction pour rechercher un utilisateur dans la base de données
async function findUserById(db: Db, userId: string): Promise<User | null> {
    try {
        return await db.collection("users").findOne({ _id: new ObjectId(userId) }) as User | null;
    } catch (error) {
        console.error("Erreur lors de la recherche de l'utilisateur:", error);
        return null;
    }
}