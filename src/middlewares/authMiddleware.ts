import { NextFunction } from "express";
import { Request, Response } from "express";
import cookieParser from 'cookie-parser';
import { log } from "node:console";

export default function authMiddleware(req: Request, res: Response, next: NextFunction) {
    if (req.path === '/login' || req.path === '/register') {
        return next(); 
    }

    const token = req.cookies.token;
    if (!token) {
        res.status(401).send('Token manquant.');
        return;
    }
    


    return;
}