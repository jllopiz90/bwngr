'use strict'

const path = '/Users/jllopiz90/Documents/Dev/nodeDev/bwngr/data/users.json'
const User = require('../includes/auth/users.js')
const user = new User(path)
user.saveUser('testingUser7','testingPswd7')