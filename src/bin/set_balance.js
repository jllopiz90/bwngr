'use strict';
require("dotenv").config();
import 'core-js/stable';
import ManagersDAO from '../dao/managersDAO';
import { MongoClient } from "mongodb";

//run this script like this : npm run set_balance -- 25000000 1802949     (after -- the parameters)

let args = process.argv.slice(2);

const setBalance = async ({amount = '', id_bwngr = ''}) => {
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
                await ManagersDAO.injectDB(client);
                console.log('amount:',amount)
                console.log('id:',id_bwngr)
                if(id_bwngr === ''){
                    console.log('setting all players')
                    result = await ManagersDAO.setBalanceAllPlayers(amount);
                } else {
                    console.log('setting 1 players')
                    result = await ManagersDAO.setBalancePlayer({amount, id_bwngr})
                }
                console.log(result);
                client.close()
            });
        
    }catch(e) {
        console.log(`An error has happened ${String(e)}`);
    }
}

if(args.length > 1) {
    const [amount, id_bwngr] = args;
    setBalance({amount, id_bwngr});
} else {
    const [amount] =args;
    setBalance({amount});
}

