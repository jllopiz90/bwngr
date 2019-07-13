'use strict';
require("dotenv").config();
import 'core-js/stable';
import GetLeagueData from '../requests/getLeagueData';
import ManagersDAO from '../dao/managersDAO';
import { MongoClient } from "mongodb";

const [league] = process.argv.slice(2);

const getManagers = async (league = 'liga') => {
    try{
        const handleLeage = new GetLeagueData(league);
        const { message: data} = await handleLeage.getManagers();
        MongoClient.connect(
            process.env.BWNGR_DB_URI,
            { useNewUrlParser: true })
            .catch(err => {
                console.error('=====Error:', err.toString());
                console.error('=====Error stack:', err.stack);
                process.exit(1)
            })
            .then(async client => {
                const db =  league === 'pl' ? client.db(process.env.BWNGR_DB_PL) : client.db(process.env.BWNGR_DB);
                await ManagersDAO.injectDB(db);
                const result = await ManagersDAO.insertManagersBulk(data.map( elem => ({ name:elem.name, id_bwngr: elem.id})));
                console.log(result);
                client.close()
            });
        
    }catch(e) {
        console.log(`An error has happened ${String(e)}`);
    }
}

if(league){
    console.log('league:',league)
    getManagers(league);
}else{
    console.log('missing params, using la liga by default');
    getManagers()
}

