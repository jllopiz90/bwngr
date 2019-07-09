'use strict';
require("dotenv").config();
import 'core-js/stable';
import GetLeagueData from '../requests/getLeagueData';
import ManagersDAO from '../dao/managersDAO';
import { MongoClient } from "mongodb";

const getManagers = async () => {
    try{
        const handleLeage = new GetLeagueData();
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
                await ManagersDAO.injectDB(client);
                const result = await ManagersDAO.insertManagersBulk(data.map( elem => ({ name:elem.name, id_bwngr: elem.id})));
                console.log(result);
            });
        
    }catch(e) {
        console.log(`An error has happened ${String(e)}`);
    }
}

getManagers();
