'use strict';
require("dotenv").config();
import 'core-js/stable';
import ManagersDAO from '../dao/managersDAO';
import { MongoClient } from "mongodb";

//run this script like this : npm run set_balance -- 25000000 1802949     (after -- the parameters)

let args = process.argv.slice(2);
const dbs = {
    'test': process.env.BWNGR_DB_TEST,
    'liga': process.env.BWNGR_DB,
    'pl': process.env.BWNGR_DB_PL
};
const isInt = (value) => Number.isInteger(parseInt(value));

const setBalance = async ({amount = '', id_bwngr = '', league= 'liga'}) => {
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
                const db = league === 'pl' ? client.db(process.env.BWNGR_DB_PL) : client.db(process.env.BWNGR_DB);
                await ManagersDAO.injectDB(db);
                console.log('amount:',amount)
                console.log('id:',id_bwngr)
                if(id_bwngr === ''){
                    console.log('setting all managers')
                    result = await ManagersDAO.setBalanceAllPlayers(amount);
                } else {
                    console.log('setting 1 managers')
                    result = await ManagersDAO.setBalancePlayer({amount: amount, id_bwngr: id_bwngr})
                }
                console.log(result);
                client.close()
            });
        
    }catch(e) {
        console.log(`An error has happened ${String(e)}`);
    }
}

if(args.length > 2) {
    const [league, amount, id_bwngr] = args;
    setBalance({amount, id_bwngr, league});
} else if(args.length > 1){
    if(isInt(args[0]) && isInt(args[1])){
        console.log('missing params, using la liga by default');
        const [amount, id_bwngr] = args;
        setBalance({amount,id_bwngr});
    } else {
        console.log('missing params, setting balance for all users');
        const [league,amount] = args;
        setBalance({amount,id_bwngr: '', league});    
    }
} else if(args.length === 1) {
    const [amount] =args;
    console.log('missing params, using la liga by default and setting balance for all users');
    setBalance({amount,id_bwngr: '', league: ''});
} else{
    console.log('missing params');
}

