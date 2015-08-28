var exports = module.exports = {};
var Pages = exports.pages = [];

exports.initDone = false;
exports.createPage = function(page) {
    Pages.push(new PageObj(page.Name, page.Settings, page.Favorites));
};
exports.getPage = function(name) {
    return nameSearch(name, Pages);
};
exports.getNumberOfPages = function() {
    return Pages.length;
};
function nameSearch(nameKey, myArray){
    for (var i=0; i < myArray.length; i++) {
        if (myArray[i].Name === nameKey) {
            return myArray[i];
        }
    }
}

var PageObj = function(Name, Settings, Favorites) {
    this.Name = Name;
    this.Settings = new SettingsObj(Settings);
    this.ConnectedSockets = [];
    this.Favorites = Favorites;

    this.insertFavorite = function(content) {
        var index = this.Favorites.indexOf(content);
        if (index != -1) {
            this.Favorites.push(content);
        }
    };
    this.removeFavorite = function(content) {
        var index = this.Favorites.indexOf(content);
        if (index != -1) {
            this.Favorites.splice(index, 1);
        }
    };
    this.ExistingFavorite = function(content) {
        return this.Favorites.indexOf(content) != -1;
    };
    this.testing = function() {
        return "this is a motherfucking test";
    };
};
var SettingsObj = function(settings) {
    this.bg_color = settings.bg_color;
    this.Timezone = settings.Timezone;
    this.TimeDiff = settings.TimeDiff;
};