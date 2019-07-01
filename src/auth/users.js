"use strict";
import argon2 from 'argon2';
import Token from './token';
import UsersDAO from '../dao/usersDAO';

export default class User {
    static async registerUser(userName, password, isAdmin = false) {
        try {
            let errors = {}
            const pswdHashed = await argon2.hash(password);
            let userInfo = {
                userName,
                pswd: pswdHashed,
                timestmap: new Date()
            };
            if(isAdmin){
                userInfo = Object.assign({},userInfo, {isAdmin})
            }
            console.log('isAdmin:',isAdmin)
            console.log('userInfo:',userInfo)
            const insertResult = await UsersDAO.addUser(userInfo)
            if(!insertResult.success) { errors.user = insertResult.error }
            const userFromDB = await UsersDAO.getUser(userName)
            if (!userFromDB) {
                errors.general = "Internal error, please try again later"
            }
            if (Object.keys(errors).length > 0) {
                return { errors, success: false}
            }
            const token = new Token(userInfo);
            return {
                success: true,
                message: token.sign()
            }
        } catch (err) {
            callback(err)
            console.log('Error:', err)
        }
    }

    static async loginUser(userName, password, callback) {
        try {
            //recover user data from db
            let userData =  {};
            // data = JSON.parse(data)
            
            if (userData === undefined) { //// change with condition for not user found
                callback(null,{ status: false, message: 'User and password doesn\'t match.'});
            }
            // const payload = { all this need to be retreave from the db
            //     userId: user.id,
            //     userName: user.user_name,
            //     msg: 'have nice day!',
            //     bwngr551251: 1
            // }
            const token = new Token(userData);
            
            try {
                if (await argon2.verify(user.pswd, password)) {
                    callback(null, { status: true, message:  token.sign()});
                } else {
                    callback(null, { status: false, message: 'User and password doesn\'t match.' });
                }
            } catch (err) {
                console.log('Error: ',err)  
                callback(err)
            }
        } catch (err) {
            console.log('Error:', err)
            callback(err)
        }
    }
}