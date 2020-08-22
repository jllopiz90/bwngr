'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _axios = _interopRequireDefault(require("axios"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

require("dotenv").config();

var leagues = {
  'test': process.env.BWNGR_TEST_LEAGUE,
  'liga': process.env.BWNGR_LEAGUE,
  'pl': process.env.BWNGR_PL_LEAGUE
};
var users = {
  'test': process.env.BWNGR_TEST_USER,
  'liga': process.env.BWNGR_USER,
  'pl': process.env.BWNGR_PL_USER
};

var GetLeageData =
/*#__PURE__*/
function () {
  function GetLeageData() {
    var league = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'pl';

    _classCallCheck(this, GetLeageData);

    var leagueHeader = leagues[league];
    var userHeader = users[league];
    this.league = league;
    this.leagueHeader = leagueHeader;
    this.client = _axios["default"].create({
      baseURL: 'http://biwenger.as.com/api/v2',
      timeout: 10000,
      headers: {
        authorization: process.env.BWNGR_BEARER,
        'content-type': 'application/json; charset=utf-8',
        'accept': 'application/json, text/plain, */*',
        'X-version': '611',
        'X-league': leagueHeader,
        'X-user': userHeader,
        'X-lang': 'es'
      }
    });
  }

  _createClass(GetLeageData, [{
    key: "getManagers",
    value: function getManagers() {
      return regeneratorRuntime.async(function getManagers$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              return _context.abrupt("return", this.client.get('/league', {
                params: {
                  fields: 'standings'
                }
              }));

            case 1:
            case "end":
              return _context.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "getPlayers",
    value: function getPlayers() {
      var uri, players;
      return regeneratorRuntime.async(function getPlayers$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              uri = this.league === 'pl' ? '/competitions/premier-league/data' : '/competitions/la-liga/data';
              players = this.client.get(uri, {
                params: {
                  lang: 'es',
                  score: '1'
                }
              });
              return _context2.abrupt("return", players);

            case 3:
            case "end":
              return _context2.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "getTeams",
    value: function getTeams() {
      var uri;
      return regeneratorRuntime.async(function getTeams$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              uri = this.league === 'pl' ? '/competitions/premier-league/data' : '/competitions/la-liga/data';
              return _context3.abrupt("return", this.client.get(uri, {
                params: {
                  lang: 'es',
                  score: '1'
                }
              }));

            case 2:
            case "end":
              return _context3.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "getTransactions",
    value: function getTransactions(offSet, limit) {
      var uri;
      return regeneratorRuntime.async(function getTransactions$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              uri = "/league/".concat(this.leagueHeader, "/board?");
              return _context4.abrupt("return", this.client.get(uri, {
                params: {
                  type: 'transfer,market,exchange,loan,loanReturn,clauseIncrement,auctions,adminTransfer',
                  offset: offSet,
                  limit: limit
                }
              }));

            case 2:
            case "end":
              return _context4.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "getCurrentMarket",
    value: function getCurrentMarket() {
      var uri;
      return regeneratorRuntime.async(function getCurrentMarket$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.prev = 0;
              uri = 'market';
              return _context5.abrupt("return", this.client.get(uri));

            case 5:
              _context5.prev = 5;
              _context5.t0 = _context5["catch"](0);
              console.error("Error ocurred while getting market.Error--".concat(String(_context5.t0)));

            case 8:
              return _context5.abrupt("return", false);

            case 9:
            case "end":
              return _context5.stop();
          }
        }
      }, null, this, [[0, 5]]);
    }
  }, {
    key: "getLeagueInfo",
    value: function getLeagueInfo() {
      var uri;
      return regeneratorRuntime.async(function getLeagueInfo$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              uri = this.league === 'pl' ? '/competitions/premier-league/data' : '/competitions/la-liga/data';
              return _context6.abrupt("return", this.client.get(uri, {
                params: {
                  lang: 'es',
                  score: '1'
                }
              }));

            case 2:
            case "end":
              return _context6.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "getRecentRounds",
    value: function getRecentRounds() {
      var offSet,
          limit,
          uri,
          _args7 = arguments;
      return regeneratorRuntime.async(function getRecentRounds$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              offSet = _args7.length > 0 && _args7[0] !== undefined ? _args7[0] : 0;
              limit = _args7.length > 1 && _args7[1] !== undefined ? _args7[1] : 1;
              uri = "league/".concat(this.leagueHeader, "/board");
              return _context7.abrupt("return", this.client.get(uri, {
                params: {
                  type: 'roundFinished',
                  offset: offSet,
                  limit: limit
                }
              }));

            case 4:
            case "end":
              return _context7.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "getBonus",
    value: function getBonus() {
      var offSet,
          limit,
          uri,
          _args8 = arguments;
      return regeneratorRuntime.async(function getBonus$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              offSet = _args8.length > 0 && _args8[0] !== undefined ? _args8[0] : 0;
              limit = _args8.length > 1 && _args8[1] !== undefined ? _args8[1] : 11;
              uri = "league/".concat(this.leagueHeader, "/board");
              return _context8.abrupt("return", this.client.get(uri, {
                params: {
                  type: 'bonus',
                  offset: offSet,
                  limit: limit
                }
              }));

            case 4:
            case "end":
              return _context8.stop();
          }
        }
      }, null, this);
    }
  }]);

  return GetLeageData;
}();

exports["default"] = GetLeageData;