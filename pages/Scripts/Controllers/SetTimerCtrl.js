app.controller('SetTimerCtrl', function($scope, $location, sidebarService, contentService) {
    var s = $scope;
    var optionobj = sidebarService.stInfoObj;

    // binding variables
    s.Timer = new TimerObject();
    s.WeekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    s.ShowWeeklyTypes = false;
    s.SelectedWeekDays = [];
    s.ShowStartContentError = false;
    s.ShowAtleastOneWeekDayError = false;
    s.ShowActivationTimeError = false;
    s.ShowActivationLengthWithoutEndContentError = false;
    s.ShowActivationLengthNaNError = false;
    s.ShowEndContentWithoutActivationLengthError = false;
    s.ShowTimerSavedFeedback = false;

    // when Timer.Type switches to Weekly, show weekly checkboxes
    $scope.$watch('Timer.Type', function() {
        s.ShowWeeklyTypes = s.Timer.Type === "Weekly";
    });

    // datetime pickers
    var datepicker = $('#datetimepicker_date');
    var hourpicker = $('#datetimepicker_hour');
    datepicker.datetimepicker({
        format: 'dd/MM/yyyy hh:mm:ss',
        language: 'en'
    });
    hourpicker.datetimepicker({
        pickDate: false,
        format: 'hh:mm:ss',
        language: 'en'
    });

    // save timer to db
    s.SaveTimer = function () {
        // reset errors
        var Errors = false;
        s.ShowStartContentError = false;
        s.ShowAtleastOneWeekDayError = false;
        s.ShowActivationTimeError = false;
        s.ShowActivationLengthWithoutEndContentError = false;
        s.ShowActivationLengthNaNError = false;
        s.ShowEndContentWithoutActivationLengthError = false;
        s.ShowTimerSavedFeedback = false;

        var dpt = datepicker.data('datetimepicker').getDate();
        var hpt = hourpicker.data('datetimepicker').getDate();
        var at = s.Timer.Type === "OneTime" ? datepicker.data('datetimepicker').getDate()
            : hourpicker.data('datetimepicker').getDate();

        // determine if any errors with input
        if (s.Timer.StartContent.length === 0) {
            s.ShowStartContentError = true;
            Errors = true;
        }
        if (s.Timer.Type === "Weekly" && s.SelectedWeekDays.length === 0) {
            s.ShowAtleastOneWeekDayError = true;
            Errors = true;
        }
        if (s.Timer.Type === "OneTime" && !ActivationTimeMoreThanCurrentTime(contentService.Page.Settings.offset, at)) {
            s.ShowActivationTimeError = true;
            Errors = true;
        }
        if (s.Timer.EndContent.length != 0 && (s.Timer.ActivationLength === null || s.Timer.ActivationLength === 0)) {
            s.ShowActivationLengthWithoutEndContentError = true;
            Errors = true;
        }
        if (!isInt(s.Timer.ActivationLength)) {
            s.ShowActivationLengthNaNError = true;
            Errors = true;
        }
        if (s.Timer.ActivationLength != 0 && (s.Timer.ActivationLength === null || s.Timer.EndContent.length === 0)) {
            s.ShowEndContentWithoutActivationLengthError = true;
            Errors = true;
        }


        // if no errors, send input to server
        if (!Errors) {
            // readable
            s.Timer.ActivationTimeReadable = s.Timer.Type === "OneTime" ?
                ConstructReadableDateString(at) : ConstructReadableHourString(at); // used for showcase, nothing else

            // convert datetimepicker time back to utc, which is the only thing the server deals in
            var timeDiffNeg = contentService.Page.Settings.offset * -1;
            s.Timer.ActivationTime = at.getTime() + timeDiffNeg * 60000;
            s.Timer.OriginalActivationTime = s.Timer.ActivationTime;

            // if weekly timer, fill activation days in order
            if (s.Timer.Type === "Weekly") DetectAndSortWeekdays(s.Timer, s.SelectedWeekDays);

            s.Timer.PageName = contentService.Page.Name;

            console.log("New timer sent to server:");
            console.log(s.Timer);

            // show feedback
            s.ShowTimerSavedFeedback = true;
            setTimeout(function () {
                s.ShowTimerSavedFeedback = false;
            }, 3000);

            // send timer to server
            contentService.PushNewTimerToServer(s.Timer);

            // reset values
            s.Timer = new TimerObject();
            setDatePickerToPageTime();
            resetValues();
        }
    };


    // broadcast receivers
    s.$on('update-set-timer', function () {
        setDatePickerToPageTime();
    });

    var setDatePickerToPageTime = function() {
        var utc = Date.now();
        var ClientDate = new Date(utc + contentService.Page.Settings.offset * 60000);

        datepicker.data('datetimepicker').setDate(ClientDate);
        hourpicker.data('datetimepicker').setDate(ClientDate);
    };
    var resetValues = function () {
        s.ShowWeeklyTypes = false;
        s.SelectedWeekDays = [];
        s.ShowStartContentError = false;
        s.ShowAtleastOneWeekDayError = false;
        s.ShowActivationTimeError = false;
        s.ShowActivationLengthWithoutEndContentError = false;
        s.ShowActivationLengthNaNError = false;
        s.ShowEndContentWithoutActivationLengthError = false;

        // reset all weekly timer radio buttons. The checkbox library doesn't support automatic databinding, so dom manipulation is necessary.
        var checkboxlist = document.getElementsByClassName("SetTimerWeekRadio");
        for (var i = 0; i < checkboxlist.length; i++) {
            var cb = checkboxlist[i];
            cb.checked = false;
        }
    };

    // init
    setDatePickerToPageTime();

    optionobj.SetSelected();
});




