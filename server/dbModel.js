var mongoose = require ("mongoose");
var model = module.exports = {};

var timerSchema = model.timerSchema = new mongoose.Schema({
    Name: String,
    PageName: String,
    StartContent: Array,
    Type: String,
    ActivationDays: Array,
    ActivationDaysReadable: String,
    ActivationTime: Number,
    OriginalActivationTime: Number,
    ActivationTimeReadable: String,
    ActivationLength: Number,
    EndContent: Array,
    Active: Boolean
});
model.pageSchema = new mongoose.Schema({
    Name: String,
    CurrentContent: String,
    ContentArray: Array,
    Favorites: Array,
    Settings: { // TODO: add some youtube settings and such later
        bgColor: String,
        timezoneReadable: String,
        timezoneVal: String,
        offset: Number, // difference from localtime to utc in minutes
        theme: String,
        fontColor: String
    },
    Timers: [timerSchema]
});
model.updateTimer = function (destTimer, srcTimer) {
    destTimer.Name = srcTimer.Name;
    destTimer.StartContent = srcTimer.StartContent.slice();
    destTimer.Type = srcTimer.Type;
    destTimer.ActivationDays = srcTimer.ActivationDays.slice();
    destTimer.ActivationDaysReadable = srcTimer.ActivationDaysReadable;
    destTimer.ActivationTime = srcTimer.ActivationTime;
    destTimer.OriginalActivationTime = srcTimer.OriginalActivationTime;
    destTimer.ActivationTimeReadable = srcTimer.ActivationTimeReadable;
    destTimer.ActivationLength = srcTimer.ActivationLength;
    destTimer.EndContent = srcTimer.EndContent.slice();
    destTimer.Active = srcTimer.Active;
};
model.setSettings = function (destSettings, srcSettings) {
    destSettings.bgColor = srcSettings.bgColor;
    destSettings.timezoneVal = srcSettings.timezoneVal;
    destSettings.timezoneReadable = srcSettings.timezoneReadable;
    destSettings.offset = srcSettings.offset;
    destSettings.theme = srcSettings.theme;
    destSettings.fontColor = srcSettings.fontColor;
};