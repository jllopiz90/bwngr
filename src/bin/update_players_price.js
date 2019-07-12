'use strict';
require("dotenv").config();
import 'core-js/stable';
import PlayersDAO from '../dao/playersDAO';
import { MongoClient } from "mongodb";

//run this script like this : npm run set_balance -- 25000000 1802949     (after -- the parameters)

let args = process.argv.slice(2);

const adjustPrice = async ({increment = '', id_bwngr = ''}) => {
    try{
        MongoClient.connect(
            process.env.BWNGR_DB_URI,
            { useNewUrlParser: true })
            .catch(err => {
                console.error('=====Error:', err.toString());
                console.error('=====Error stack:', err.stack);
                process.exit(1)
            })
            .then(async client => {
                let result;
                await PlayersDAO.injectDB(client);
                console.log('increment:',increment)
                console.log('id:',id_bwngr)
                result = await PlayersDAO.updatePrice({id_bwngr: parseInt(id_bwngr), increment: parseInt(increment)})
                console.log(result);
                client.close()
            });
        
    }catch(e) {
        console.log(`An error has happened ${String(e)}`);
    }
}

if(args.length > 1) {
    const [increment, id_bwngr] =args;
    adjustPrice({increment, id_bwngr});
}else {
    console.log('missing params');
}

