'use strict';
require("dotenv").config();
import 'core-js/stable';
import GetLeagueData from '../requests/getLeagueData';
import ManagersDAO from '../dao/managersDAO';
import { MongoClient } from "mongodb";
import { colors } from '../utils/utils';
import { handleError } from '../utils/common';

const dbs = {
    'test': process.env.BWNGR_DB_TEST,
    'liga': process.env.BWNGR_DB,
    'pl': process.env.BWNGR_DB_PL
};
let client;

export default async function initManagers(league = 'liga') {
    try {
        const handleLeage = new GetLeagueData(league);
        const promiseGetManagers = handleLeage.getManagers();
        if (!client) {
            client = await MongoClient.connect(process.env.BWNGR_DB_URI, { useNewUrlParser: true });
        }
        const db = client.db(dbs[league]);
        await ManagersDAO.injectDB(db);
        const   { data: { data: { standings } } } = await promiseGetManagers;
        const result = await ManagersDAO.insertManagersBulk(standings.map(elem => ({ name: elem.name, id_bwngr: elem.id, balance: 40000000 })));
        console.log(result);
        client.close();
    } catch (e) {
        console.log(`${colors.red}Error ocurred while inserting managers.-- ${String(e)}`);
        if (client) client.close();
        handleError(e,'Unable to init managers');
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
        handleError(e,'Unable to set manager balance');
    }
}