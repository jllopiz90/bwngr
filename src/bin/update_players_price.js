'use strict';
require("dotenv").config();
import 'core-js/stable';
import PlayersDAO from '../dao/playersDAO';
import { MongoClient } from "mongodb";

//run this script like this : npm run set_balance -- 25000000 1802949     (after -- the parameters)

let args = process.argv.slice(2);
const dbs = {
    'test': process.env.BWNGR_DB_TEST,
    'liga': process.env.BWNGR_DB,
    'pl': process.env.BWNGR_DB_PL
};
const isInt = (value) => Number.isInteger(parseInt(value));

const adjustPrice = async ({increment, id_bwngr, league = 'liga'}) => {
    try{
        MongoClient.connect(
            process.env.BWNGR_DB_URI,
            { useNewUrlParser: true })
            .catch(err => {
                console.error('=====Error:', err.toString());
                console.error('=====Error stack:', err.stack);
                client.close();
                process.exit(1)
            })
            .then(async client => {
                let result;
                const db = client.db(dbs[league]);
                await PlayersDAO.injectDB(db);
                console.log('increment:',increment)
                console.log('id:',id_bwngr)
                result = await PlayersDAO.updatePrice({id_bwngr: id_bwngr, increment: increment})
                console.log(result);
                client.close()
            });
        
    }catch(e) {
        console.log(`An error has happened ${String(e)}`);
    }
}

if(args.length > 2) {
    const [league, increment, id_bwngr] =args;
    adjustPrice({increment, id_bwngr, league});
} else if(args.length > 1){
    if(isInt(args[0]) && isInt(args[1])){
        console.log('missing params, using la liga by default');
        const [increment, id_bwngr] = args;
        adjustPrice({increment,id_bwngr});
    } else {
        console.log('missing params or wrong type of params');
    }
} else{
    console.log('missing params');
}

