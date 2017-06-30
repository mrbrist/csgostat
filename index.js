let express = require('express');
let app = express();
let SteamApi = require('steam-api');

let user = new SteamApi.User('43CA0605468900BF447A80689C0B0A8B');
let userStats = new SteamApi.UserStats('43CA0605468900BF447A80689C0B0A8B');
let player = new SteamApi.Player('43CA0605468900BF447A80689C0B0A8B');

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
    response.render('pages/index');
});

// Logic
function getStats(id, response) {
    console.log('Getting stats...');
    player.GetOwnedGames(
        id,
        optionalIncludeAppInfo = false,
        optionalIncludePlayedFreeGames = false,
        optionalAppIdsFilter = [730]
    )
        .done(function(result730){
            if(result730.length > 0){
                user.GetPlayerSummaries(id).done(function(resultSummary){
                    userStats.GetUserStatsForGame(730, id).done(function(resultStats){
                        response.json({'error':false, 'summ':resultSummary, 'stats':resultStats});
                    });
                });
            }else{
                // TODO: Render error page instead of redirecting
                response.json({'error':true});
            }
        });
}

// Stats routes
app.get('/steamcommunity.com/profiles/:id', function(request, response) {
    response.redirect(`/${request.params.id}`);
});
app.get('/http://steamcommunity.com/profiles/:id', function(request, response) {
    response.redirect(`/${request.params.id}`);
});
app.get('/https://steamcommunity.com/profiles/:id', function(request, response) {
    response.redirect(`/${request.params.id}`);
});
app.get('/steamcommunity.com/id/:id', function(request, response) {
    response.redirect(`/${request.params.id}`);
});
app.get('/http://steamcommunity.com/id/:id', function(request, response) {
    response.redirect(`/${request.params.id}`);
});
app.get('/https://steamcommunity.com/id/:id', function(request, response) {
    response.redirect(`/${request.params.id}`);
});
app.get('/:id', function(request, response) {
    response.render('pages/stats');
});
app.post('/:id', function(request, response) {
    // Make all api calls here
    // Convert :id to steamID64 if it isn't already
    if (!request.params.id.match(/^[0-9]{17}$/g)) {
        try {
            user.ResolveVanityUrl(request.params.id).done(function(resultVanity){
                console.log(resultVanity);
                if (resultVanity.match(/^[0-9]{17}$/g)) {
                    // Make api calls with converted vanity id (resultVanity)
                    getStats(resultVanity, response);
                }
                else {
                    // TODO: Render error page instead of redirecting
                    response.json({'error':true});
                }
            });
        }
        catch(err) {
            console.log(err);
            response.redirect('/');
        }
    } else {
        try {
            // Make api calls with steamID64 (request.params.id)
            getStats(request.params.id, response);
        }
        catch(err) {
            // TODO: Render error page instead of redirecting
            response.json({'error':true});
        }
    }
});

// END Routes

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


