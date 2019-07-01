'use strict'
import argon2 from 'argon2';
const pswdHashed = argon2.hash(password);
console.log(pswdHashed)
// const path = '/Users/jllopiz90/Documents/Dev/nodeDev/bwngr/data/users.json'
// const User = require('../includes/auth/users.js')
// const user = new User(path)
// user.saveUser('testingUser7','testingPswd7')
