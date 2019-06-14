'use strict'

const jwt = require('jsonwebtoken')

//////////////////////////// CONSTANTS /////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// PRIVATE and PUBLIC key ==== use 'utf8' to get string instead of byte array  (512 bit key)
// const fs = require('fs')
// const privateKEY  = fs.readFileSync('../secrets/private.key', 'utf8');
// const publicKEY  = fs.readFileSync('../secrets/public.key', 'utf8');
const signOptions = {
    issuer:  "SENSELESS@TEAM",
    expiresIn:  "12h",
    algorithm:  "RS256"
   }
const verifyOptions = {}
const internal = {}
//////////////////////////  MODULE /////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
module.exports = internal.Token = class {
    sign(payload,$Options, privateKEY) {
        return jwt.sign(payload, privateKEY, {...signOptions,audience:$Options.audience})
    }

    verify(token, $Options, publicKEY) {
        try{
            Object.assign(verifyOptions,signOptions,{
                ...signOptions,
                algorithm: ["RS256"],
                audience: $Options.audience
            })
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