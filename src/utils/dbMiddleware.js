import { MongoClient } from "mongodb";
import { dbs }  from './common';
import UsersDAO from "../components/users/usersDAO";
import ManagersDAO from "../components/managers/managersDAO";
import PlayersDAO from "../components/players/playersDAO";
import TransfersDAO from "../components/market/transfersDAO";
import TeamsDAO from "../components/teams/teamsDAO";
require("dotenv").config();

export default async function chooseAndInjectDB(req, res, next) {
    try {
        const league = req.body.league;
        console.log(`using db for league ${league}`);
        const client = await MongoClient.connect(process.env.BWNGR_DB_URI,{ poolSize: 50, wtimeout: 2500, useNewUrlParser: true });    
        const db_name = dbs[league];
        const db = client.db(db_name);
        await ManagersDAO.injectDB(db); 
        await PlayersDAO.injectDB(db);
        await TransfersDAO.injectDB(db);
        await TeamsDAO.injectDB(db);
        console.log('dbs initialized');
        next();
    } catch (e) {
        console.error(err.stack)
    }
}