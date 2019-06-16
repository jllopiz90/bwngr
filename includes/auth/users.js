"use strict"
const fs = require('fs')
const argon2 = require('argon2');
const bcrypt = require('bcrypt')
const token = require('./token')
const privateKEY  = fs.readFileSync('../includes/secrets/private.key', 'utf8');

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
                        return { status: false, message: 'data undefined' }
                    }
                    const userExists = data.some((row) => {
                        return row.user_name === userName
                    })
                    if (userExists) {
                        return { status: false, message: 'User already exists!' }
                    }
                    const newId = data.length === 0 ? 1 : parseInt(_lastElement(data)['id']) + 1
                    data.push({
                        id: newId,
                        user_name: userName,
                        pswd: password,
                        created_at: (new Date).toISOString()
                    })
                    _cryptPassword(this._path, data, _writeToDisk)
                    return { status: true, message: 'User saved!' }
                }
            })
        } catch (err) {
            console.log('inside save user catch:')
            console.log('Error:', err)
            _cryptPassword(this._path, [{
                id: 1,
                user_name: userName,
                pswd: password,
                created_at: (new Date).toISOString()
            }], _writeToDisk)
        }
    }

    verifyUser(userName, password) {
        try {
            fs.accessSync(this._path, fs.constants.F_OK)
            fs.accessSync(this._path, fs.constants.W_OK | fs.constants.R_OK)
            let data = fs.readFileSync(this._path, 'utf8')
            data = JSON.parse(data)
            if (data === undefined) {
                return { status: false, message: 'No users data found!' }
            }
            const user = data.find((row) => {
                return row.user_name === userName
            })
            if (user === 'unefined') {
                return { status: false, message: 'User and password doesn\'t match.' }
            }
            const match = bcrypt.compareSync(password, user.pswd)
            if (match) {
                const Token = new token()
                const payload = {
                    userId: user.id,
                    userName: user.user_name,
                    msg: 'have nice day!',
                    bwngr551251: 1
                }
                return { status: true, message:  Token.sign(payload,{audience:'myBwngrScan'},privateKEY)}
            }
            return { status: false, message: 'User and password doesn\'t match.' }
        } catch (err) {
            console.log('inside verifyUser catch:')
            console.log('Error:', err)
            return { status: false, message: err }
        }
    }
}

const _writeToDisk = (error, data) => {
    if(error){
        console.log("Error: ",error)
    }
    const {path, payload} = data
    fs.writeFileSync(path, JSON.stringify(payload))
}

// ========== Using argon2 (the community say this is better)  ===============
async const _argon2Pswd = (path, payload, callback) => {
    try {
        let lastRecord = payload.pop()
        const password = lastRecord.pswd
        const hash = await argon2.hash(password);
        lastRecord.pswd = hash
        payload.push(lastRecord)
        callback({path: path, payload: payload})
      } catch (err) {
        callback(err)
      }
}

const _lastElement = (data) => data[data.length - 1]


// ========== Using bcrypt  ===============
const _cryptPassword = (path, payload, callback) => {
    bcrypt.genSalt(10, function (error, salt) {
        if (error)
            callback(err)
        let lastRecord = payload.pop()
        const password = lastRecord.pswd
        bcrypt.hash(password, salt, function (err, hash) {
            if(err)
                callback(err)
            lastRecord.pswd = hash
            payload.push(lastRecord)
            callback({path: path, payload: payload})
        })
    })
}