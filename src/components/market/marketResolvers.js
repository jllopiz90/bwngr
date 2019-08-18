'use strict';
import 'core-js/stable';
import { MongoClient } from 'mongodb';
import GetLeagueData from '../../requests/getLeagueData';
import TransfersDAO from './transfersDAO';
import PlayersDAO from '../players/playersDAO';
import ManagersDAO from '../managers/managersDAO';
import TeamsDAO from '../teams/teamsDAO';
import { handleError } from '../../utils/common';
import { groupingByWithCount, getDataSorted } from '../../utils/utils';
require("dotenv").config();

const maxBid = (balance, teamValue) => balance + teamValue / 4;
const teamValue = (acumulator, currentRow) => acumulator + currentRow['price'];
const groupByManager = (groupKeys, currentRow) => groupingByWithCount('manager', 'overprice', groupKeys, currentRow);

export async function getMarket(league = 'pl') {
    console.log(`resolving market for league ${league} ...`)
    try {
        const leagueHandler = new GetLeagueData(league);
        const { data: { data: { sales } } } = await leagueHandler.getCurrentMarket();
        if(!sales.length){
            console.log('problem getting market from bwngr');
        } else {
            const salesFormatted = sales.map(sale => ({
                player: sale.player.id,
                price: sale.price
            }));
            const teams = await TeamsDAO.getTeam({}, {projection: {_id:0, name: 1, id_bwngr: 1}});
            const playersInMarket = [];
            for (let i = 0; i < salesFormatted.length; i++) {
                const sale = salesFormatted[i];
                const result = await PlayersDAO.getPlayer({id_bwngr: sale.player}, {projection: {_id: 0}});
                if(result.length) {
                    const [{name, team_id, position, price_increment, price}] = result;
                    const team_name = team_id 
                            ? teams.filter( team => team.id_bwngr === team_id)[0]['name']
                            : 'abandon the league';
                    const bids = await getPlayerPrevBids(sale.player);
                    playersInMarket.push({name, price, price_increment, position, bids, team_name, team_id});
                }
            }
            return playersInMarket;
        }
    } catch (e) {
        handleError(e);
    }
}


// get balance, all players group by position value for each, total value and player amount for position, total total value and players amount, max bid
export async function getManagersState() {
    const teamsFromLeaguePromise = TeamsDAO.getTeam({}, {projection: {_id:0, name: 1, id_bwngr: 1}});
    const managers = await ManagersDAO.getManager({}, { projection: { _id: 0 } });
    const teamPromises = managers.map( async manager => ({raw_team: await PlayersDAO.getPlayer({ owner: manager.id_bwngr }, { projection: { _id: 0, name: 1, position: 1, price: 1, team_id: 1} }), id_bwngr: manager.id_bwngr}));
    const teams = await Promise.all(teamPromises);
    const teamsFromLeague = await teamsFromLeaguePromise;
    const managersWithTeamValue = managers.map( manager => {
        const { id_bwngr, balance } = manager;
        const { raw_team } = teams.find( manager => manager.id_bwngr === id_bwngr);
        const team = raw_team.map( player => {
            const team_name = player.team_id 
                            ? teamsFromLeague.filter( elem => elem.id_bwngr === player.team_id )[0]['name']
                            : 'abandon the league';
            return {...player, team_name}
        })
        const team_value = team.reduce(teamValue,0);
        const max_bid = maxBid(balance, team_value);
        return {...manager, max_bid, team_value, team};
    });
    return getDataSorted(managersWithTeamValue,'max_bid');
}

async function getPlayerPrevBids(id_bwngr) {
    const managers = await ManagersDAO.getManager({}, { projection: { _id: 0 } });
    const bids = await TransfersDAO.getBid({player: id_bwngr}, {projection: {_id:0, manager:1 , overprice: 1}});
    const groupedByManager = bids.reduce(groupByManager,{});
    const keysArray = Object.keys(groupedByManager);
    const bidsToReturn = [];
    keysArray.forEach(key => {
        const managerProjection = groupedByManager[key];
        const manager = managers.filter(man => man.id_bwngr === parseInt(key));
        const managerName = manager.length ? manager[0]['name'] : 'Manager no longer in competition.';
        bidsToReturn.push({manager: managerName, avg_bid_overprice: managerProjection.totalCash/managerProjection.bidsAmount, total_bids: managerProjection.bidsAmount});
    })
    return bidsToReturn;
}