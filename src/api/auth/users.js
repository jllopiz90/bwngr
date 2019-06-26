"use strict";
import argon2 from 'argon2';
import Token from './token';

export default class User {

    static async registerUser(userName, password, callback) {
        try {
            //check user doesn't exists before try to create it


            const pswdHashed = argon2.hash(password);
            ///////write to db user and pswd hashed

            //call the callback
            callback(null,{ status: true, message: 'User saved!' }  );
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