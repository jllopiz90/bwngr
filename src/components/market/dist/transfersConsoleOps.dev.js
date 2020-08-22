'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = updateTransfers;

require("core-js/stable");

var _moment = _interopRequireDefault(require("moment"));

var _mongodb = require("mongodb");

var _getLeagueData = _interopRequireDefault(require("../../requests/getLeagueData"));

var _transfersDAO = _interopRequireDefault(require("./transfersDAO"));

var _playersDAO = _interopRequireDefault(require("../players/playersDAO"));

var _managersDAO = _interopRequireDefault(require("../managers/managersDAO"));

var _utils = require("../../utils/utils");

var _objectCallers = require("../../utils/objectCallers");

var _common = require("../../utils/common");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

require("dotenv").config();

var mapTransactionsName = {
  'transfer': 'sale',
  'market': 'purchase',
  'loan': 'loan',
  'adminTransfer': 'sale'
};

var groupByManager = function groupByManager(groupKeys, currentRow) {
  return (0, _utils.groupingBy)('manager', 'amount', groupKeys, currentRow);
};

var compareObj = function compareObj(obj1, obj2) {
  return Object.keys(obj1).length === Object.keys(obj2).length && Object.keys(obj1).every(function (key) {
    return _objectCallers.has.call(obj2, key) && obj1[key] === obj2[key];
  });
};

function updateTransfers(date_moment) {
  var league,
      client,
      clientPromise,
      handleLeage,
      _ref,
      data,
      db,
      dealsFilteredByDate,
      dealsPromise,
      transfersFromDB,
      _ref2,
      _ref3,
      formattedDeals,
      bids,
      noInDBDeals,
      inserTransfersResult,
      formattedAndFilteredDeals,
      i,
      deal,
      price,
      _args = arguments;

  return regeneratorRuntime.async(function updateTransfers$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          league = _args.length > 1 && _args[1] !== undefined ? _args[1] : 'pl';
          _context.prev = 1;
          clientPromise = _mongodb.MongoClient.connect(process.env.BWNGR_DB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
          });
          handleLeage = new _getLeagueData["default"](league);
          _context.next = 6;
          return regeneratorRuntime.awrap(handleLeage.getTransactions(0, 200));

        case 6:
          _ref = _context.sent;
          data = _ref.data.data;
          console.log('players fetched from bwngr');
          _context.next = 11;
          return regeneratorRuntime.awrap(clientPromise);

        case 11:
          client = _context.sent;
          db = client.db(_common.dbs[league]);
          _context.next = 15;
          return regeneratorRuntime.awrap(_playersDAO["default"].injectDB(db));

        case 15:
          dealsFilteredByDate = data.filter(function (deal) {
            return _moment["default"].unix(deal.date).format('MM-DD-YYYY') === date_moment;
          });
          dealsPromise = getFormattedDeals(dealsFilteredByDate);
          _context.next = 19;
          return regeneratorRuntime.awrap(_transfersDAO["default"].injectDB(db));

        case 19:
          _context.next = 21;
          return regeneratorRuntime.awrap(_managersDAO["default"].injectDB(db));

        case 21:
          _context.next = 23;
          return regeneratorRuntime.awrap(_transfersDAO["default"].getTransaction({
            date: date_moment
          }, {
            projection: {
              _id: 0
            }
          }));

        case 23:
          transfersFromDB = _context.sent;
          _context.next = 26;
          return regeneratorRuntime.awrap(dealsPromise);

        case 26:
          _ref2 = _context.sent;
          _ref3 = _slicedToArray(_ref2, 2);
          formattedDeals = _ref3[0];
          bids = _ref3[1];
          noInDBDeals = formattedDeals.filter(function (deal) {
            return !transfersFromDB.some(function (dealFromDB) {
              return compareObj(deal, dealFromDB);
            });
          });

          if (!noInDBDeals.length) {
            _context.next = 37;
            break;
          }

          _context.next = 34;
          return regeneratorRuntime.awrap(_transfersDAO["default"].insertTransfersByDate(noInDBDeals));

        case 34:
          _context.t0 = _context.sent;
          _context.next = 38;
          break;

        case 37:
          _context.t0 = 'no deals to insert';

        case 38:
          inserTransfersResult = _context.t0;
          console.log('deals insert status: ', inserTransfersResult);

          if (!(!inserTransfersResult || inserTransfersResult === 'no deals to insert')) {
            _context.next = 43;
            break;
          }

          client.close();
          return _context.abrupt("return");

        case 43:
          console.log('before update managers');
          _context.next = 46;
          return regeneratorRuntime.awrap(updateManagers(noInDBDeals));

        case 46:
          console.log('after update managers');
          console.log('before update players ownership');
          _context.next = 50;
          return regeneratorRuntime.awrap(updatePlayersOwnership(noInDBDeals));

        case 50:
          console.log('after update players ownership');
          formattedAndFilteredDeals = noInDBDeals.filter(function (deal) {
            return deal.type === 'purchase';
          });
          i = 0;

        case 53:
          if (!(i < formattedAndFilteredDeals.length)) {
            _context.next = 62;
            break;
          }

          deal = formattedAndFilteredDeals[i];
          _context.next = 57;
          return regeneratorRuntime.awrap(_playersDAO["default"].getPlayerCurrentPrice(parseInt(deal.player)));

        case 57:
          price = _context.sent;
          bids.push({
            player: deal.player,
            manager: deal.moveTo,
            amount: deal.amount,
            overprice: deal.amount - price || 0,
            date: deal.date
          });

        case 59:
          i++;
          _context.next = 53;
          break;

        case 62:
          console.log('before insert bids');
          _context.t1 = bids.length;

          if (!_context.t1) {
            _context.next = 67;
            break;
          }

          _context.next = 67;
          return regeneratorRuntime.awrap(_transfersDAO["default"].insertBidsByDate(bids, date_moment));

        case 67:
          console.log(bids.length ? 'after insert bids' : 'no bids to insert');
          client.close();
          console.log('done');
          return _context.abrupt("return", {
            success: true,
            message: 'All done!'
          });

        case 73:
          _context.prev = 73;
          _context.t2 = _context["catch"](1);
          (0, _common.handleError)(_context.t2, 'Unable to update transfers');
          client && client.close();
          return _context.abrupt("return", {
            success: false,
            message: 'Something went wrong pal :('
          });

        case 78:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[1, 73]]);
}

