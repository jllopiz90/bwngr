'use strict';
require("dotenv").config();
import 'core-js/stable';
import GetLeagueData from '../requests/getLeagueData';
import ManagersDAO from '../dao/managersDAO';
import { MongoClient } from "mongodb";

const dbs = {
    'test': process.env.BWNGR_DB_TEST,
    'liga': process.env.BWNGR_DB,
    'pl': process.env.BWNGR_DB_PL
};
let client;

export default async function getManagers(league = 'liga') {
    try {
        const handleLeage = new GetLeagueData(league);
        const { message: data } = await handleLeage.getManagers();
        if (!client) {
            client = await MongoClient.connect(process.env.BWNGR_DB_URI, { useNewUrlParser: true });
        }
        const db = client.db(dbs[league]);
        await ManagersDAO.injectDB(db);
        const result = await ManagersDAO.insertManagersBulk(data.map(elem => ({ name: elem.name, id_bwngr: elem.id })));
        console.log(result);
        client.close();
    } catch (e) {
        console.log(`An error has happened ${String(e)}`);
        console.error('\x1b[31m =====Error:', err.toString());
        console.error('\x1b[31m =====Error stack:', err.stack);
        if (client) client.close();
        process.exit(1);
    }
}

export async function setBalance({ amount = '', id_bwngr = '', league = 'liga' }) {
    try {
        if (!client) {
            client = await MongoClient.connect(process.env.BWNGR_DB_URI, { useNewUrlParser: true });
        }
        let result;
        const db = client.db(dbs[league]);
        await ManagersDAO.injectDB(db);
        console.log('amount:', amount);
        console.log('id:', id_bwngr);
        if (id_bwngr === '') {
            console.log('setting all managers')
            result = await ManagersDAO.setBalanceAllPlayers(amount);
        } else {
            console.log('setting 1 managers')
            result = await ManagersDAO.setBalancePlayer({ amount: amount, id_bwngr: id_bwngr })
        }
        console.log(result);
        client.close()
    } catch (e) {
        console.error('\x1b[31m =====Error:', e.toString());
        console.error('\x1b[31m =====Error stack:', e.stack);
        if (client) {
            client.close();
        }
        process.exit(1)
    }
}