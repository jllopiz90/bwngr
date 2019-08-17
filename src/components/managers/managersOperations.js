'use strict';
require("dotenv").config();
import 'core-js/stable';
import { MongoClient } from "mongodb";
import GetLeagueData from '../../requests/getLeagueData';
import ManagersDAO from './managersDAO';
import { handleError } from '../../utils/common';
import { dbs } from '../../utils/common';

let client;

export default async function initManagers(league = 'pl') {
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
        client.close();
        return result;
    } catch (e) {
        if (client) client.close();
        handleError(e,'Unable to init managers');
        return false;
    }
}

export async function setBalance({ amount = '', id_bwngr = '', league = 'pl' }) {
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
        client.close()
        return result;
    } catch (e) {
        if (client) {
            client.close();
        }
        handleError(e,'Unable to set manager balance');
        return false;
    }
}

export async function adjustByBonus(league = 'pl') {
    try {
        const handleLeage = new GetLeagueData(league);
        const promiseGetBonus = handleLeage.getBonus();
        const promiseRound = handleLeage.getRecentRounds();
        if (!client) {
            client = await MongoClient.connect(process.env.BWNGR_DB_URI, { useNewUrlParser: true });
        }
        const db = client.db(dbs[league]);
        await ManagersDAO.injectDB(db);
        const { data: { data: dataFromBonus } } = await promiseGetBonus;
        const [{content}] = dataFromBonus;
        content.forEach( ({user: {id}, amount}) => {
            ManagersDAO.modifyBalance(amount, id);
         })
        const {data: {data: dataFromRound}} = await promiseRound;
        const [{content: {results}}] = dataFromRound;
        results.forEach( ({user: {id}, bonus}) => {
            ManagersDAO.modifyBalance(bonus, id);
        });
        client.close()
        return true;
    } catch (e) {
        if (client) {
            client.close();
        }
        handleError(e,'Unable to modify managers balance');
        return false;
    }
}