function getFormattedDeals(deals) {
  var formattedDeals, bids, _loop, i;

  return regeneratorRuntime.async(function getFormattedDeals$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          formattedDeals = [];
          bids = [];

          _loop = function _loop(i) {
            var _loop2, j;

            return regeneratorRuntime.async(function _loop$(_context3) {
              while (1) {
                switch (_context3.prev = _context3.next) {
                  case 0:
                    _loop2 = function _loop2(j) {
                      var date, from, to, price;
                      return regeneratorRuntime.async(function _loop2$(_context2) {
                        while (1) {
                          switch (_context2.prev = _context2.next) {
                            case 0:
                              date = _moment["default"].unix(deals[i].date).format('MM-DD-YYYY');
                              from = _objectCallers.has.call(deals[i].content[j], 'from') ? deals[i].content[j].from.id : 'market';
                              to = _objectCallers.has.call(deals[i].content[j], 'to') ? deals[i].content[j].to.id : 'market';
                              formattedDeals.push({
                                type: mapTransactionsName[deals[i].type] || deals[i].type,
                                player: deals[i].content[j].player,
                                moveFrom: from,
                                moveTo: to,
                                amount: deals[i].content[j].amount,
                                unix_time: deals[i].date,
                                date: date
                              });

                              if (!_objectCallers.has.call(deals[i].content[j], 'bids')) {
                                _context2.next = 9;
                                break;
                              }

                              _context2.next = 7;
                              return regeneratorRuntime.awrap(_playersDAO["default"].getPlayerCurrentPrice(parseInt(deals[i].content[j].player)));

                            case 7:
                              price = _context2.sent;
                              price > 0 && deals[i].content[j].bids.forEach(function (bid) {
                                bids.push({
                                  player: deals[i].content[j].player,
                                  manager: bid.user.id,
                                  amount: bid.amount,
                                  overprice: parseInt(bid.amount) - price,
                                  date: date
                                });
                              });

                            case 9:
                              ;

                            case 10:
                            case "end":
                              return _context2.stop();
                          }
                        }
                      });
                    };

                    j = 0;

                  case 2:
                    if (!(j < deals[i].content.length)) {
                      _context3.next = 8;
                      break;
                    }

                    _context3.next = 5;
                    return regeneratorRuntime.awrap(_loop2(j));

                  case 5:
                    j++;
                    _context3.next = 2;
                    break;

                  case 8:
                  case "end":
                    return _context3.stop();
                }
              }
            });
          };

          i = 0;

        case 4:
          if (!(i < deals.length)) {
            _context4.next = 10;
            break;
          }

          _context4.next = 7;
          return regeneratorRuntime.awrap(_loop(i));

        case 7:
          i++;
          _context4.next = 4;
          break;

        case 10:
          return _context4.abrupt("return", [formattedDeals, bids]);

        case 11:
        case "end":
          return _context4.stop();
      }
    }
  });
}

