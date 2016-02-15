// ==UserScript==
// @name        insertTranslation
// @description Inserts translation instead of highlighted text (*>ru)
// @namespace   *
// @version     1
// @grant       none
// ==/UserScript==

if (window.top != window.self)  //don't run on frames or iframes
{
    return;
}

var keys = [], onAir = 0,
    join = function(obj, t1, t2) {
        var result = [],
            t1 = t1 || "=",
            t2 = t2 || "&";
        for (attr in obj) {
            result.push(attr + t1 + obj[attr]);
        }
        return result.join(t2);
    };

window.executeHotkeyTest = function (callback, keyValues) {
    var allKeysValid = true;
    for (var i = 0; i < keyValues.length; ++i)
        allKeysValid = allKeysValid && keys[keyValues[i]];
    if (allKeysValid) callback();
};

window.addGlobalHotkey = function (callback, keyValues) {
    if (typeof keyValues === "number")
        keyValues = [keyValues];
    var fnc = function (cb, val) {
        return function (e) {
            keys[e.keyCode] = true;
            executeHotkeyTest(cb, val);
        };
    }(callback, keyValues);
    window.addEventListener('keydown', fnc);
    return fnc;
};

window.addEventListener('keyup', function (e) {
    keys[e.keyCode] = false;
});

insertTranslation = function() {
    if (onAir) { 
        console.log('A translation process is already active now'); return;
    }
    var obj = window.getSelection();
    if (obj.isCollapsed) { console.log('No selection passed'); return; }
    if (obj.anchorNode != obj.focusNode) { console.log('Too lazy to analyze the structure of given selection, aborting the job'); return; }
    if (obj.anchorNode.nodeType != 3) { console.log('Given node is not a text node!'); return; }
    var text = obj.toString(),
        arr = text.match(/(\w+)/g);
    if (!arr) {
        console.log('Can\'t parse your text due to some unknown error, aborting the job'); return;
    }
    onAir = 1;
    var longest = arr[0];
    if (arr.length > 1) for (i=0;i<arr.length;i++) { if (arr[i].length > longest.length) longest = arr[i]; }
    var left = ((obj.anchorOffset > obj.focusOffset) ? obj.focusOffset : obj.anchorOffset) + text.indexOf(longest);
    var xhr = new XMLHttpRequest();
    var options = {
        'key': 'trnsl.1.1.20150330T212825Z.aef560fdba779d33.4626c7f4aee4fc6f4786d45167e52985770df4f4',
        'text': longest,
        'lang': 'ru',
        'format': 'html',
        'options': '1'
    };
    var url = 'https://translate.yandex.net/api/v1.5/tr.json/translate?' + join(options);
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState != 4) return;
        if (xhr.status = 200) {
            obj.anchorNode.textContent = obj.anchorNode.textContent.substr(0,left) + JSON.parse(xhr.response).text[0] + obj.anchorNode.textContent.substr(left+longest.length);
        } else {
            console.log('Some error occured, sorry(');
        }
        onAir = 0;
    };
    xhr.send(null); 
}

addGlobalHotkey(insertTranslation,[17, 18]); // ctrl + alt
console.log('Translator is on, press ctrl+alt when some text is selected');



