/*globals jQuery, utils, chrome */

// TODO: Share constants across files (like magicss.js, editor.js and options.js) (probably keep them in a separate file as global variables)
var USER_PREFERENCE_AUTOCOMPLETE_SELECTORS = 'autocomplete-css-selectors';
var USER_PREFERENCE_ALL_FRAMES = 'all-frames';

jQuery(function ($) {
    var chromeStorage = chrome.storage.sync || chrome.storage.local;

    var RadionButtonSelectedValueSet = function (name, SelectedValue) {
        $('input[name="' + name+ '"]').val([SelectedValue]);
    };

    var notifyUser = function () {
        utils.alertNote('Your change would apply next time onwards :-)', 2500);
    };

    chromeStorage.get(USER_PREFERENCE_AUTOCOMPLETE_SELECTORS, function (values) {
        var $useAutocompleteForCssSelectors = $('#autocomplete-selectors'),
            markChecked = true;
        if (values && values[USER_PREFERENCE_AUTOCOMPLETE_SELECTORS] === 'no') {
            markChecked = false;
        }
        $useAutocompleteForCssSelectors.prop('checked', markChecked);
    });
    $('#autocomplete-selectors').on('click', function () {
        var valueToSet = 'no';
        if($(this).is(':checked')) {
            valueToSet = 'yes';
        }
        chromeStorage.set({[USER_PREFERENCE_AUTOCOMPLETE_SELECTORS]: valueToSet});
        notifyUser();
    });

    chromeStorage.get(USER_PREFERENCE_ALL_FRAMES, function (values) {
        var $allFrames = $('#all-frames'),
            markChecked = false;
        if (values && values[USER_PREFERENCE_ALL_FRAMES] === 'yes') {
            markChecked = true;
        }
        $allFrames.prop('checked', markChecked);
    });
    $('#all-frames').on('click', function () {
        var valueToSet = 'no';
        if($(this).is(':checked')) {
            valueToSet = 'yes';
        }
        chromeStorage.set({[USER_PREFERENCE_ALL_FRAMES]: valueToSet});
        notifyUser();
    });

    chromeStorage.get('default-language-mode', function (values) {
        if (values && values['default-language-mode'] === 'less') {
            RadionButtonSelectedValueSet('default-language-mode', 'less');
        } else if (values && values['default-language-mode'] === 'sass') {
            RadionButtonSelectedValueSet('default-language-mode', 'sass');
        } else {
            RadionButtonSelectedValueSet('default-language-mode', 'css');
        }
    });
    $('input[name=default-language-mode]').change(function () {
        var value = $(this).val(),
            valueToSet;
        if (value === 'less') {
            valueToSet = 'less';
        } else if (value === 'sass') {
            valueToSet = 'sass';
        } else {
            valueToSet = 'css';
        }
        chromeStorage.set({'default-language-mode': valueToSet});
        notifyUser();
    });

    chromeStorage.get('use-tab-for-indentation', function (values) {
        if (values && values['use-tab-for-indentation'] === 'yes') {
            RadionButtonSelectedValueSet('indentation', 'tab');
        } else {
            RadionButtonSelectedValueSet('indentation', 'spaces');
        }
    });
    $('input[name=indentation]').change(function () {
        var value = $(this).val(),
            valueToSet = 'no';
        if (value === 'tab') {
            valueToSet = 'yes';
        }
        chromeStorage.set({'use-tab-for-indentation': valueToSet});
        notifyUser();
    });

    chromeStorage.get('indentation-spaces-count', function (values) {
        var value = parseInt(values && values['indentation-spaces-count'], 10);
        if (isNaN(value) || !(value >= 1 && value <= 8)) {
            value = 4;
        }
        $('.indentation-spaces-count').val('' + value);
    });
    $('.indentation-spaces-count').change(function () {
        var value = $(this).val(),
            valueToSet = value;
        if (!(value >= 1 && value <= 8)) {
            valueToSet = 4; // default value
        }
        chromeStorage.set({'indentation-spaces-count': valueToSet});

        // Also mark that space characters would be used for indentation
        RadionButtonSelectedValueSet('indentation', 'spaces');
        chromeStorage.set({'use-tab-for-indentation': 'no'});
        notifyUser();
    });

    $('#done').on('click', function () {
        window.close();
    });
});
