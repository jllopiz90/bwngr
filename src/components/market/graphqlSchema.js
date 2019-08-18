import graphqlHTTP from 'express-graphql';
import { buildSchema } from 'graphql';
import { getMarket, getManagersState } from './marketResolvers';
require("dotenv").config();

const schema = buildSchema(`
    type Query {
        dailyMarket(league: String): [Player!]!
        managersState: [Manager!]!
    }

    type Player {
        name: String!
        price: Int!,
        price_increment: Int!
        position: String!
        team_name: String!
        team_id: Int
        prev_bids: [Bid]
    }

    type Manager {
        name: String!
        team_value: Int!
        balance: Int!
        max_bid: Int!
        team: [Player!]!
    }

    type Bid {
        manager: String!,
        avg_bid_overprice: Int!,
        total_bids: Int!
    }
`);

const resolvers = {
    dailyMarket: (args) => getMarket(args.league),
    managersState: () => getManagersState()
}

export default graphqlHTTP({
    schema: schema,
    rootValue: resolvers,
    graphiql: process.env.NODE_ENV === 'dev',
  })
