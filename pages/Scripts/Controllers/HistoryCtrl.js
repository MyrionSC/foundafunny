app.controller('HistoryCtrl', function($scope, $location, $window, sidebarService, contentService) {
    var s = $scope, l = $location;
    var optionobj = sidebarService.vhInfoObj;

    var pageWidth = $window.innerWidth;
    s.ContainerWidth = pageWidth - 200 + "px";
    s.ContentWidth = pageWidth - 500 + "px";

    s.ShowHistoryList = false;
    s.skip = 0;
    s.limit = 0;
    s.endIndex = 0;

    s.GetNewerBtn = new NavBtn();
    s.GetOlderBtn = new NavBtn();

    optionobj.SetSelected();

    var params = l.search();
    if (params.skip != undefined)
        s.skip = parseInt(params.skip);
    else
        l.search('skip', 0);

    // calculate limit by page size
    s.limit = 10; //todo: calculate it

    s.HistoryArray = [];

    s.GetHistory = function (skip, limit) {
        skip = parseInt(skip);
        s.ShowHistoryList = false;
        contentService.GetHistory(function (content) {
            s.HistoryArray = content;

            // set favorite star color
            for (var i = 0; i < s.HistoryArray.length; i++) {
                var item = s.HistoryArray[i];
                item.favorite === true ? item.StarColor = "pages/Pics/FavoriteStarYellow.png" :
                    item.StarColor = "pages/Pics/FavoriteStarDark.png";
                item.ArrowColor = "pages/Pics/SmallArrowGrey.png";
                item.TitelText = item.favorite === true ? "Unfavorite this content" :
                    "Make this content favorite";
            }

            if (s.HistoryArray.length < limit)
                s.GetOlderBtn.SetLightGrey();
            else
                s.GetOlderBtn.SetLightGreen();

            if (skip == 0)
                s.GetNewerBtn.SetLightGrey();
            else
                s.GetNewerBtn.SetLightGreen();

            s.endIndex = skip + s.HistoryArray.length;
            s.ShowHistoryList = true;
        }, skip, limit);
    };

    s.GetNewer = function () {
        if (!s.GetNewerBtn.IsLightGrey()) {
            if (s.skip > s.limit) {
                l.search('skip', s.skip - s.limit);
                s.skip = s.skip - s.limit;
                s.GetHistory(s.skip, s.limit);
            }
            else {
                l.search('skip', 0);
                s.skip = 0;
                s.GetHistory(s.skip, s.limit);
            }
        }
    };
    s.GetOlder = function () {
        if (!s.GetOlderBtn.IsLightGrey()) {
            l.search('skip', s.skip + s.limit);
            s.skip = s.skip + s.limit;
            s.GetHistory(s.skip, s.limit);
        }
    };

    s.NavBtnMouseIn = function (btn) {
        if (!btn.IsLightGrey()) {
            btn.SetGreen();
        }
    };
    s.NavBtnMouseOut = function (btn) {
        if (btn.IsGreen()) {
            btn.SetLightGreen();
        }
    };

    // init
    s.GetHistory(s.skip, s.limit);

    s.$on('$destroy', function () {
        //$location.search({}); // sets url parameters to null
        // todo: this fucks with datetimepicker in settimer if you switch from history to settimer
    });

    s.$on('update-history', function () {
        s.GetHistory(s.skip, s.limit);
    });

    $scope.$watch(function(){
        return $window.innerWidth;
    }, function(value) {
        var pageWidth = $window.innerWidth;
        s.ContainerWidth = pageWidth - 200 + "px";
        s.ContentWidth = pageWidth - 500 + "px";
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
        if (item.favorite != true) {
            setHistoryStarToLightYellow(item);
        }
    };
    s.HistoryStarLeave = function(item) {
        if (item.favorite != true) {
            setHistoryStarToDark(item);
        }
    };
    s.HistoryStarClick = function(item) {
        if (item.favorite != true) {
            // set other star colors locally
            for (var i = 0; i < s.HistoryArray.length; i++) {
                var arrayitem = s.HistoryArray[i];
                if (item.content === arrayitem.content) {
                    setHistoryStarToYellow(arrayitem);
                    arrayitem.favorite = true;
                    arrayitem.TitelText = "Unfavorite this content";
                }
            }
            // set current content if applicable
            if (s.cs.Page.CurrentContent.content === item.content) {
                s.cs.Page.CurrentContent.favorite = true;
                s.cs.SetStarFavorite();
            }
            // set locally
            if (s.cs.Page.Favorites.indexOf(item.content) === -1)
                s.cs.Page.Favorites.unshift(item.content);
            // notify server
            s.cs.MakeContentFavorite(item.content);
        }
        else {
            setHistoryStarToDark(item);
            // set other star colors locally
            for (var i = 0; i < s.HistoryArray.length; i++) {
                var arrayitem = s.HistoryArray[i];
                if (item.content === arrayitem.content) {
                    setHistoryStarToDark(arrayitem);
                    arrayitem.favorite = false;
                    arrayitem.TitelText = "Make this content favorite";
                }
            }
            // set current content if applicable
            if (s.cs.Page.CurrentContent.content === item.content) {
                s.cs.Page.CurrentContent.favorite = false;
                s.cs.SetStarUnFavorite();
            }
            // delete locally
            s.cs.Page.Favorites.splice(s.cs.Page.Favorites.indexOf(item.content), 1);
            // notify server
            s.cs.MakeContentUnfavorite(item.content);
        }
    };
});

var setHistoryStarToYellow = function(item) {
    item.StarColor = "pages/Pics/FavoriteStarYellow.png";
};
var setHistoryStarToLightYellow = function(item) {
    item.StarColor = "pages/Pics/FavoriteStarLightYellow.png";
};
var setHistoryStarToDark = function(item) {
    item.StarColor = "pages/Pics/FavoriteStarDark.png";
};

var NavBtn = function () {
    var lightgreenrgb = "rgb(144, 238, 144)";
    var lightgreyrgb = "rgb(184, 184, 184)";
    var greenrgb = "rgb(80, 255, 80)";

    this.Color = lightgreenrgb;

    this.SetLightGreen = function () {
        this.Color = lightgreenrgb;
    };
    this.SetLightGrey = function () {
        this.Color = lightgreyrgb;
    };
    this.SetGreen = function () {
        this.Color = greenrgb;
    };

    this.IsLightGreen = function () {
        return this.Color == lightgreenrgb;
    };
    this.IsLightGrey = function () {
        return this.Color == lightgreyrgb;
    };
    this.IsGreen = function () {
        return this.Color == greenrgb;
    };
};