"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.insertTeams = insertTeams;

require("core-js/stable");

var _mongodb = require("mongodb");

var _teamsDAO = _interopRequireDefault(require("./teamsDAO"));

var _getLeagueData = _interopRequireDefault(require("../../requests/getLeagueData"));

var _common = require("../../utils/common");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

require("dotenv").config();

function insertTeams() {
  var league,
      promiseClient,
      handleLeage,
      _ref,
      teams,
      dataArray,
      client,
      db,
      result,
      _client,
      _args = arguments;

  return regeneratorRuntime.async(function insertTeams$(_context) {
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
          _context.next = 6;
          return regeneratorRuntime.awrap(handleLeage.getTeams());

        case 6:
          _ref = _context.sent;
          teams = _ref.data.data.teams;
          dataArray = Object.values(teams).map(function (team) {
            return {
              id_bwngr: team.id,
              name: team.name
            };
          });
          _context.next = 11;
          return regeneratorRuntime.awrap(promiseClient);

        case 11:
          client = _context.sent;
          db = client.db(_common.dbs[league]);
          _context.next = 15;
          return regeneratorRuntime.awrap(_teamsDAO["default"].injectDB(db));

        case 15:
          _context.next = 17;
          return regeneratorRuntime.awrap(_teamsDAO["default"].insertTeamsBulk(dataArray));

        case 17:
          result = _context.sent;
          console.log(result);
          client.close();
          _context.next = 32;
          break;

        case 22:
          _context.prev = 22;
          _context.t0 = _context["catch"](1);
          (0, _common.handleError)(_context.t0);
          _context.t1 = promiseClient;

          if (!_context.t1) {
            _context.next = 30;
            break;
          }

          _context.next = 29;
          return regeneratorRuntime.awrap(promiseClient);

        case 29:
          _context.t1 = _context.sent;

        case 30:
          _client = _context.t1;
          _client && _client.close;

        case 32:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[1, 22]]);
}