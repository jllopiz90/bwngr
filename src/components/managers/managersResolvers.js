'use strict';
import 'core-js/stable';
import ManagersDAO from './managersDAO';
import PlayersDAO from '../players/playersDAO';
import TeamsDAO from '../teams/teamsDAO';
import { handleError } from '../../utils/common';
import { getDataSorted } from '../../utils/utils';

const getGroupValue = team => team.reduce(teamValue,0);
const teamValue = (acumulator, currentRow) => acumulator + currentRow['price'];
const playersPositionCount = (team, position) => team.filter(player => player.position === position).length;
const maxBid = (balance, teamValue) => balance + teamValue / 4;
const isValidTeam = (team, incomingPlayerPosition) => {
    const gksCount = playersPositionCount(team,'gk') + (incomingPlayerPosition === 'gk' ? 1 : 0);
    const dfsCount = playersPositionCount(team,'df') + (incomingPlayerPosition === 'df' ? 1 : 0);
    const mfsCount = playersPositionCount(team,'mf') + (incomingPlayerPosition === 'mf' ? 1 : 0);
    const stsCount = playersPositionCount(team,'st') + (incomingPlayerPosition === 'st' ? 1 : 0);
    return gksCount === 1 && dfsCount > 2 && dfsCount < 6 && mfsCount > 2 && mfsCount < 6 && stsCount > 0 && stsCount < 4 && (gksCount + dfsCount + mfsCount + stsCount === 11);
}

// get balance, all players group by position value for each, total value and player amount for position, total total value and players amount, max bid
export async function getManagersState(manager = '') {
    const filter =  manager === '' ? {} : { id_bwngr: parseInt(manager)};
    const teamsFromLeaguePromise = TeamsDAO.getTeam({}, {projection: {_id:0, name: 1, id_bwngr: 1}});
    const managers = await ManagersDAO.getManager(filter, { projection: { _id: 0 } });
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
    return managersWithTeamValue.length > 1 ? getDataSorted(managersWithTeamValue,'max_bid') : managersWithTeamValue[0];
}

export async function getManagerCombinations(id_bwngr, balance_to_reach, incomingPlayerPosition) {
    try {
        const teamsFromLeaguePromise = TeamsDAO.getTeam({}, {projection: {_id:0, name: 1, id_bwngr: 1}});
        const managerPromise = ManagersDAO.getManager({id_bwngr}, { projection: { _id: 0 } });
        const team = await PlayersDAO.getPlayer({ owner: id_bwngr }, { projection: { _id: 0, name: 1, position: 1, price: 1, team_id: 1} })
        const [manager] = await  managerPromise;
        const balance = manager.balance;
        const teamsFromLeague = await teamsFromLeaguePromise;
        const managerTeam = team.map( player => {
            const team_name = player.team_id 
                            ? teamsFromLeague.filter( elem => elem.id_bwngr === player.team_id )[0]['name']
                            : 'abandon the league';
            return {...player, team_name}
        })
        const variations = getCombinations10Players(managerTeam, incomingPlayerPosition);
        return variations
                .filter( ({discards}) => getGroupValue(discards) + balance >= balance_to_reach)
                .map( variation => ({...variation, availableSpend: getGroupValue(variation.discards) + balance}));
    } catch (e) {
        handleError(e,'Unable to get manager team combinations');
        return false;
    }
}

function getCombinations10Players(team,incomingPlayerPosition) {
    const store = [];
    combinationsNoRepeated([...team], [], 10, store, team);
    return store.filter( ({teamVariation}) => isValidTeam(teamVariation,incomingPlayerPosition));
}

function combinationsNoRepeated(population, tempStore, sample_size, store, global_population) {
    if(tempStore.length === sample_size) {
        store.push({teamVariation: [...tempStore], discards: global_population.filter( elem => !tempStore.some( elem1 => elem['name'] === elem1['name']))})
    } else {
        const newPopulation = [...population];
        for (let i = 0; i < population.length; i++) {
            tempStore.push(population[i]);
            newPopulation.splice(0,1);
            combinationsNoRepeated(newPopulation,tempStore, sample_size, store, global_population);
            tempStore.pop();
        }
    }
}