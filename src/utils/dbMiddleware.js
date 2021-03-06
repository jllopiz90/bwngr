import { MongoClient } from "mongodb";
import { dbs }  from './common';
import UsersDAO from "../components/users/usersDAO";
import ManagersDAO from "../components/managers/managersDAO";
import PlayersDAO from "../components/players/playersDAO";
import TransfersDAO from "../components/market/transfersDAO";
import TeamsDAO from "../components/teams/teamsDAO";
require("dotenv").config();

export async function chooseAndInjectDB(req, res, next) {
    try {
        const league = req.params.league;
        console.log(`using db for league ${league}`);
        console.log('process.env.BWNGR_DB_URI', process.env.BWNGR_DB_URI);
        const client = await MongoClient.connect(process.env.BWNGR_DB_URI,{ poolSize: 50, wtimeout: 2500, useNewUrlParser: true, useUnifiedTopology: true });    
        const db_name = dbs[league];
        const db = client.db(db_name);
        await ManagersDAO.injectDB(db); 
        await PlayersDAO.injectDB(db);
        await TransfersDAO.injectDB(db);
        await TeamsDAO.injectDB(db);
        console.log('dbs initialized');
        req.client = client;
        next();
    } catch (e) {
        console.log(e.stack)
        console.error(e.stack)
    }
}

export async function closeDB(req, res, next) {
    try {
        const client = req.client;
        client.close();
        ManagersDAO.destroyCollection(); 
        PlayersDAO.destroyCollection();
        TransfersDAO.destroyCollection();
        TeamsDAO.destroyCollection();
        console.log('dbs closed');
    } catch (e) {
        console.error(e.stack)
    }
}