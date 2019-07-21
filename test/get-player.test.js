'use strict'
require("dotenv").config();
import { MongoClient } from "mongodb";
import PlayersDAO from '../src/dao/playersDAO';

let client;
const id_bwngr = 140;
describe("Get player from DB", () => {
    beforeAll(async () => {
        client = await MongoClient.connect(
            'mongodb+srv://senseless:cheatingPasteles@bwngertracker-8iqhj.mongodb.net/test?retryWrites=true&w=majority',
            {poolSize: 50,wtimeout:2500, useNewUrlParser: true }
          );
        await PlayersDAO.injectDB(client.db('bwngerDB'));
    });

    afterAll(async () => {
       await client.close();
    });

    test("Should return Pique", async () => {
        const [player] = await PlayersDAO.getPlayer({id_bwngr});
        expect(player.slug).toBe('pique')
    })

})

//npm test -t get-player    <======= command to run test