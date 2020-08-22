'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = initPlayers;
exports.adjustPrice = adjustPrice;

require("core-js/stable");

var _moment = _interopRequireDefault(require("moment"));

var _mongodb = require("mongodb");

var _playersDAO = _interopRequireDefault(require("./playersDAO"));

var _getLeagueData = _interopRequireDefault(require("../../requests/getLeagueData"));

var _common = require("../../utils/common");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

require("dotenv").config();

var playerPositions = ['gk', 'df', 'mf', 'st'];

function initPlayers() {
  var league,
      clientResolved,
      promiseClient,
      handleLeage,
      playersData,
      moment_today,
      currentYear,
      initDate,
      _ref,
      players,
      dataArray,
      db,
      result,
      _args = arguments;

  return regeneratorRuntime.async(function initPlayers$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          league = _args.length > 0 && _args[0] !== undefined ? _args[0] : 'pl';
          _context.prev = 1;
          promiseClient = _mongodb.MongoClient.connect(process.env.BWNGR_DB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
          });
          handleLeage = new _getLeagueData["default"](league);
          playersData = handleLeage.getPlayers();
          moment_today = (0, _moment["default"])();
          currentYear = moment_today.year();
          initDate = league === 'test' ? "".concat(currentYear, "-07-16") : "".concat((0, _moment["default"])().format("YYYY-MM-DD"));
          _context.next = 10;
          return regeneratorRuntime.awrap(playersData);

        case 10:
          _ref = _context.sent;
          players = _ref.data.data.players;
          dataArray = Object.values(players).map(function (player) {
            return {
              id_bwngr: player.id,
              name: player.name,
              slug: player.slug,
              team_id: player.teamID,
              position: playerPositions[player.position - 1],
              price: player.price,
              price_increment: player.priceIncrement,
              owner: 'market',
              own_since: (0, _moment["default"])(initDate).unix()
            };
          });
          _context.next = 15;
          return regeneratorRuntime.awrap(promiseClient);

        case 15:
          clientResolved = _context.sent;
          db = clientResolved.db(_common.dbs[league]);
          _context.next = 19;
          return regeneratorRuntime.awrap(_playersDAO["default"].injectDB(db));

        case 19:
          _context.next = 21;
          return regeneratorRuntime.awrap(_playersDAO["default"].insertPlayersBulk(dataArray));

        case 21:
          result = _context.sent;
          clientResolved.close();
          console.log(result ? 'init players done' : 'a problem occured while init players');
          _context.next = 29;
          break;

        case 26:
          _context.prev = 26;
          _context.t0 = _context["catch"](1);
          (0, _common.handleError)(_context.t0);

        case 29:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[1, 26]]);
}

function adjustPrice() {
  var league,
      promiseClient,
      handleLeage,
      promiseGetPlayers,
      _ref2,
      players,
      dataArray,
      client,
      db,
      result,
      _client,
      _args2 = arguments;

  return regeneratorRuntime.async(function adjustPrice$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          league = _args2.length > 0 && _args2[0] !== undefined ? _args2[0] : 'pl';
          _context2.prev = 1;
          promiseClient = _mongodb.MongoClient.connect(process.env.BWNGR_DB_URI, {
            useNewUrlParser: true
          });
          handleLeage = new _getLeagueData["default"](league);
          promiseGetPlayers = handleLeage.getPlayers();
          _context2.next = 7;
          return regeneratorRuntime.awrap(promiseGetPlayers);

        case 7:
          _ref2 = _context2.sent;
          players = _ref2.data.data.players;
          dataArray = Object.values(players).map(function (player) {
            return {
              id_bwngr: player.id,
              price: player.price,
              price_increment: player.priceIncrement
            };
          });
          _context2.next = 12;
          return regeneratorRuntime.awrap(promiseClient);

        case 12:
          client = _context2.sent;
          db = client.db(_common.dbs[league]);
          _context2.next = 16;
          return regeneratorRuntime.awrap(_playersDAO["default"].injectDB(db));

        case 16:
          _context2.next = 18;
          return regeneratorRuntime.awrap(_playersDAO["default"].updatePrice(dataArray));

        case 18:
          result = _context2.sent;
          console.log(result);
          client.close();
          _context2.next = 33;
          break;

        case 23:
          _context2.prev = 23;
          _context2.t0 = _context2["catch"](1);
          _context2.t1 = promiseClient;

          if (!_context2.t1) {
            _context2.next = 30;
            break;
          }

          _context2.next = 29;
          return regeneratorRuntime.awrap(promiseClient);

        case 29:
          _context2.t1 = _context2.sent;

        case 30:
          _client = _context2.t1;
          _client && _client.close();
          (0, _common.handleError)(_context2.t0);

        case 33:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[1, 23]]);
}