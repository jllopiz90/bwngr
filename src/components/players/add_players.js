import initPlayers  from './players';

const [league] = process.argv.slice(2);

if(league){
    console.log(`using league ${league}`);
    initPlayers(league);
}else{
    console.log('missing params using la liga by default');
    initPlayers();
}
