app.controller('FavoriteCtrl', function($scope, $location, $document, sidebarService, contentService) {
    var s = $scope, l = $location;
    var optionobj = sidebarService.faInfoObj;

    s.FavoriteArray = [];
    s.FavListMaxHeight = $document[0].body.clientHeight - 200 + "px";
    s.ShowFavoriteList = false;

    optionobj.SetSelected();

    var PrepareFavorites = function() {
        s.FavoriteArray = [];
        for (var i = 0; i < s.cs.Page.Favorites.length; i++) {
            s.FavoriteArray.push(new FavObj(s.cs.Page.Favorites[i]));
        }
    };
    var UpdateView = function() {
        s.ShowFavoriteList = s.FavoriteArray.length > 0;
    };

    // init
    PrepareFavorites();
    UpdateView();


    s.$on('update-favorites', function () {
        PrepareFavorites();
        UpdateView();
        s.$apply();
    });

    s.SetInputEnter = function(item) {
        item.ArrowColor = "pages/Pics/SmallArrowBlack.png";
    };
    s.SetInputLeave = function(item) {
        item.ArrowColor = "pages/Pics/SmallArrowGrey.png";
    };
    s.SetInputClick = function (item) {
        if (s.cs.Page.CurrentContent.content != item.content) {
            s.cs.Page.CurrentContent = s.cs.ConstructContentPackage(item.content);

            if (s.cs.Page.CurrentContent.favorite === true)
                s.cs.SetStarFavorite();
            else
                s.cs.SetStarUnFavorite();

            s.cs.PushContentToServer(item.content);
            l.path('/'); // sends the user to redirecter -> frontpage
        }
        else
            l.path('/');
    };

    s.HistoryStarEnter = function(item) {
        item.StarColor = "pages/Pics/FavoriteStarDark.png";
    };
    s.HistoryStarLeave = function(item) {
        item.StarColor = "pages/Pics/FavoriteStarYellow.png";
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
        UpdateView();
        // notify server
        s.cs.MakeContentUnfavorite(item.content);
    };
});

var FavObj = function(Content) {
    this.content = Content;
    this.StarColor = "pages/Pics/FavoriteStarYellow.png";
    this.ArrowColor = "pages/Pics/SmallArrowGrey.png";
};

var contentSearch = function(array, value) {
    for (var i = 0; i < array.length; i++) {
        var obj = array[i];
        if (obj.content === value) {
            return i;
        }
    }
};