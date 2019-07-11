'use strict'
require("dotenv").config();
import 'core-js/stable';
import GetLeagueData from '../requests/getLeagueData';

const getPlayers = async ()=> {
    const handleLeage = new GetLeagueData();
    const { message: data} = await handleLeage.getPlayers();
    const dataArray = Object.values(data);
    console.log(data)
    // console.log(dataArray.length);
    // console.log(dataArray[0]);
    // console.log(dataArray[dataArray.length -1]);
    // dataArray.forEach( elem => {
    //     console.log(`player slug: ${elem.slug} --- player id: ${elem.id}`)
    // });
}

getPlayers();


// const fs = require('fs')
// const Token = require('../includes/auth/token')
// const token = new Token()
// const payload = {
//     userName: 'testingUser6',
//     msg: 'have nice day!',
//     bwngr551251: 1
// }
// const privateKEY  = fs.readFileSync('../includes/secrets/private.key', 'utf8');
// const publicKEY  = fs.readFileSync('../includes/secrets/public.key', 'utf8');
// const tokenGenerated = token.sign(payload,{audience:'myBwngrScan'},privateKEY)
// console.log('token',tokenGenerated)
// console.log('\n')
// const legit = token.verify(tokenGenerated,{audience:'myBwngrScan'}, publicKEY)
// console.log('verifid token: ', legit)
// console.log('\n')
// const tokenDecoded = token.decode('eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyTmFtZSI6MywibXNnIjoiaGF2ZSBuaWNlIGRheSEiLCJpYXQiOjE1NjA0ODg4NDksImV4cCI6MTU2MDUzMjA0OSwiYXVkIjoibXlCd25nclNjYW4iLCJpc3MiOiJTRU5TRUxFU1NAVEVBTSJ9.XrV5f8_BQNIEbGfvFrftdlQhpBMBMU-VdUzNX1Ok9k3Py1jw8uXTVriGOWozDJMmPUzp8iUKiYogUyRaOv2KoA')
// console.log('token decoded: ', tokenDecoded)