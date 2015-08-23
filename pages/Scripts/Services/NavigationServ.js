app.service('navigationService', function ($location, contentService, sidebarService) {
    // TODO: Do I still use this? probably not, delete at some point

    this.Navigate = function (inputStr) {
        if (inputStr != contentService.Page.ContentArray[0]) {

            sidebarService.setOption(sidebarService.fpInfoObj);
            $location.search({}); // sets url parameters to null
            contentService.Page.ContentArray[0] = inputStr;

            if (CheckImgUrl(inputStr)) {
                NavToPage('image');
            }
            else if (CheckVideoUrl(inputStr)) {
                NavToPage('video');
            }
            else if (CheckYoutubeUrl(inputStr)) {
                NavToPage('youtube');
            }
            else {
                NavToPage("para");
            }
        }
    };

    var NavToPage = function (location) {
        $location.path(location);
    };

    var CheckImgUrl = function (url) {
        return(url.match(/\.(jpeg|jpg|gif|png)$/) != null);
    };
    var CheckVideoUrl = function (url) {
        return(url.match(/\.(webm|mp4)$/) != null);
    };
    var CheckYoutubeUrl = function (url) {
        return(url.match(/https:\/\/www\.Youtube\.com/i)!= null);
    };
});