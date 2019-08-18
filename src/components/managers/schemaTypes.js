export const typeManager = `type Manager {
    id_bwngr: Int
    name: String!
    team_value: Int!
    balance: Int!
    max_bid: Int!
    team: [SimplePlayer!]!
}`;

export const typeManagerCombination = `type ManagerCombination {
    teamVariation: [SimplePlayer]!
    discards: [SimplePlayer]!
    availableSpend: Int!
}`