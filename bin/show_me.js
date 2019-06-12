'use strict'
const fs = require('fs')
const Token = require('../includes/auth/token')
const token = new Token()
const payload = {
    userName: 'some_user',
    usertYpe: 'some_user_type'
}
const privateKEY  = fs.readFileSync('../includes/secrets/private.key', 'utf8');
const publicKEY  = fs.readFileSync('../includes/secrets/public.key', 'utf8');
const tokenGenerated = token.sign(payload,{audience:'myBwngrScan'},privateKEY)
console.log('token',tokenGenerated)
console.log('\n')
const legit = token.verify(tokenGenerated,{audience:'myBwngrScan'}, publicKEY)
console.log('verifid token: ', legit)
console.log('\n')
const tokenDecoded = token.decode(tokenGenerated)
console.log('token decoded: ', tokenDecoded)