'use strict';
require("dotenv").config();
import 'core-js/stable';
import GetLeagueData from '../requests/getLeagueData';
import ManagersDAO from '../dao/managersDAO';
import { MongoClient } from "mongodb";
import { colors } from '../utils/utils';

const dbs = {
    'test': process.env.BWNGR_DB_TEST,
    'liga': process.env.BWNGR_DB,
    'pl': process.env.BWNGR_DB_PL
};
let client;

export default async function getManagers(league = 'liga') {
    try {
        const handleLeage = new GetLeagueData(league);
        const promiseGetManagers = handleLeage.getManagers();
        if (!client) {
            client = await MongoClient.connect(process.env.BWNGR_DB_URI, { useNewUrlParser: true });
        }
        const db = client.db(dbs[league]);
        await ManagersDAO.injectDB(db);
        const   { data: { data: { standings } } } = await promiseGetManagers;
        const result = await ManagersDAO.insertManagersBulk(standings.map(elem => ({ name: elem.name, id_bwngr: elem.id })));
        console.log(result);
        client.close();
    } catch (e) {
        if (client) client.close();
        handleError(e);
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
        if (id_bwngr === '') {
            result = await ManagersDAO.setBalanceAllPlayers(amount);
        } else {
            result = await ManagersDAO.setBalancePlayer({ amount: amount, id_bwngr: id_bwngr })
        }
        console.log(result);
        client.close()
    } catch (e) {
        if (client) {
            client.close();
        }
        handleError(e);
    }
}

function handleError(e) {
    console.error(`${colors.reset} ${colors.red} =====Error:`, e.toString());
    console.error(`=====Error stack: `, e.stack , colors.reset);
    process.exit(1)
}