$(function () {

    // *******************************************************************
    // **                    global variables                           **
    // *******************************************************************

    var player  = document.getElementById('player');
    var slider  = document.getElementById('slider');
    var p_bar   = document.getElementById('p-bar');
    var t_area1 = document.getElementById('t_area1');
    var t_area2 = document.getElementById('t_area2');

    var b_refresh = document.getElementById('refresh');
    var b_play    = document.getElementById('play');
    var b_prev    = document.getElementById('prev');
    var b_next    = document.getElementById('next');

    var isMouseDown = false;
    var sliderWidth = $(slider).css('width').replace('px', '');
    var sliderMarginLeft = $(slider).css('marginLeft').replace('px', '');

    var i = 0;
    var stack = [];
    var currentObject;
    var backStack = [];
    var stackSizeMax = 5;
    var backStackSizeMax = 30;
    var currentMousePos = { x: -1, y: -1 };

    var timer;
    var backTimer;

    // *******************************************************************
    // **                         events                                **
    // *******************************************************************

    $(document).bind('mousedown', function() {isMouseDown = true;});
    $(document).bind('mouseup', function() {isMouseDown = false;});
    $(document).bind('keydown', navKey);

    $(b_refresh).bind('click', refresh);
    $(b_play).bind('click', play);
    $(b_prev).bind('click', prev);
    $(b_next).bind('click', next);
    //$(p_bar).bind('mousemove', move);
    //$(p_bar).bind('mousedown', moveSlider);

    $(document).mousemove(function(event) {
        currentMousePos.x = event.pageX;
        currentMousePos.y = event.pageY;
    });

    // *******************************************************************
    // **                      onload functionality                     **
    // *******************************************************************

    setInterval(function() {setSliderProgress();}, 10);
    currentObject = getObjFromModel(0);
    applyObject(currentObject, true);

    // *******************************************************************
    // **                     navigation and buttons                    **
    // *******************************************************************

    function navKey(event) {
        if (event.keyCode == 32) {
            play();
        }
        if (event.keyCode == 37) {
            prev();
        }
        if (event.keyCode == 39) {
            next();
        }
    }

    function prev() {
        player.pause();
        var obj = shiftFromStack(backStack);
        if (obj != false) {
            unshiftToStack(currentObject, stack);
            currentObject = obj;
        }
        applyObject(currentObject);
    }

    function next() {
        player.pause();
        var obj = shiftFromStack(stack);
        if (obj != false) {
            unshiftToStack(currentObject, backStack);
            currentObject = obj;
        }
        applyObject(currentObject);
    }

    function resetSlider() {
        player.currentTime = 0;
        $(slider).css('marginLeft', sliderMarginLeft + 'px');
    }

    function refresh() {
        player.currentTime = 0;
        player.play();
    }

    function play() {
        if (player.paused) {
            player.play();
        }
        else {
            pause();
        }
    }

    function pause() {
        player.pause();
    }

    function setPlayPauseIcon(event) {
        var a = event.type;
        var b = player.paused;
        if (player.paused) {
            $(b_play).css('background-image', 'url(images/play.png)');
        }
        else {
            $(b_play).css('background-image', 'url(images/pause.png)');
        }
    }

    function moveSlider(event) {
        pause();
        var pBar_x = $(p_bar).offset().left;
        var pBar_Width = $(p_bar).css('width').replace('px', '') - sliderWidth;
        var pos = currentMousePos.x - pBar_x - sliderWidth/2;
        if (pos >= 0 && pos <= pBar_Width) {
            $(slider).css('margin-left', pos);
            var a = player.duration * (pos/pBar_Width);
            player.currentTime = a;
        }

        player.play();
    }

    function setSliderProgress() {
        if (!player.paused) {
            var pos = $(p_bar).css('width').replace('px', '') - sliderWidth - 2;
            var position = pos * player.currentTime/player.duration + 2;
            $(slider).css('margin-left', position);
        }
    }

    function move() {
        if (isMouseDown) {
            var pBar_x = $(p_bar).offset().left;
            var pBar_Width = $(p_bar).css('width').replace('px', '') - 5;
            var pos = currentMousePos.x - pBar_x;
            $(slider).css('margin-left', pos);
        }
    }

    // *******************************************************************
    // **                         data methods                          **
    // *******************************************************************

    function getObjFromModel(index) {
        var wrapObject = $(player).clone();
        var textObject = {};

        if (index == undefined || index < 0 || index >= model.length || model[index] == undefined) { // bug
            wrapObject.attr('src', '');
            textObject.text1 = '    The End';
            textObject.text2 = '    Конец';
        }
        else {
            wrapObject.attr('src', model[index].src);
            textObject.text1 = model[index].text1;
            textObject.text2 = model[index].text2;

            wrapObject.bind('loadeddata', function(event) {
                loadNext(index + 1);
            });
        }

        return { playerObject : wrapObject[0], textObject : textObject};
    }

    function applyObject(obj, onload) {
        resetSlider();
        $(t_area1).text(obj.textObject.text1);
        $(t_area2).text(obj.textObject.text2);
        player = obj.playerObject;
        $(player).bind('pause play', setPlayPauseIcon);
        if(onload != true) {
            player.play();
        }
        else {
            obj.playerObject.load();
        }
    }

    function loadNext(index) {
        pushToStack(index, stack);
    }


    // *******************************************************************
    // **                    stack data operations                      **
    // *******************************************************************

    function pushToStack(index, currentStack) {
        var currentStackSizeMax = stack == currentStack ? stackSizeMax : backStackSizeMax;
        if (currentStack.length < currentStackSizeMax) {
            currentStack.push(getObjFromModel(index));
            var str = stack == currentStack ? ' stack ' : ' backStack ';
            console.log('pushed to' + str + index);
            console.log(currentStack);
        }
        else {
            if (stack == currentStack) {
                timer = setInterval(function() {stackLooper(currentStack, currentStackSizeMax, index, currentStack);}, 300);
            }
            if (backStack == currentStack) {
                backTimer = setInterval(function() {stackLooper(currentStack, currentStackSizeMax, index, currentStack);}, 300);
            }
        }
    }

    function stackLooper(currentStack, currentStackSizeMax, index, currentStack) {
        console.log('looper');
        if (currentStack.length < currentStackSizeMax) {
            clearInterval(timer);
            pushToStack(index, currentStack);
        }
    }

    function shiftFromStack(currentStack) {
        var item = currentStack.shift();
        if (item === undefined) {
            return false;
        }
        var str = stack == currentStack ? ' stack ' : ' backStack ';
        return item;
    }

    function unshiftToStack(item, currentStack) {
        var currentStackSizeMax = stack == currentStack ? stackSizeMax : backStackSizeMax;
        currentStack.unshift(item);
        var str = stack == currentStack ? ' stack ' : ' backStack ';
        if (currentStack.length > currentStackSizeMax) {
            currentStack.pop();
            clearInterval(timer);
            var lastStackItem = $(currentStack).last().get(0);
            $(lastStackItem.playerObject).trigger('loadeddata');
        }
        console.log('unshifted to' + str);
        console.log(currentStack);
    }
});
