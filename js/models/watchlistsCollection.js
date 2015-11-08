define([
    'underscore',
    '../backbone',
    'models/watchlistModel'
], function(_, Backbone, WatchlistModel){
    var WatchlistCollection = Backbone.Collection.extend({
        model: WatchlistModel,
        url: urlServer + '/unsecure/watchlists'
    });

    return WatchlistCollection;
});