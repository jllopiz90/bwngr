import graphqlHTTP from 'express-graphql';
import { buildSchema } from 'graphql';
import { typeSimplePlayer } from '../players/schemaTypes';
import  {typeManager, typeManagerCombination} from '../managers/schemaTypes';
import { getManagersState, getManagerCombinations } from './managersResolvers';

require("dotenv").config();

const schema = buildSchema(`
    type Query {
        allManagers: [Manager!]!
        getmanager(manager: Int): Manager
        getAvailableCombinations(manager: Int, amount_ceil: Int, position: String): [ManagerCombination]!
    }

    ${typeSimplePlayer}

    ${typeManager}

    ${typeManagerCombination}
`);

const resolvers = {
    allManagers: () => getManagersState(),
    getmanager: (args) => getManagersState(args.manager),
    getAvailableCombinations: (args) => getManagerCombinations(args.manager, args.amount_ceil, args.position)
}

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