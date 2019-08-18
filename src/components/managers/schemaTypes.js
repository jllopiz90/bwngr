export const typeManager = `type Manager {
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