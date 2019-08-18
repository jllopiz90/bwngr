export const typeAdvancedPlayer = `type AdvancedPlayer {
    name: String!
    price: Int!,
    price_increment: Int!
    position: String!
    team_name: String!
    team_id: Int
    prev_bids: [Bid]
}`;

export const typeSimplePlayer = ` type SimplePlayer {
    name: String!
    price: Int!,
    position: String!
    team_name: String!
    team_id: Int
}`;

export const typeBid = `type Bid {
    manager: String!,
    avg_bid_overprice: Int!,
    total_bids: Int!
}`;