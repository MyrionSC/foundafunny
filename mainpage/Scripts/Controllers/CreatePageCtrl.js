app.controller('CreatePageCtrl', function ($scope, HTTPService) {
    var s = $scope;

    s.Pagename = "";
    s.Offset = 0;
    s.timezoneReadable = "";
    s.NewPageUrl = "";
    s.ShowGeneratingPage = false;
    s.ShowPageUrl = false;
    s.ShowIllegalPagename = false;
    s.ShowPagenameAlreadyTaken = false;

    s.CreatePage = function() {
        var NewPagePackage = {};
        s.ShowIllegalPagename = false;
        s.ShowPagenameAlreadyTaken = false;

        if (!NameCheck(s.Pagename)) {
            s.ShowIllegalPagename = true;
            return;
        }

        s.ShowGeneratingPage = true;
        var jele = $('#timezoneselect');
        var offset = $('option:selected', jele).attr('data-offset');
        NewPagePackage.pagename = s.Pagename;
        NewPagePackage.timezoneReadable = jele.val();
        NewPagePackage.bgColor = "#ffffff";

        // transform the offset into minutes
        var hours = parseInt(offset.substring(0,3));
        var min = parseInt(offset.substring(4, 6));
        if (hours < 0) min *= -1;
        NewPagePackage.offset = hours * 60 + min;

        console.log(NewPagePackage);
        HTTPService.CreateNewPage(NewPagePackage, function(res) {
            s.ShowGeneratingPage = false;
            if (res.data.status === 430) {
                // pagename is taken
                s.ShowPagenameAlreadyTaken = true;
            }
            else {
                s.NewPageUrl = "foundafunny.com/pages/" + s.Pagename;
                s.ShowPageUrl = true;
                console.log(res);
            }
        });
    };
    var NameCheck = function(str) {
        str = str.trim();
        if (str.match(/[^a-z0-9_-]+/) === null) return true;
        return false;
    };
});