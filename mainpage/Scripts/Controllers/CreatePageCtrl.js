app.controller('CreatePageCtrl', function ($scope, HTTPService) {
    var s = $scope;

    s.Pagename = "";
    s.Offset = 0;
    s.timezoneReadable = "";

    s.CreatePage = function() {
        var NewPagePackage = {};

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
            // todo: make better / less annoying messages (so not alerts)
            if (res.data.status === 430) {
                // pagename is taken
                alert("pagename is already taken abort abort");
            }
            else {
                alert("Page is created. It can be found at: foundafunny.com/pages/" + s.Pagename);
                console.log(res);
            }
        });
    };
});