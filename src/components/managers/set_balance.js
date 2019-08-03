'use strict';
import { setBalance } from './managers';
import { isInt } from '../../utils/utils';

//run this script like this : npm run set_balance -- 25000000 1802949     (after -- the parameters)

let args = process.argv.slice(2);

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
        console.log('using league: ',league);
        setBalance({amount,id_bwngr: '', league});    
    }
} else if(args.length === 1) {
    const [amount] =args;
    console.log('missing params, using la liga by default and setting balance for all users');
    setBalance({amount});
} else{
    console.log('missing params');
}
