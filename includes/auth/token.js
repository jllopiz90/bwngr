'use strict'

const path = '/Users/jllopiz90/Documents/Dev/nodeDev/auth/data/users.json'
const User = require('./users')
const user = new User(path)
user.saveUser('testingUser2','testingPswd')
