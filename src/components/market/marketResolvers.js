'use strict';
import 'core-js/stable';
import { MongoClient } from 'mongodb';
import GetLeagueData from '../../requests/getLeagueData';
import TransfersDAO from './transfersDAO';
import PlayersDAO from '../players/playersDAO';
import ManagersDAO from '../managers/managersDAO';
import TeamsDAO from '../teams/teamsDAO';
import { dbs, handleError } from '../../utils/common';
import { groupingByWithCount, getDataSorted } from '../../utils/utils';
require("dotenv").config();

const maxBid = (balance, teamValue) => balance + teamValue / 4;
const teamValue = (acumulator, currentRow) => acumulator + currentRow['price'];
const groupByManager = (groupKeys, currentRow) => groupingByWithCount('manager', 'overprice', groupKeys, currentRow);

export async function getMarket(league = 'liga') {
    console.log(`resolving market for league ${league} ...`)
    let client;
    try {
        const leagueHandler = new GetLeagueData(league);
        const promiseMarket = leagueHandler.getCurrentMarket();
        const promiseClient =  MongoClient.connect(process.env.BWNGR_DB_URI, { useNewUrlParser: true });
        const { data: { data: { sales } } } = promiseMarket ? await promiseMarket : {data:{data:{sales:[]}}};
        if(!sales.length){
            console.log('problem getting market from bwngr');
            client = await promiseClient;
            client.close();
        } else {
            const salesFormatted = sales.map(sale => ({
                player: sale.player.id,
                price: sale.price
            }));
            client = await promiseClient;
            const db =  client.db(dbs[league]);
            await PlayersDAO.injectDB(db);
            await TeamsDAO.injectDB(db);
            const teams = await TeamsDAO.getTeam({}, {projection: {_id:0, name: 1, id_bwngr: 1}});
            const playersInMarket = [];
            for (let i = 0; i < salesFormatted.length; i++) {
                const sale = salesFormatted[i];
                const result = await PlayersDAO.getPlayer({id_bwngr: sale.player}, {projection: {_id: 0}});
                if(result.length) {
                    const [{name, team_id, position, price_increment, price}] = result;
                    const teamName = team_id 
                            ? teams.filter( team => team.id_bwngr === team_id)[0]['name']
                            : 'abandon the league';
                    const bids = await getPlayerPrevBids(sale.player,db);
                    playersInMarket.push({team:teamName, name, price, price_increment, position, bids});
                }
            }
            await client.close();
            return playersInMarket;
        }
    } catch (e) {
        handleError(e);
        client && client.close();
    }
}


// get balance, all players group by position value for each, total value and player amount for position, total total value and players amount, max bid
export async function getManagersState(db) {
    await ManagersDAO.injectDB(db);
    const managers = await ManagersDAO.getManager({}, { projection: { _id: 0 } });
    const teamPromises = managers.map( async manager => ({team: await PlayersDAO.getPlayer({ owner: manager.id_bwngr }, { projection: { _id: 0, name: 1, position: 1, price: 1 } }), id_bwngr: manager.id_bwngr}));
    const teams = await Promise.all(teamPromises);
    const managersWithTeamValue = managers.map( manager => {
        const { id_bwngr, balance } = manager;
        const { team } = teams.find( manager => manager.id_bwngr === id_bwngr);
        const team_value = team.reduce(teamValue,0);
        const max_bid = maxBid(balance, team_value);
        return {...manager, max_bid, team_value, team};
    });
    return getDataSorted(managersWithTeamValue,'max_bid');
}

async function getPlayerPrevBids(id_bwngr, db) {
    await TransfersDAO.injectDB(db);
    await ManagersDAO.injectDB(db);
    const managers = await ManagersDAO.getManager({}, { projection: { _id: 0 } });
    const bids = await TransfersDAO.getBid({player: id_bwngr}, {projection: {_id:0, manager:1 , overprice: 1}});
    const groupedByManager = bids.reduce(groupByManager,{});
    const keysArray = Object.keys(groupedByManager);
    const bidsToReturn = [];
    keysArray.forEach(key => {
        const managerProjection = groupedByManager[key];
        const managerName = managers.filter(man => man.id_bwngr === parseInt(key))[0]['name'];
        bidsToReturn.push({manager: managerName, avg_bid_overprice: managerProjection.totalCash/managerProjection.bidsAmount, total_bids: managerProjection.bidsAmount});
    })
    return bidsToReturn;
}