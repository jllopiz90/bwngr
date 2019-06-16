'use strict'

const path = '/Users/jllopiz90/Documents/Dev/nodeDev/bwngr/data/users.json'
const User = require('../includes/auth/users')
const Token = require('../includes/auth/token')
const user = new User(path)
const token = new Token()
user.verifyUser('testingUser7','testingPswd7').then((result)=>{
    console.log('message:', result['message'])
    console.log(token.decode(result['message']))
})
