define([
    'jquery',
    'underscore',
    'backbone',
    'text!../../Templates/Search.html',
    'text!../../Templates/MoviesSearchResults.html',
    'text!../../Templates/SeriesSearchResults.html',
    'text!../../Templates/ActorsSearchResults.html',
    'text!../../Templates/UsersSearchResults.html',
    'text!../../Templates/NoResults.html'
], function($, _, Backbone, searchTemplate, MoviesTemplate, SeriesTemplate, ActorsTemplate, UsersTemplate, NoResultsTemplate){
    var SearchView = Backbone.View.extend({
        el: $('#Page_Container'),

        initialize: function() {
            this.render();
        },

        render: function() {
            var compiledTemplate = _.template(searchTemplate);
            this.$el.html( compiledTemplate({}) );
        },

        events: {
            'click #searchbutton' : 'search'
        },

        getSearchBoxContent: function() {
            var searchBox = document.getElementById("searchbox");
            return searchBox.value;
        },

        search: function() {
            var query = this.getSearchBoxContent();

            var query = encodeURIComponent(query);
            var token = this.getCookie('umovie_access_token');
            this.Reset();
            this.searchMovies(query, token);
            this.searchSeries(query, token);
            this.searchActors(query, token);
            this.searchUsers(query, token);
        },

        Reset: function() {
            document.getElementById('MoviesResultsPlaceholder').innerHTML = "";
            document.getElementById('SeriesResultsPlaceholder').innerHTML = "";
            document.getElementById('ActorsResultsPlaceholder').innerHTML = "";
            document.getElementById('UsersResultsPlaceholder').innerHTML = "";
        },

        searchMovies: function(query, token) {
            if (this.canQuery("MoviesCheckBox")) {
                this.launchquery(ServerUrl + '/search/movies?limit=5&q=' + query,
                                token,
                                this.displayMovies,
                                this.failureMovies);
            }
        },

        searchSeries: function(query, token) {
            if (this.canQuery("SeriesCheckBox")) {
                this.launchquery(ServerUrl + '/search/tvshows/episodes?limit=5&q=' + query,
                                token,
                                this.displaySeries,
                                this.failureSeries);
            }
        },

        searchActors: function(query, token) {
            if (this.canQuery("ActorsCheckBox")) {
                this.launchquery(ServerUrl + '/search/actors?q=' + query,
                                token,
                                this.displayActors,
                                this.failureActors);
            }
        },

        searchUsers: function(query, token) {
            if (this.canQuery("UsersCheckBox")) {
                this.launchquery(ServerUrl + '/search/users?q=' + query,
                                token,
                                this.displayUsers,
                                this.failureUsers);
            }
        },

        canQuery: function(controlId) {
            var checkbox = document.getElementById(controlId);
            return checkbox.checked;
        },

        launchquery: function(uri, token, onSuccess, onFailure) {
            $.ajax({
                type: "GET",
                url: uri,
                success: onSuccess,
                statusCode: {
                    401: this.redirect
                },
                failure: onFailure,
                beforeSend: function(xhr) {
                    xhr.setRequestHeader('Authorization', token);
                }
            });
        },

        redirect: function() {
            window.location.href = "./Login.html";
        },

        displayMovies: function(data, status) {
            if (data.resultCount === 0) {
                var template = _.template(NoResultsTemplate);
                document.getElementById('MoviesResultsPlaceholder').innerHTML = template({ data : "Movies" });
            } else {
                var compiledTemplate = _.template(MoviesTemplate);
                $('#MoviesResultsPlaceholder').html(compiledTemplate({movies: data.results}));
            }
        },

        displaySeries: function(data, status) {
            if (data.resultCount === 0) {
                var template = _.template(NoResultsTemplate);
                document.getElementById('SeriesResultsPlaceholder').innerHTML = template({ data : "Series" });
            } else {
                var compiledTemplate = _.template(SeriesTemplate);
                $('#SeriesResultsPlaceholder').html(compiledTemplate({series: data.results}));
            }
        },

        displayActors: function(data, status) {
            if (data.resultCount === 0) {
                var template = _.template(NoResultsTemplate);
                document.getElementById('ActorsResultsPlaceholder').innerHTML = template({ data : "Actors" });
            } else {
                var compiledTemplate = _.template(ActorsTemplate);
                $('#ActorsResultsPlaceholder').html(compiledTemplate({actors: data.results}));
            }
        },

        displayUsers: function(data, status) {
            if (data.resultCount === 0) {
                var template = _.template(NoResultsTemplate);
                document.getElementById('UsersResultsPlaceholder').innerHTML = template({ data : "Users" });
            } else {
                var compiledTemplate = _.template(UsersTemplate);
                $('#UsersResultsPlaceholder').html(compiledTemplate({users: data.results}));
            }
        },

        failureMovies: function(data, status) {

        },

        failureSeries: function(data, status) {

        },

        failureActors: function(data, status) {

        },

        failureUsers: function(data, status) {

        },

        getCookie: function(cname) {
            var name = cname + "=";
            var ca = document.cookie.split(';');
            for(var i=0; i<ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0)==' ') c = c.substring(1);
                if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
            }
            return "";
        }
    });

    return SearchView;
});