// helper functions / objects
var ActivationTimeMoreThanCurrentTime = function (diff, at) {
    var utc = Date.now();
    var ClientDate = new Date(utc + diff * 60000);
    return ClientDate < at;
};

var ConstructReadableDateString = function (date) {
    var hours = date.getUTCHours().toString().length === 1 ? "0" + date.getUTCHours() : date.getUTCHours();
    var minutes = date.getUTCMinutes().toString().length === 1 ? "0" + date.getUTCMinutes() : date.getUTCMinutes();
    var seconds = date.getUTCSeconds().toString().length === 1 ? "0" + date.getUTCSeconds() : date.getUTCSeconds();
    return date.getUTCDate() + "/" + date.getUTCMonth() + "/" + date.getUTCFullYear() + " "
        + hours + ":" + minutes + ":" + seconds;
};
var ConstructReadableHourString = function (date) {
    var hours = date.getUTCHours().toString().length === 1 ? "0" + date.getUTCHours() : date.getUTCHours();
    var minutes = date.getUTCMinutes().toString().length === 1 ? "0" + date.getUTCMinutes() : date.getUTCMinutes();
    var seconds = date.getUTCSeconds().toString().length === 1 ? "0" + date.getUTCSeconds() : date.getUTCSeconds();
    return hours + ":" + minutes + ":" + seconds;
};
var isInt = function(n) { return parseInt(n) === n };
var DetectAndSortWeekdays = function (timer, SelectedWeekDays) {
    // init ActivationDays array
    timer.ActivationDays = [
        {Day: "Mon", Selected: false},
        {Day: "Tue", Selected: false},
        {Day: "Wed", Selected: false},
        {Day: "Thu", Selected: false},
        {Day: "Fri", Selected: false},
        {Day: "Sat", Selected: false},
        {Day: "Sun", Selected: false}
    ];

    // determine selected weekdays
    for (var i = 0, j = 0; i < timer.ActivationDays.length; i++) {
        var obj = timer.ActivationDays[i];

        if (SelectedWeekDays.indexOf(obj.Day) != -1) {
            obj.Selected = true;
            timer.ActivationDaysReadable += obj.Day;
            j++;
            if (SelectedWeekDays.length != j) timer.ActivationDaysReadable += ", ";
        }
    }
};
var AlignDates = function(date, today) {
    date.setDate(today.getDate());
    date.setMonth(today.getMonth());
    date.setFullYear(today.getFullYear());
};

var TimerObject = function () {
    this.PageName = "";
    this.Name = "";
    this.StartContent = "";
    this.Type = "OneTime";
    this.ActivationDays = [];
    this.ActivationDaysReadable = "";
    this.ActivationTime = 0;
    this.OriginalActivationTime = 0;
    this.ActivationTimeReadable = "";
    this.ActivationLength = 0;
    this.EndContent = "";
    this.Active = false;
};