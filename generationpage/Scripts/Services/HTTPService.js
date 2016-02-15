app.service('HTTPService', function ($http) {
    var that = this;
    //var url = 'https://foundafunny.herokuapp.com';
    //var url = 'http://localhost:5000'; // when testing
    var url = document.location.hostname == "localhost" ? 'http://localhost:5000' :
        'https://foundafunny.herokuapp.com';

    this.CreateNewPage = function(NewPagePackage, callback) {
        $http.post(url + '/post/createpage', NewPagePackage).
            then(function(res) {
                console.log(res);
                callback(res);
                // this callback will be called asynchronously
                // when the response is available
            }, function(res) {
                callback(res);
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });
    };
});