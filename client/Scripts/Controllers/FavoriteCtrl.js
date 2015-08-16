app.controller('FavoriteCtrl', function($scope, $location, sidebarService, contentService) {
    var s = $scope, l = $location;
    var optionobj = sidebarService.faInfoObj;

    s.FavoriteArray = [];

    optionobj.SetSelected();

    var PrepareFavorites = function() {
        s.FavoriteArray = [];
        for (var i = 0; i < s.cs.Page.Favorites.length; i++) {
            s.FavoriteArray.push(new FavObj(s.cs.Page.Favorites[i]));
        }
    };

    // init
    PrepareFavorites();

    s.$on('update-favorites', function () {
        PrepareFavorites();
    });

    s.SetInputEnter = function(item) {
        item.ArrowColor = "Pics/SmallArrowBlack.png";
    };
    s.SetInputLeave = function(item) {
        item.ArrowColor = "Pics/SmallArrowGrey.png";
    };
    s.SetInputClick = function (item) {
        if (contentService.Page.CurrentContent.content != item.content) {
            contentService.Page.CurrentContent = s.cs.ConstructContentPackage(item.content);
            contentService.PushContentToServer(item.content);
            l.path('/'); // sends the user to redirecter -> frontpage
        }
        else
            l.path('/');
    };

    s.HistoryStarEnter = function(item) {
        item.StarColor = "Pics/FavoriteStarDark.png";
    };
    s.HistoryStarLeave = function(item) {
        item.StarColor = "Pics/FavoriteStarYellow.png";
    };
    s.HistoryStarClick = function(item) {
        // update current content if applicable
        if (s.cs.Page.CurrentContent.content === item.content) {
            s.cs.Page.CurrentContent.favorite = false;
            s.cs.SetStarUnFavorite();
        }
        // delete locally
        s.FavoriteArray.splice(contentSearch(s.FavoriteArray, item.content), 1);
        s.cs.Page.Favorites.splice(s.cs.Page.Favorites.indexOf(item.content), 1);
        // notify server
        s.cs.MakeContentUnfavorite(item.content);
    };
});

var FavObj = function(Content) {
    this.content = Content;
    this.StarColor = "Pics/FavoriteStarYellow.png";
    this.ArrowColor = "Pics/SmallArrowGrey.png";
};

var contentSearch = function(array, value) {
    for (var i = 0; i < array.length; i++) {
        var obj = array[i];
        if (obj.content === value) {
            return i;
        }
    }
};