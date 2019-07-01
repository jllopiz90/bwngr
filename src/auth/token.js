'use strict';
import fs from 'fs';
import jwt from 'jsonwebtoken';
const privateKEY  = fs.readFileSync(process.cwd() + '/src/secrets/private.key' , 'utf8');
const publicKEY  = fs.readFileSync(process.cwd() + '/src/secrets/public.key' , 'utf8');

const signOptions = {
    issuer:  "SENSELESS@TEAM",
    expiresIn:  "12h",
    algorithm:  "RS256",
    audience:'myBwngrScan'
};

export default class Token {
    constructor(name, isAdmin = false) {
        this.name = name;
        this.isAdmin = isAdmin;
    }
    
    toJson() {
        const payload = { 
            userName: this.name,
            isAdmin: this.isAdmin,
            msg: 'have nice day!',
            bwngr551251: 1
        }
        return payload;
    }

    sign() {
        return jwt.sign(this.toJson(), privateKEY, signOptions);
    }

    verify(token) {
        try{
            const verifyOptions = Object.assign(signOptions,{algorithm: ["RS256"]});
            return jwt.verify(token,publicKEY,verifyOptions)
        } catch (err) {
            return false
        }
    }

    decode(token) {
        try {
            const decode_token = _decode(token)
            if(decode_token === 'undefined' || decode_token === null || !decode_token['payload']['bwngr551251']){
                return false
            }
            return decode_token
        } catch (error) {
            console.log(error)
            return false
        }
    }
    
}

const _decode = (token) => jwt.decode(token,{complete: true}) //return node if token is invalid