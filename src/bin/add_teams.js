'use strict'
require("dotenv").config();
import 'core-js/stable';
import GetLeagueData from '../requests/getLeagueData';
import TeamsDAO from '../dao/teamsDAO';
import { MongoClient } from "mongodb";

const [league] = process.argv.slice(2);

const getTeams = async (league = 'liga')=> {
    const handleLeage = new GetLeagueData(league);
    const { message: data} = await handleLeage.getTeams();
    const dataArray = Object.values(data).map( team => ({
            id_bwngr:  team.id,
            name: team.name,
    }));
    MongoClient.connect(
        process.env.BWNGR_DB_URI,
        { useNewUrlParser: true })
        .catch(err => {
            console.error('=====Error:', String(err));
            console.error('=====Error stack:', err.stack);
            client.close();
            process.exit(1)
        })
        .then(async client => {
            const db = league === 'pl' ? client.db(process.env.BWNGR_DB_PL) : client.db(process.env.BWNGR_DB);
            await TeamsDAO.injectDB(db);
            const result = await TeamsDAO.insertTeamsBulk(dataArray)
            console.log(result);
            client.close()
        });
}

if(league){
    getTeams(league);
}else{
    console.log('missing params using la liga by default');
    getTeams();
}
