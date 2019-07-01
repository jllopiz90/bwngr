"use strict";
import argon2 from 'argon2';
import Token from './token';
import UsersDAO from '../dao/usersDAO';

export default class User {
    static async registerUser(userName, password, isAdmin = false) {
        try {
            let errors = {};
            const pswdHashed = await argon2.hash(password);
            let userInfo = {
                userName,
                pswd: pswdHashed,
                timestmap: new Date()
            };
            if (isAdmin) {
                userInfo = Object.assign({}, userInfo, { isAdmin });
            }

            const insertResult = await UsersDAO.addUser(userInfo);
            if (!insertResult.success) { errors.user = insertResult.error };
            const userFromDB = await UsersDAO.getUser(userName);
            if (!userFromDB) {
                errors.general = "Internal error, please try again later";
            }
            if (Object.keys(errors).length > 0) {
                return { errors, success: false };
            }
            const token = new Token(userName, isAdmin);
            return {
                success: true,
                message: token.sign()
            };
        } catch (err) {
            console.error('Error:', err.toString());
            throw err;
        }
    }

    static async loginUser(userName, password) {
        try {
            //recover user data from db
            const { userName: user_name, pswd, isAdmin = false } = await UsersDAO.getUser(userName);
            if (!user_name) {
                return {
                    success: false,
                    errors: 'User and password doesn\'t match.'
                };
            }

            const token = new Token(user_name, isAdmin);

            if (await argon2.verify(pswd, password)) {
                const { success } =  await UsersDAO.loginUser(userName, token.sign());
                return {
                    status: success,
                    message: success ? token.sign() : 'An error has happened!'
                };
            } else {
                return {
                    status: false,
                    message: 'User and password doesn\'t match.'
                };
            }

        } catch (err) {
            console.error('Error:', err)
            console.log('\n===============================================\n')
            throw err;
        }
    }
}