require("dotenv").config();
import 'core-js/stable';
import { MongoClient } from "mongodb";
import TeamsDAO from './teamsDAO';
import GetLeagueData from '../../requests/getLeagueData';
import { dbs, handleError } from '../../utils/common';

export async function insertTeams(league = 'pl') {
    let promiseClient;
    try {
        promiseClient = MongoClient.connect( process.env.BWNGR_DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        const handleLeage = new GetLeagueData(league);
        const { data: {data: {teams}} } = await handleLeage.getTeams();
        const dataArray = Object.values(teams).map( team => ({
                id_bwngr:  team.id,
                name: team.name,
        }));
        const client = await promiseClient;
        const db = client.db(dbs[league]);
        await TeamsDAO.injectDB(db);
        const result = await TeamsDAO.insertTeamsBulk(dataArray);
        console.log(result);
        client.close();
    } catch (err) {
        handleError(err);
        const client = promiseClient && await promiseClient;
        client && client.close;
    }
}