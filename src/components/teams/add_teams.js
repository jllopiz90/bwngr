import { insertTeams } from './teams';

const [league] = process.argv.slice(2);

if(league){
    insertTeams(league);
}else{
    console.log('missing params using la liga by default');
    insertTeams();
}
