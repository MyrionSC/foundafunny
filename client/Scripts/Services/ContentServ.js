app.service('contentService', function ($http, $rootScope, $location) {
    var that = this;
    //var url = 'https://sdm-backend.herokuapp.com';
    var url = 'http://localhost:5000'; // when testing

    this.FavoriteStarColor = "Pics/FavoriteStarDark.png";
    this.FavoriteStarTitel = "Set current content as favorite";
    this.Page = {
        name: "",
        CurrentContent: {
            content: "",
            date: "",
            favorite: false
        },
        ContentArray: [],
        Favorites: [],
        Settings: {
            bg_color: "", // TODO: add some youtube settings and such later
            Timezone: "",
            TimeDiff: 0
        },
        Timers: []
    };

    // ----------|
    // SOCKET.IO |
    // ----------|

    var socket = io.connect(url);

    // incoming
    socket.on('pageinit', function (page) {
        console.log("page init received:");
        console.log(page);

        // update local page
        that.Page = page;
        that.Page.CurrentContent = page.ContentArray[0];

        // update views with new data
        $rootScope.$broadcast("update-frontpage"); // for updating frontpage view
        $rootScope.$broadcast("update-set-timer"); // for updating set timer view
        $rootScope.$broadcast("update-favorites"); // for updating set timer view
    });
    socket.on('contentupdate', function (data) {
        console.log("content updated:");
        console.log(data);
        that.Page.CurrentContent = data;
        $rootScope.$broadcast("update-frontpage"); // for updating frontpage view
        $rootScope.$broadcast("update-history"); // for updating history view
    });
    socket.on('timerfire', function(data) {
        console.log("timerfire registered");
        console.log(data);
        that.Page.CurrentContent = data;

        $rootScope.$broadcast("update-frontpage"); // for updating frontpage view
        $rootScope.$broadcast("update-history"); // for updating history view
        $rootScope.$broadcast("update-timers"); // for updating timers view
    });
    socket.on('timerupdate', function() {
        console.log("timerupdate registered");

        $rootScope.$broadcast("update-timers"); // for updating timers view
    });
    socket.on('favoriteupdate', function(data) {
        console.log("favoriteupdate registered");
        console.log(data);

        that.Page.Favorites.unshift(data);
        if (that.Page.CurrentContent.content === data) {
            that.Page.CurrentContent.favorite = true;
            that.SetStarFavorite();
        }

        $rootScope.$broadcast("update-frontpage"); // for updating timers view
        $rootScope.$broadcast("update-history"); // for updating timers view
        $rootScope.$broadcast("update-favorites"); // for updating timers view
    });
    socket.on('unfavoriteupdate', function(data) {
        console.log("unfavoriteupdate registered");
        console.log(data);

        that.Page.Favorites.splice(that.Page.Favorites.indexOf(data), 1);
        if (that.Page.CurrentContent.content === data) {
            that.Page.CurrentContent.favorite = false;
            that.SetStarUnFavorite();
        }

        $rootScope.$broadcast("update-frontpage"); // for updating timers view
        $rootScope.$broadcast("update-history"); // for updating timers view
        $rootScope.$broadcast("update-favorites"); // for updating timers view
    });

    // outgoing
    this.PushContentToServer = function (content) {
        console.log("Pushing contentpackage to server:");
        console.log(content);
        socket.emit('pushcontent', content);
    };
    this.PushNewTimerToServer = function (newtimer) {
        console.log("Pushing new timer to server:");
        console.log(newtimer);
        socket.emit('savetimer', newtimer);
    };
    this.PushTimerDeleteToServer = function (timer) {
        console.log("Deleting timer from server:");
        console.log(timer);
        socket.emit('deletetimer', timer);
    };
    this.MakeContentFavorite = function(content) {
        console.log("Making content favorite:");
        console.log(content);
        socket.emit('favoritecontent', content);
    };
    this.MakeContentUnfavorite = function(content) {
        console.log("Making content unfavorite:");
        console.log(content);
        socket.emit('unfavoritecontent', content);
    };


    // -----|
    // HTTP |
    // -----|

    this.GetHistory = function(callback, skip, limit) {
        $http.get(url + '/get/history?skip=' + skip + '&limit=' + limit).
            success(function(data) {
                callback(data);
            }).
            error(function(data, status, headers, config) {
                console.log("error: " + data + ", " + status + ", " + headers + ", " + config);
                callback("Error reaching database");
            }
        );
    };

    this.GetFavorites = function(callback, skip, limit) {
        $http.get(url + '/get/history?skip=' + skip + '&limit=' + limit).// todo: actually get favorites, not history
            success(function(data) {
                callback(data);
            }).
            error(function(data, status, headers, config) {
                console.log("error: " + data + ", " + status + ", " + headers + ", " + config);
                callback("Error reaching database");
            }
        );
    };

    this.GetTimers = function(callback) {
        $http.get(url + '/get/timers').
            success(function(data) {
                callback(data);
            }).
            error(function(data, status, headers, config) {
                console.log("error: " + data + ", " + status + ", " + headers + ", " + config);
                callback("Error reaching database");
            }
        );
    };

    // ---------------- |
    // HELPER FUNCTIONS |
    // ---------------- |

    this.SetStarFavorite = function() {
        this.setStarToYellow();
        this.FavoriteStarTitel = "Revert current content to unfavorite";
    };
    this.SetStarUnFavorite = function() {
        this.setStarToDark();
        this.FavoriteStarTitel = "Set current content as favorite";
    };

    this.setStarToYellow = function() {
        that.FavoriteStarColor = "Pics/FavoriteStarYellow.png";
    };
    this.setStarToLightYellow = function() {
        that.FavoriteStarColor = "Pics/FavoriteStarLightYellow.png";
    };
    this.setStarToDark = function() {
        that.FavoriteStarColor = "Pics/FavoriteStarDark.png";
    };

    this.ConstructContentPackage = function(input) {
        var d = new Date(Date.now() + this.Page.Settings.TimeDiff * 60000);
        return {
            content: input,
            date: ConstructReadableDateString(d),
            favorite: ExistingFavorite(input)
        };
    };
    var ExistingFavorite = function(content) {
        if (that.Page.Favorites.indexOf(content) != -1)
            return true;
        return false;
    };
    var ConstructReadableDateString = function (date) {
        var hours = date.getUTCHours().toString().length === 1 ? "0" + date.getUTCHours() : date.getUTCHours();
        var minutes = date.getUTCMinutes().toString().length === 1 ? "0" + date.getUTCMinutes() : date.getUTCMinutes();
        var seconds = date.getUTCSeconds().toString().length === 1 ? "0" + date.getUTCSeconds() : date.getUTCSeconds();
        return date.getUTCDate() + "/" + (date.getUTCMonth() + 1) + "/" + date.getUTCFullYear() + " "
            + hours + ":" + minutes + ":" + seconds;
    };
});