import {adjustByBonus} from './managersOperations';

const [league] = process.argv.slice(2);

if(league){
    console.log('league:',league)
    adjustByBonus(league);
}else{
    console.log('missing params, using pl by default');
    adjustByBonus()
}