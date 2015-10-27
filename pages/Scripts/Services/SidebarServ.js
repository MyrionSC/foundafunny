app.service('sidebarService', function ($location) {
    var t = this;

    t.OptionsOpen = false;
    t.IndexShow = true;
    t.negZIndexClass = "";

    // used to add rotate classes to arrow imgs
    t.rotateWithClockClass = "";
    t.rotateAgainstClockClass = "";

    t.OptionsSelectorBgColor = 'rgb(221, 221, 221)';

    t.fpInfoObj = new OptionsInfo();
    t.faInfoObj = new OptionsInfo();
    t.vhInfoObj = new OptionsInfo();
    t.vtInfoObj = new OptionsInfo();
    t.stInfoObj = new OptionsInfo();
    t.csInfoObj = new OptionsInfo();
    t.OptionInfoArray = [t.fpInfoObj, t.faInfoObj, t.vhInfoObj, t.vtInfoObj, t.stInfoObj, t.csInfoObj];

    // set navigation for each option
    t.fpInfoObj.Functionality = function () {
        $location.path('frontpage');
    };
    t.faInfoObj.Functionality = function () {
        $location.path('favorite');
    };
    t.vhInfoObj.Functionality = function () {
        $location.path('history');
    };
    t.vtInfoObj.Functionality = function () {
        $location.path('timers');
    };
    t.stInfoObj.Functionality = function () {
        $location.path('settimer');
    };
    t.csInfoObj.Functionality = function () {
        $location.path('settings');
    };


    t.setOption = function (InfoObj) {
        if (!InfoObj.Selected) {
            t.SetAllOptionsStandard();
            InfoObj.SetSelected();
        }
    };
    t.OptionsMouseEnter = function (InfoObj) {
        if (!InfoObj.Selected) {
            InfoObj.SetBgLightGreen();
        }
    };
    t.OptionsMouseLeave = function (InfoObj) {
        if (!InfoObj.Selected) {
            InfoObj.SetBgStandard();
        }
    };
    t.SetAllOptionsStandard = function () {
        for (var i = 0; i < t.OptionInfoArray.length; i++) {
            t.OptionInfoArray[i].SetBgStandard();
            t.OptionInfoArray[i].Selected = false;
        }
    };
    t.openOptions = function () {
        t.OptionsOpen = true;
        t.OptionsSelectorBgColor = 'rgb(200, 255, 200)';
        t.rotateWithClockClass = "rotateWithClock";
        t.rotateAgainstClockClass = "rotateAgainstClock";
        t.negZIndexClass = "negZIndex";
    };
    t.closeOptions = function () {
        if (t.OptionsOpen) {
            t.OptionsOpen = false;
            t.OptionsSelectorBgColor = 'rgb(221, 221, 221)';
            t.rotateWithClockClass = "";
            t.rotateAgainstClockClass = "";
            t.negZIndexClass = "";
        }
    };
});

// used to hold info from options
var OptionsInfo = function () {
    this.BgColor = 'rgb(221, 221, 221)';
    this.Selected = false;

    this.SetSelected = function () {
        this.SetBgGreen();
        this.Selected = true;
        this.Functionality();
    };

    this.Functionality = function () {
        // abstract
    };

    this.SetBgGreen = function () {
        this.BgColor = 'rgb(84, 225, 84)';
    };
    this.SetBgLightGreen = function () {
        this.BgColor = 'rgb(128, 225, 128)';
    };
    this.SetBgStandard = function () {
        this.BgColor = 'rgb(221, 221, 221)';
    };
};