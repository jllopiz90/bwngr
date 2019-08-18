'use strict';
require("dotenv").config();
import 'core-js/stable';
import { MongoClient } from "mongodb";
import GetLeagueData from '../../requests/getLeagueData';
import ManagersDAO from './managersDAO';
import PlayersDAO from '../players/playersDAO';
import { handleError } from '../../utils/common';
import { dbs } from '../../utils/common';

let client;
const getGroupValue = (team) => {
    const team_value = team.reduce(teamValue,0);
    return team_value;
}
const teamValue = (acumulator, currentRow) => acumulator + currentRow['price'];
const playersPositionCount = (team, position) => {
    return team.filter(player => player.position === position).length;
}

const isValidTeam = (team) => {
    const gksCount = playersPositionCount(team,'gk');
    const dfsCount = playersPositionCount(team,'df');
    const mfsCount = playersPositionCount(team,'mf');
    const stsCount = playersPositionCount(team,'st');
    return gksCount === 1 && dfsCount > 2 && dfsCount < 6 && mfsCount > 2 && mfsCount < 6 && stsCount > 0 && stsCount < 4 && (gksCount + dfsCount + mfsCount + stsCount === 11);
}

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

export async function getManagerTeam( id_bwngr, league = 'pl') {
    try {
        if (!client) {
            client = await MongoClient.connect(process.env.BWNGR_DB_URI, { useNewUrlParser: true });
        }
        const db = client.db(dbs[league]);
        await PlayersDAO.injectDB(db);
        console.log('getting players from :',id_bwngr)
        const result = await PlayersDAO.getPlayer({ owner: id_bwngr }, { projection: { _id: 0, name: 1, position: 1, price: 1, team_id: 1} })
        client.close();
        return result;
    } catch (e) {
        if (client) {
            client.close();
        }
        handleError(e,'Unable to get manager team');
        return false;
    }
}

export async function getManagerCombinations(id_bwngr, balance_to_reach, league = 'pl') {
    try {
        if (!client) {
            client = await MongoClient.connect(process.env.BWNGR_DB_URI, { useNewUrlParser: true });
        }
        const db = client.db(dbs[league]);
        await ManagersDAO.injectDB(db);
        await PlayersDAO.injectDB(db);
        const [manager] = await ManagersDAO.getManager({id_bwngr}, { projection: { _id: 0 } });
        const team = await PlayersDAO.getPlayer({ owner: id_bwngr }, { projection: { _id: 0, name: 1, position: 1, price: 1, team_id: 1} })
        const balance = manager.balance;
        const variations = getCombinations11Players(team);
        client.close()
        return variations
                .filter( ({discards}) => getGroupValue(discards) + balance >= balance_to_reach)
                .map( variation => ({...variation, availableSpend: getGroupValue(variation.discards) + balance}));
    } catch (e) {
        if (client) {
            client.close();
        }
        handleError(e,'Unable to get manager team combinations');
        return false;
    }
}

function getCombinations11Players(team) {
    const store = [];
    variationsNoRepeated([...team], [], 11, store, team);
    return store.filter( ({teamVariation}) => isValidTeam(teamVariation));
}

function variationsNoRepeated(population, tempStore, sample_size, store, global_population) {
    if(tempStore.length === sample_size) {
        store.push({teamVariation: [...tempStore], discards: global_population.filter( elem => !tempStore.some( elem1 => elem['name'] === elem1['name']))})
    } else {
        const newPopulation = [...population];
        for (let i = 0; i < population.length; i++) {
            tempStore.push(population[i]);
            newPopulation.splice(0,1);
            variationsNoRepeated(newPopulation,tempStore, sample_size, store, global_population);
            tempStore.pop();
        }
    }
}