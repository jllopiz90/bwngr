'use strict';
import 'core-js/stable';
import GetLeagueData from '../../requests/getLeagueData';
import TransfersDAO from './transfersDAO';
import PlayersDAO from '../players/playersDAO';
import ManagersDAO from '../managers/managersDAO';
import TeamsDAO from '../teams/teamsDAO';
import { handleError } from '../../utils/common';
import { groupingByWithCount } from '../../utils/utils';
require("dotenv").config();

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