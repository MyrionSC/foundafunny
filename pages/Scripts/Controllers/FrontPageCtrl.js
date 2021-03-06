app.controller('FrontPageCtrl', function($scope, $window, $location, $sce, $document, sidebarService, contentService) {
    var s = $scope;
    s.cs = contentService;
    var optionobj = sidebarService.fpInfoObj;
    s.finalHeight = "";
    s.finalWidth = "";
    s.resizeReady = false;
    s.videoUrl = ""; // used by video
    var width = $document[0].body.clientWidth - 100;
    s.paraWidth = width + "px"; // used by text
    s.resolvedContent = "";
    s.templates =
        [ { name: 'Loading', url: 'pages/View/Frontpage-Templates/LoadingTemp.html'},
        { name: 'Text', url: 'pages/View/Frontpage-Templates/TextTemp.html'},
        { name: 'Image', url: 'pages/View/Frontpage-Templates/ImageTemp.html'},
        { name: 'Video', url: 'pages/View/Frontpage-Templates/VideoTemp.html'},
        { name: 'Youtube', url: 'pages/View/Frontpage-Templates/YoutubeTemp.html'},
        { name: 'ResolvedImg', url: 'pages/View/Frontpage-Templates/ResolvedImageTemp.html'},
        { name: 'Twitch', url: 'pages/View/Frontpage-Templates/TwitchTemp.html'}
        ];
    s.template = s.templates[0];

    // from image resolver library, extracts img urls from some large image sharing pages
    var resolver = new ImageResolver( {});
    resolver.register(new ImageResolver.FileExtension());
    resolver.register(new ImageResolver.NineGag());
    resolver.register(new ImageResolver.Instagram());
    resolver.register(new ImageResolver.ImgurPage());
    resolver.register(new ImageResolver.MimeType());
    resolver.register(new ImageResolver.Opengraph());
    resolver.register(new ImageResolver.Webpage());

    // set frontpage option as selected in sidebar
    sidebarService.setOption(optionobj);

    // ----------------|
    // Event listeners |
    // ----------------|

    s.$on('update-frontpage', function () {
        s.cs.Page.CurrentContent.favorite === true ? s.cs.SetStarFavorite() :
            s.cs.SetStarUnFavorite();

        // resetting templates to prepare for new content
        s.template = s.templates[0];
        s.$apply();
        Navigate(s.cs.Page.CurrentContent.content);
        s.$apply();
    });
    s.$on('$includeContentLoaded', function(){ // is emitted when templates switch, in Navigate function
        switch (s.template.name) {
            case "Video":
                // ensures that video can be played according to sce restriction
                s.videoUrl = $sce.trustAsResourceUrl(s.cs.Page.CurrentContent.content);
                break;
            case "Youtube":
                s.resizeReady = true;

                var YTvideoURL = "";
                var str = s.cs.Page.CurrentContent.content;

                // extracts the video id from player
                var VideoID = "";
                if (str.match(/www\.Youtube\.com/i)!= null)
                    VideoID = (str.match(/watch\?v=([^&?]+)/i) || [" ", "dQw4w9WgXcQ"])[1];
                else
                    VideoID = (str.match(/youtu\.be\/([^&?]+)/i) || [" ", "dQw4w9WgXcQ"])[1];

                var PlayListID = (str.match(/list=([^&?]+)/i) || [" ", null])[1];
                var VideoStartTime = (str.match(/t=([^&?]+)/i) || [" ", null])[1];

                // construct youtube video URL
                YTvideoURL = "https://www.youtube.com/embed/" + VideoID + "?autoplay=true";
                if (PlayListID != null) YTvideoURL += "&loop=1&listType=playlist&list=" + PlayListID;
                if (VideoStartTime != null) YTvideoURL += "&start=" + StartTimeInSec(VideoStartTime);

                console.log("new youtube video url: " + YTvideoURL);
                s.videoUrl=$sce.trustAsResourceUrl(YTvideoURL);

                // also sets height and width to almost screensize while we're at it
                var w = $document[0].body.clientWidth - 25,
                    h = $document[0].body.clientHeight - 25;
                s.finalWidth = w + "px";
                s.finalHeight = h + "px";
                break;
            case "Twitch":
                s.resizeReady = true;

                var str = s.cs.Page.CurrentContent.content;
                var TwitchVideoURL = (str.match(/twitch\.tv\/([a-zA-Z0-9_]+)/i) || [" ", "bobross"])[1];
                s.videoUrl = $sce.trustAsResourceUrl("http://player.twitch.tv/?channel=" + TwitchVideoURL);

                // sets height and width to almost screensize
                var w = $document[0].body.clientWidth - 25,
                    h = $document[0].body.clientHeight - 25;
                s.finalWidth = w + "px";
                s.finalHeight = h + "px";
                break;
        }
    });




    // -----------------|
    // Helper functions |
    // -----------------|

    // used by image and video to fill screen correctly
    $scope.calcAndApplyDimensions = function (initHeight, initWidth) {
        var bodyDim = $document[0].body.clientHeight / $document[0].body.clientWidth;
        var imgDim = initHeight / initWidth;

        if (bodyDim > imgDim) {
            var w = $document[0].body.clientWidth;
            s.finalWidth = w + "px";
        }
        else {
            var h = $document[0].body.clientHeight;
            s.finalHeight = h + "px";
        }

        $scope.$apply();
    };

    // navigates to correct view template
    var Navigate = function (str) {
        if (CheckYoutubeUrl(str)) {
            s.template = s.templates[4];
        }
        else if (CheckTwitchUrl(str)) {
            s.template = s.templates[6];
        }
        else if (CheckResolvedImageUrl(str)) {
            s.template = s.templates[0];
            resolver.resolve( str, function( result ){
                if ( result ) {
                    console.log(result.image);
                    s.resolvedContent = result.image;
                    s.template = s.templates[5];
                } else {
                    s.template = s.templates[1];
                }
            });
        }
        else if (CheckImgUrl(str)) {
            s.template = s.templates[2];
        }
        else if (CheckVideoUrl(str)) {
            s.template = s.templates[3];
        }
        else {
            s.template = s.templates[1];
        }
    };
    var CheckImgUrl = function (url) {
        return url.match(/\.(jpeg|jpg|gif|gifv|png)$/) != null;
    };
    var CheckVideoUrl = function (url) {
        return url.match(/\.(webm|mp4)$/) != null;
    };
    var CheckYoutubeUrl = function (url) {
        return url.match(/www\.youtube\.com/i)!= null ||
        url.match(/youtu\.be/i)!= null;
    };
    var CheckResolvedImageUrl = function (url) {
        return url.match(/imgur\.com/i)!= null;
        // todo: add more sources like 9gag, flicr
    };
    var CheckTwitchUrl = function (url) {
        return url.match(/www\.twitch\.tv/i)!= null;
    };

    var StartTimeInSec = function(TimeString) {
        var hours = parseInt((TimeString.match(/([0-9]+)h/i) || [" ", 0])[1]);
        var mins = parseInt((TimeString.match(/([0-9]+)m/i) || [" ", 0])[1]);
        var secs = parseInt((TimeString.match(/([0-9]+)s/i) || [" ", 0])[1]);

        return hours * 3600 + mins * 60 + secs;
    };

    s.$on('$destroy', function () {
        sidebarService.InputShow = false; // hide the input window
    });

    // -----|
    // init |
    // -----|

    // if contentstring is set, use that as basis for navigation. Else keep showing loading screen and let
    // $on('update-frontpage') handle rest.
    if (s.cs.Page.CurrentContent.content != "")
        Navigate(s.cs.Page.CurrentContent.content);
});
