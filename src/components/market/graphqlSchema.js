import graphqlHTTP from 'express-graphql';
import  { buildSchema } from 'graphql';

const schema = buildSchema(`
    type Query {
        dailyMarket: [Player!]!
        managersState: [Manager!]!
    }

    type Player {
        name: String!
        price: Int!
        position: String!
        team: String
    }

    type Manager {
        name: String!
        teamValue: Int!
        balance: Int!
        maxBid: Int!
        players: [Player!]!
    }
`);