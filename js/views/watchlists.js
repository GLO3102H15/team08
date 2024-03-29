define([
    'jquery',
    'underscore',
    'backbone',
    '../models/watchlistsCollection',
    'text!../../Templates/watchlists.html',
    '../models/watchlistModel',
    'text!../../Templates/searchResults.html'
], function($, _, Backbone, WatchListCollection, watchlistsTemplate, WatchlistModel, searchResultsTemplate){
    var WatchListsView = Backbone.View.extend({
        el: $('#Page_Container'),
        searchResults: undefined,
        userProfile: undefined,
        models: undefined,

        initialize: function(userProfile) {
            this.userProfile = userProfile;
            this.display();
        },

        display: function() {
            this.collection = new WatchListCollection();
            _this = this;
            this.collection.fetch({
                success: function(collection, array) {
                    _this.models = array;
                    _this.render(collection, array, _this.userProfile.id);
                    _this.collection = collection;
                }
            });
        },

        render: function(collection, array, id) {
            var userWatchlists = array.filter(function(watchlist) {
                return watchlist.owner !== undefined && watchlist.owner.id === id;
            });
            var compiledTemplate = _.template(watchlistsTemplate);
            $('#Page_Container').html( compiledTemplate({ watchlists : userWatchlists }) );
        },

        events: {
            'click #AddWatchlistButton' : 'addWatchList',
            'click .RemoveWatchListButton' : 'removeWatchList',
            'click .ModifyWatchListButton' : 'modifyWatchList',
            'click #searchMoviesButton' : 'searchMovies',
            'click .AddToWatchListButton' : 'addMovieToWatchlist',
            'click .RemoveFromWatchListButton' : 'removeMovieFromWatchList'
        },

        isValidName : function(name) {
            return name !== undefined && name !== '';
        },

        addWatchList: function () {
            var wathchlistNameInputBox = document.getElementById('WathchlistNameInputBox');

            if (wathchlistNameInputBox !== undefined) {
                var watchlistName = wathchlistNameInputBox.value;
                var _this = this;
                if (watchlistName !== undefined && watchlistName !== "") {
                    var name = document.getElementById("user_email");
                    var watchlistModel = new WatchlistModel({ name: watchlistName, owner: name.innerText});
                    var options = {
                        success: function() {
                            _this.display();
                        }
                    };
                    watchlistModel.save(options);
                    this.display();
                }
            }
        },

        removeWatchList: function (ev) {
            var watchListId = $(ev.currentTarget).data('id');

            var _this = this;
            if (watchListId !== undefined) {
                var watchlistModel = new WatchlistModel({ id: watchListId});
                var options = {
                    success: function(model, response) {
                        _this.display();
                    },
                    beforeSend: function(xhr) {
                        xhr.setRequestHeader('Authorization', getCookie());
                    }

                };
                watchlistModel.destroy(options);
            }
        },

        modifyWatchList: function (ev) {
            var watchListId = $(ev.currentTarget).data('id');

            var modelToUpdate = this.collection.get(watchListId);
            var newName = $(ev.currentTarget).prevAll(".watchListName")[0].value;

            var _this = this;
            if (watchListId !== undefined &&
                modelToUpdate !== undefined &&
                this.isValidName(newName)) {

                var data = {
                    "name": newName,
                    id: watchListId,
                    "movies": modelToUpdate.get('movies')
                };

                var options = {
                    success: function(model, response) {
                        _this.display();
                    },
                    beforeSend: function(xhr) {
                        xhr.setRequestHeader('Authorization', getCookie());
                    }
                };
                modelToUpdate.update(data, options);
            }
        },

        searchMovies: function (ev) {
            var query = undefined;
            var queryBox = document.getElementById("searchMoviesInputBox");
            if (queryBox !== undefined && this.isValidName(queryBox.value)) {
                query = queryBox.value;
            }
            if (query !== undefined) {
                $.ajax({
                    url: urlServer + '/search/movies?q=' + encodeURIComponent(query),
                    type: 'GET',
                    success: this.searchMovieSuccess,
                    beforeSend: function(xhr) {
                        xhr.setRequestHeader('Authorization', getCookie());
                    }
                });
            }
        },

        searchMovieSuccess: function(collection) {
            this.searchResults = collection.results;
            var compiledTemplate = _.template(searchResultsTemplate);
            $('#ResultList').html( compiledTemplate({ searchResults : collection.results }) );
        },

        addMovieToWatchlist: function(ev) {
            var currentElement = $(ev.currentTarget);
            var postData = {
                "trackId": currentElement.data('id'),
                "trackName": currentElement.data('name'),
                "releaseDate": currentElement.data('date'),
                "artworkUrl100": currentElement.data('image')
            };

            var selectElement = document.getElementById("watchListIds");
            var watchListId = selectElement.options[ selectElement.selectedIndex ].value;
            var watchlist = this.collection.get(watchListId);
            watchlist.addMovie(postData);
            this.render(undefined, this.collection.toJSON());
        },

        removeMovieFromWatchList: function(ev) {
            var _this = this;
            var watchListId = $(ev.currentTarget).data('watchlist');
            var modelToUpdate = this.collection.get(watchListId);
            var movieId = $(ev.currentTarget).data('id');

            var movies = modelToUpdate.get("movies");
            movies = movies.filter(function(movie) {
                return movie.trackId !== movieId;
            });

            var data = {
                "name": modelToUpdate.get('name'),
                id: watchListId,
                "movies": movies
            };

            var options = {
                success: function(model, response) {
                    _this.display();
                },
                beforeSend: function(xhr) {
                    xhr.setRequestHeader('Authorization', getCookie());
                }
            };
            modelToUpdate.update(data, options);
        }
    });

    return WatchListsView;
});