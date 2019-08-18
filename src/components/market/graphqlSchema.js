import graphqlHTTP from 'express-graphql';
import { buildSchema } from 'graphql';
import { getMarket } from './marketResolvers';
import { getManagersState } from '../managers/managersResolvers';
import  {typeSimplePlayer, typeAdvancedPlayer, typeBid} from '../players/schemaTypes';
import  {typeManager} from '../managers/schemaTypes';
require("dotenv").config();

const schema = buildSchema(`
    type Query {
        dailyMarket(league: String): [AdvancedPlayer!]!
        allManagersState: [Manager!]!
        managerState(manager: Int): Manager!
    }

    ${typeAdvancedPlayer}

    ${typeSimplePlayer}

    ${typeBid}

    ${typeManager}
`);

const resolvers = {
    dailyMarket: (args) => getMarket(args.league),
    allManagersState: () => getManagersState(),
    managerState: (args) => getManagersState(args.manager)
}


//////
//// handler to allow call the next middleware
/////

export default async function graphqlHandler(req, res, next) {
    const graphqlHTTPHandler = graphqlHTTP({
        schema: schema,
        rootValue: resolvers,
        graphiql: process.env.NODE_ENV === 'dev',
    });
    try {
        await graphqlHTTPHandler(req, res);    
        next();
    } catch (e) {
        next(e);
    }
}

//////
//// regular way to export the grahpql
//////
// export default graphqlHTTP({
//     schema: schema,
//     rootValue: resolvers,
//     graphiql: process.env.NODE_ENV === 'dev',
//   })