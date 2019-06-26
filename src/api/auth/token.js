'use strict';
import jwt from 'jsonwebtoken';
import path from 'path';
const privateKEY  = fs.readFileSync(path.dirname(__dirname) + '/secrets/private.key' , 'utf8');
const publicKEY  = fs.readFileSync(path.dirname(__dirname) + '/secrets/public.key' , 'utf8');

const signOptions = {
    issuer:  "SENSELESS@TEAM",
    expiresIn:  "12h",
    algorithm:  "RS256",
    audience:'myBwngrScan'
};

export default class Token {
    constructor({ name, email, password} = {}) {
        this.name = name
        this.email = email
        this.password = password
    }
    
    toJson() {
        return { name: this.name, email: this.email}
    }

    sign() {
        return jwt.sign(this.toJson(), privateKEY, signOptions);
    }

    verify(token) {
        try{
            const verifyOptions = {...signOptions,algorithm: ["RS256"]};
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