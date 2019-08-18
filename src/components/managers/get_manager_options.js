import {getManagerCombinations} from './managersOperations';
import { isInt } from '../../utils/utils';

let args = process.argv.slice(2);

if(args.length > 3) {
    const [league, id_bwngr, amount, position] = args;
    executeAsyncFunc(id_bwngr, amount, position, league);
} else if(args.length > 2){
    if(isInt(args[0]) && isInt(args[1])){
        console.log('missing params, using pl by default');
        const [id_bwngr, amount,position] = args;
        executeAsyncFunc(id_bwngr,amount, position, 'pl');
    }
} else if(args.length <= 2) {
    console.log('missing params');
}

export async function executeAsyncFunc(id_bwngr, balance_to_reach, position, league) {
    const variations = await getManagerCombinations(parseInt(id_bwngr), parseInt(balance_to_reach), position, league);
    if(variations.length) {
        variations.forEach( ({teamVariation, discards, availableSpend}) => {
            console.log('available to spend:', availableSpend);
            console.log('possible discards:', discards);
            console.log('remaining team:', teamVariation);
        });
    } else {
        console.log('no sales available');
    }
}