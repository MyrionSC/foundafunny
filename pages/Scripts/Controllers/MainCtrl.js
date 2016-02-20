app.controller('MainCtrl', function ($scope, $rootScope, $location, $window, sidebarService, contentService) {
    var s = $scope;
    s.sbs = sidebarService;
    s.cs = contentService;
    s.FrameShow = false;

    var lastMousePosX = 0;
    var lastMousePosY = 0;
    var TimeoutVar = 0;

    // push content in content input field on enter press
    $window.addEventListener("keypress",function(evt) {
        evt = evt || window.event;
        var charCode = evt.keyCode || evt.which;
        var InputEle = document.getElementById("inputBox");

        if (charCode == 13 && document.activeElement == InputEle) {
            var val = InputEle.value;
            if (val != "" && contentService.Page.CurrentContent.content != val) {
                contentService.Page.CurrentContent = s.cs.ConstructContentPackage(val);     // set new value locally
                contentService.PushContentToServer(val);      // push new value to db

                // removes focus and hide frame / input element
                InputEle.blur();
                s.FrameShow = false;
                s.sbs.InputShow = false;

                $rootScope.$broadcast("update-frontpage");
                //$location.path("/");                    // show new value
                //s.$apply(); // TODO: check if necessary
            }
            InputEle.value = "";
        }
    },false);

    var en = 0;
    s.mousemove = function (e) {

        //console.log(e.clientX);
        //console.log(e.clientY);

        s.FrameShow = true;
        if ($location.path() == "/frontpage")
            s.sbs.InputShow = true;
        clearTimeout(TimeoutVar);
        hideTimeout(e, 1500);
    };

    s.StarEnter = function() {
        if (s.cs.Page.CurrentContent.favorite != true) {
            s.cs.setStarToLightYellow();
        }
    };
    s.StarLeave = function() {
        if (s.cs.Page.CurrentContent.favorite != true) {
            s.cs.setStarToDark();
        }
    };
    s.StarClick = function() {
        if (s.cs.Page.CurrentContent.favorite === true) {
            s.cs.setStarToDark();
            s.cs.Page.CurrentContent.favorite = false;
            // todo: print some kind of message
            // remove locally
            s.cs.Page.Favorites.splice(s.cs.Page.Favorites.indexOf(s.cs.Page.CurrentContent.content), 1);
            // remove from favorite in db
            s.cs.MakeContentUnfavorite(s.cs.Page.CurrentContent.content);
        }
        else {
            s.cs.setStarToYellow();
            s.cs.Page.CurrentContent.favorite = true;
            // todo: print some kind of message
            // set locally
            if (s.cs.Page.Favorites.indexOf(s.cs.Page.CurrentContent.content) === -1)
                s.cs.Page.Favorites.unshift(s.cs.Page.CurrentContent.content);
            // add to favorite in db
            s.cs.MakeContentFavorite(s.cs.Page.CurrentContent.content);
        }
    };

    var hideTimeout = function (e, time) {
        TimeoutVar = setTimeout(function () {
            var InputEle = document.getElementById("inputBox");
            if (document.activeElement != InputEle && !s.sbs.OptionsOpen) {
                s.FrameShow = false;
                s.sbs.InputShow = false;
                s.$apply();
            }
            else {
                clearTimeout(TimeoutVar);
                hideTimeout(e, 1000);
            }
        }, time);
    };
});