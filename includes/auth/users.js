"use strict"
const fs = require('fs')
const bcrypt = require('bcrypt')

const internal = {}
module.exports = internal.User = class {
    constructor(arg) {
        this._path = arg
    }

    saveUser(userName, password) {
        try {
            fs.accessSync(this._path, fs.constants.F_OK)
            fs.access(this._path, fs.constants.W_OK | fs.constants.R_OK, (err2) => {
                if (err2) {
                    console.error(err2.code)
                } else {
                    let data = fs.readFileSync(this._path, 'utf8')
                    data = JSON.parse(data)
                    if (data === undefined) {
                        return false
                    }
                    const userExists = data.some((row) =>{
                        return row.user_name === userName
                    } )
                    if (userExists) {
                        console.error('user already exists')
                        return false
                    }
                    const newId = data.length === 0 ? 1 : parseInt(_lastElement(data)['id']) + 1
                    data.push({
                        id: newId,
                        user_name: userName,
                        pswd: password,
                        created_at: (new Date).toISOString()
                    })
                    _cryptPassword(this._path,data, _writeToDisk)
                }
            })
        } catch (err) {
            console.log('inside catch:')
            console.log('Error:',err)
            _cryptPassword(this._path,[{
                id: 1,
                user_name: userName,
                pswd: password, 
                created_at: (new Date).toISOString()
            }], _writeToDisk)
        }
    }
}

const _writeToDisk = (path, data) => {
    fs.writeFileSync(path, JSON.stringify(data))
}

const _lastElement = (data) => data[data.length-1]

const _cryptPassword = (path,data, callback) => {
    bcrypt.genSalt(10, function(err, salt) {
     if (err) 
       callback(err)
     let lastRecord = data.pop()  
     const password = lastRecord.pswd   
     bcrypt.hash(password, salt, function(err, hash) {
         lastRecord.pswd = hash
         data.push(lastRecord)
         callback(path,data)
     })
   })
 }
 
 const _comparePassword = function(plainPass, hashword, callback) {
    bcrypt.compare(plainPass, hashword, function(err, res) {
        if(err)
            callback(err)
        callback(res)
    });
 }