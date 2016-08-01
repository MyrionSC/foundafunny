// code for validating client pushes
var exports = module.exports = {};

exports.validateContent = function (cont) {
    return typeof cont === "string";
};
exports.validateId = function (id) {
    return typeof id === "string";
};
exports.validateTimer = function (timer) {
    var val = true;
    val = val && typeof timer.PageName === "string";
    val = val && typeof timer.Name === "string";
    val = val && typeof timer.Type === "string";
    val = val && typeof timer.ActivationDaysReadable === "string";
    val = val && typeof timer.ActivationTime === "number";
    val = val && typeof timer.OriginalActivationTime === "number";
    val = val && typeof timer.ActivationTimeReadable === "string";
    val = val && typeof timer.ActivationLength === "number";
    val = val && typeof timer.Active === "boolean";
    val = val && Object.prototype.toString.call(timer.StartContent) === '[object Array]';
    for (var i = 0; i < timer.StartContent.length; i++) {
        val = val && typeof timer.StartContent[i] === "string";
    }
    val = val && Object.prototype.toString.call(timer.EndContent) === '[object Array]';
    for (var j = 0; j < timer.EndContent.length; j++) {
        val = val && typeof timer.EndContent[j] === "string";
    }
    val = val && Object.prototype.toString.call(timer.ActivationDays) === '[object Array]';
    for (var k = 0; k < timer.ActivationDays.length; k++) {
        val = val && typeof timer.ActivationDays[k].Selected === "boolean";
        val = val && typeof timer.ActivationDays[k].Day === "string";
    }

    return val;
};
exports.validateSettings = function (settings) {
    var val = true;
    val = val && typeof settings.bgColor === "string";
    val = val && typeof settings.fontColor === "string";
    val = val && typeof settings.offset === "number";
    val = val && typeof settings.theme === "string";
    val = val && typeof settings.timezoneReadable === "string";
    val = val && typeof settings.timezoneVal === "string";
    return val;
};