function updateManagers(formattedDeals) {
  var salesFormatted, purchasesFormatted, purchasesGrouped, salesGrouped, salesKeys, purchasesKeys, i, manager, amount, _i2, _manager, _amount;

  return regeneratorRuntime.async(function updateManagers$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          salesFormatted = formattedDeals.filter(function (deal) {
            return deal.type === 'sale';
          }).map(function (sale) {
            return {
              manager: sale.moveFrom,
              amount: sale.amount
            };
          });
          purchasesFormatted = formattedDeals.filter(function (deal) {
            return deal.type === 'purchase';
          }).map(function (purchase) {
            return {
              manager: purchase.moveTo,
              amount: purchase.amount
            };
          });
          formattedDeals.filter(function (deal) {
            return deal.type === 'sale' && deal.moveTo !== 'market';
          }).map(function (deal) {
            return {
              manager: deal.moveTo,
              amount: deal.amount
            };
          }).forEach(function (element) {
            purchasesFormatted.push(element);
          });
          purchasesGrouped = purchasesFormatted.reduce(groupByManager, {});
          salesGrouped = salesFormatted.reduce(groupByManager, {});
          salesKeys = Object.keys(salesGrouped);
          purchasesKeys = Object.keys(purchasesGrouped);
          i = 0;

        case 8:
          if (!(i < purchasesKeys.length)) {
            _context5.next = 16;
            break;
          }

          manager = purchasesKeys[i];
          amount = parseInt(purchasesGrouped[manager]);
          _context5.next = 13;
          return regeneratorRuntime.awrap(_managersDAO["default"].modifyBalance(0 - amount, manager));

        case 13:
          i++;
          _context5.next = 8;
          break;

        case 16:
          _i2 = 0;

        case 17:
          if (!(_i2 < salesKeys.length)) {
            _context5.next = 25;
            break;
          }

          _manager = salesKeys[_i2];
          _amount = parseInt(salesGrouped[_manager]);
          _context5.next = 22;
          return regeneratorRuntime.awrap(_managersDAO["default"].modifyBalance(_amount, _manager));

        case 22:
          _i2++;
          _context5.next = 17;
          break;

        case 25:
        case "end":
          return _context5.stop();
      }
    }
  });
}

function updatePlayersOwnership(formattedDeals) {
  var purchasesFormatted, salesFormatted, moves;
  return regeneratorRuntime.async(function updatePlayersOwnership$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          purchasesFormatted = formattedDeals.filter(function (purchase) {
            return purchase.type === 'purchase';
          }).map(function (purchase) {
            return {
              player: purchase.player,
              new_owner: purchase.moveTo,
              time: purchase.unix_time
            };
          });
          salesFormatted = formattedDeals.filter(function (sale) {
            return sale.type === 'sale';
          }).map(function (sale) {
            return {
              player: sale.player,
              new_owner: sale.moveTo,
              time: sale.unix_time
            };
          });
          moves = purchasesFormatted.concat(salesFormatted);
          _context6.t0 = moves.length;

          if (!_context6.t0) {
            _context6.next = 7;
            break;
          }

          _context6.next = 7;
          return regeneratorRuntime.awrap(_playersDAO["default"].updatePlayersOwnership(moves));

        case 7:
        case "end":
          return _context6.stop();
      }
    }
  });
}