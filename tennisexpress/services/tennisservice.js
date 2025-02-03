
// Require these libraries
var jsonQuery = require('json-query');
JSON.truncate = require('json-truncate')

// BETS API url

const UPCOMING = "https://api.b365api.com/v3/events/upcoming?sport_id=13&token=212610-grkv7alAClZ83h";
const INPLAY = "https://api.b365api.com/v3/events/inplay?sport_id=13&token=212610-grkv7alAClZ83h";

var requestOptions = {
    method: 'GET',
    redirect: 'follow',
    headers: myHeaders
};

// BETSAPI Sports ID for TENNIS

const SPORTSID = 13;

// headers
var myHeaders = new Headers();
// Headers for the GET request
myHeaders.append("token", "212610-grkv7alAClZ83h");

var groupBy = function (xs, key) {
    return xs.reduce(function (rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
    }, {});
};

function compareFn(a, b) {

    var l1 = parseInt(a["leagueid"]);
    var l2 = parseInt(b["leagueid"]);

    if (l1 < l2) {        
        return -1;
    } else if (l1 > l2) {        
        return 1;
    }
    return 0;
}

function addJsonLine(result, arr)
{
    var moment = require('moment');
    var timestamp = parseInt(result.time);
    var momentStyle = moment.unix(timestamp);
    
    var leagueid = result.league.id;
    var time = moment(momentStyle).local().format('LLLL');
    var tournament = result.league.name.split(" ").join("");
    var player1 = result.home.name;
    var player2 = result.away.name;

    arr.push({
        leagueid: leagueid,
        time: time,
        tournament: tournament,
        player1: player1,
        player2: player2
    });
}

async function getData(url, id) {
        
    var jsonArray = [];
    var groupJson = [];
   
    try
    {
        const response = await fetch(url, requestOptions);

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }        

        const data = await response.json();

        if (data) {
            var r1 = jsonQuery('results', {
                data: JSON.truncate(data, 10)
            });

            for (i = 0; i < r1.value.length; i++) {

                var result = r1.value[i];

                var tournament = result.league.name.split(" ").join("");

                if (!tournament.endsWith("MD") && !tournament.endsWith("WD") && !tournament.startsWith("ITF")) {

                    addJsonLine(result, jsonArray);
                }
            }
        }
    }

    catch (error) {
        console.error(error.message);
    }

    if (jsonArray) {
        jsonArray = jsonArray.sort(compareFn);
        groupJson = groupBy(jsonArray, 'tournament');
    }

    return groupJson;
};

class TennisService {
    constructor() {
        this.getTournaments = this.getTournaments.bind(this);
    }

    async getTournaments() {

        return new Promise((resolve) => {

            var url = INPLAY;
            var events = getData(url, SPORTSID); // tennis sportsId is 13
            resolve(events);
        });
    }
}

module.exports = new TennisService();
