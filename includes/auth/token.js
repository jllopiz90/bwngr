'use strict'
/////////////// requires (imports, use)////////////////////
//////////////////////////////////////////////////////////
const fs = require('fs')
const jwt = require('jsonwebtoken')

//////////////////////////// CONSTANTS /////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// PRIVATE and PUBLIC key ==== use 'utf8' to get string instead of byte array  (512 bit key)
const privateKEY  = fs.readFileSync('../secrets/private.key', 'utf8');
const publicKEY  = fs.readFileSync('../secrets/public.key', 'utf8');
const signOptions = {
    issuer:  "SENSELESS@TEAM",
    expiresIn:  "12h",
    algorithm:  "RS256"
   }
const verifyOptions = {}

//////////////////////////  MODULE /////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
module.exports = {
    sign: (payload,$Options) =>  jwt.sign(payload, privateKEY, {...signOptions,audience:$Options.audience}),
    verify: (token, $Options) => {
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
    },
    decode: (token) => jwt.decode(token,{complete: true}), //return node if token is invalid
}





// const payload = {
//     userName: 'some_user',
//     usertYpe: 'some_user_type'
// }