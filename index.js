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
    var currentObject;
    var currentMousePos = { x: -1, y: -1 };

    var L_Heap = {data : []};
    var R_Heap = {data : []};

    var stack = [];
    var stackSizeMax = 2;

    var backStack = [];
    var backStackSizeMax = 2;
    var clearLog = true;

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

    setInterval(function() {setSliderProgress()}, 10);
    

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
        currentObject.get(0).pause();
        var obj = backStack.shift();
        if (obj != undefined) {
            stack.unshift(currentObject);
            if (stack.length > stackSizeMax) {
                R_Heap.data.unshift(stack.pop());
                if (R_Heap.data.length > maxRHeapSize) {
                    var lastItem = $(R_Heap.data.pop()).attr('index') - 1;
                    loadStatusRH.loadStatus = false;
                    loadStatusRH.index = lastItem;
                }
            }
            currentObject = obj;
        }
        applyObject(currentObject);
        getLogInfo();
    }

    function next() {
        currentObject.get(0).pause();
        var obj = stack.shift();
        if (obj != undefined) {
            backStack.unshift(currentObject);
            if (backStack.length > backStackSizeMax) {
                L_Heap.data.unshift(backStack.pop());
                if (L_Heap.data.length > maxLHeapSize) {
                    var lastItem = $(L_Heap.data.pop()).attr('index') - 1;
                    loadStatusLH.loadStatus = false;
                    loadStatusLH.index = lastItem;
                }
            }
            currentObject = obj;
            applyObject(currentObject);
        }
        getLogInfo();
    }

    function resetSlider() {
        currentObject.get(0).currentTime = 0;
        $(slider).css('marginLeft', sliderMarginLeft + 'px');
    }

    function refresh() {
        currentObject.get(0).currentTime = 0;
        currentObject.get(0).play();
    }

    function play() {
        if (currentObject.get(0).paused) {
            currentObject.get(0).play();
        }
        else {
            pause();
        }
    }

    function pause() {
        currentObject.get(0).pause();
    }

    function setPlayPauseIcon(event) {
        var a = event.type;
        var b = currentObject.get(0).paused;
        if (currentObject.get(0).paused) {
            $(b_play).css('background-image', 'url(images/play.png)');
        }
        else {
            $(b_play).css('background-image', 'url(images/pause.png)');
        }
    }

    function moveSlider(event) {
        pause();
        /*
        var pBar_x = $(p_bar).offset().left;
        var pBar_Width = $(p_bar).css('width').replace('px', '') - sliderWidth;
        var pos = currentMousePos.x - pBar_x - sliderWidth/2;
        if (pos >= 0 && pos <= pBar_Width) {
            $(slider).css('margin-left', pos);
            var a = player.duration * (pos/pBar_Width);
            player.currentTime = a;
        }*/
        currentObject[0].currentTime = 3;

        play();
    }

    function setSliderProgress() {
        if (!currentObject.get(0).paused) {
            var pos = $(p_bar).css('width').replace('px', '') - sliderWidth - 2;
            var position = pos * currentObject.get(0).currentTime/currentObject.get(0).duration + 2;
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

        if (index >= 0 && index < model.length) {
            wrapObject.attr('src', model[index].src);
            wrapObject.attr('text1', model[index].text1);
            wrapObject.attr('text2', model[index].text2);
            wrapObject.attr('index', index);

            wrapObject.bind('loadeddata', function(event) {
                $(R_Heap).trigger('itemLoaded', index);
            });

            return wrapObject;
        }
    }

    function applyObject(obj, onload) {
        resetSlider();
        $(t_area1).text(obj.attr('text1'));
        $(t_area2).text(obj.attr('text2'));
        obj.bind('pause play', setPlayPauseIcon);
        if(onload != true) {
            obj.get(0).play();
        }
        else {
            obj.get(0).load();
        }
        getLogInfo();
    }
    


    // *******************************************************************
    // **                    stack data operations                      **
    // *******************************************************************

    function getLogInfo() {
        var logString = '';
        backStack.forEach(function(item) {
            logString = '[' + item.attr('index') + ']' + logString;
        });
        for (var a = backStack.length; a < backStackSizeMax; a++) {
            logString = '[-]' + logString;
        }
        logString += ' (' + currentObject.attr('index') + ') ';
        stack.forEach(function(item) {
            logString += '[' + item.attr('index') + ']';
        });
        for (var a = stack.length; a < stackSizeMax; a++) {
            logString += '[-]';
        }
        if (clearLog){
            console.clear();
        }
        console.log(logString);

        logString = '';
        L_Heap.data.forEach(function(item) {
            logString += '[' + item.attr('index') + ']';
        });

        console.log('L_Heap ' + logString);

        logString = '';
        R_Heap.data.forEach(function(item) {
            logString += '[' + item.attr('index') + ']';
        });

        console.log('R_Heap ' + logString);
    }


    currentObject = getObjFromModel(0);
    applyObject(currentObject, true);
    var R_Heap_Loop = setInterval(function() {fillStackFromRHeap();}, 500);
    var L_Heap_Loop = setInterval(function() {fillStackFromLHeap();}, 500);
    var maxRHeapSize = 2;
    var maxLHeapSize = 2;
    var loadStatusRH = {loadStatus : true, index : 0};
    var loadStatusLH = {loadStatus : true, index : 0};




    function onItemLoaded(event, index) {
        if (R_Heap.data.length < maxRHeapSize) {
            var item = getObjFromModel(index + 1);
            if (item != undefined) {
                if (!isContains(R_Heap.data, item)) {
                    R_Heap.data.push(item);
                }
            }
            loadStatusRH.loadStatus = true;
            loadStatusRH.index = index;
            getLogInfo();
        }
        else {
            loadStatusRH.loadStatus = false;
            loadStatusRH.index = index;
            getLogInfo();
        }
    }

    function onItemLoaded2(event, index) {
        if (L_Heap.data.length < maxLHeapSize) {
            if (index > 0) {
                var item = getObjFromModel(index - 1);
                if (item != undefined) {
                    if (!isContains(L_Heap.data, item)) {
                        L_Heap.data.push(item);
                    }
                }
            }
            getLogInfo();
        }
    }

    function isContains(array, item) {
        for (var j = 0; j < array.length; j++) {
                var a = $(array[j]).attr('index');
                var b = $(item).attr('index');
            if ($(array[j]).attr('index') == $(item).attr('index')) {
                return true;
            }
        }
        return false;
    }

    $(R_Heap).bind('itemLoaded', function(event, index){
        onItemLoaded(event, index);
    });

    $(L_Heap).bind('itemLoaded', function(event, index){
        onItemLoaded2(event, index);
    });

    function fillStackFromRHeap() {

        if(R_Heap.data.length != 0) {
            var lastStackItem = $(stack).last()[0];
            
            if (lastStackItem == undefined) {
                lastStackItem = currentObject;
            }
            var lastIndex = lastStackItem.attr('index');

            for (var j = 0; j < R_Heap.data.length; j++) {
                var currentIndex = R_Heap.data[j].attr('index');
                var a = currentIndex - 1;
                var b = lastIndex;
                if (a == b) {
                    if (stack.length < stackSizeMax) {
                        stack.push(R_Heap.data[j]);
                        R_Heap.data.splice(j, 1);
                        lastIndex++;
                        j--;
                        getLogInfo();
                    }
                }
            }

            if (loadStatusRH.loadStatus == false && R_Heap.data.length < maxRHeapSize) {
                $(R_Heap).trigger('itemLoaded', loadStatusRH.index);
            }
        }
    }

    function fillStackFromLHeap() {

        if(L_Heap.data.length != 0) {
            var lastStackItem = $(backStack).last().get(0);
            
            if (lastStackItem == undefined) {
                lastStackItem = currentObject;
            }
            var lastIndex = lastStackItem.attr('index');
            var pushed = false;

            for (var j = 0; j < L_Heap.data.length; j++) {
                var currentIndex = L_Heap.data[j].attr('index');
                var a = parseInt(currentIndex);
                a = a + 1;
                var b = lastIndex;
                if (a == b) {
                    if (backStack.length < backStackSizeMax) {
                        backStack.push(L_Heap.data[j]);
                        L_Heap.data.splice(j, 1);
                        lastIndex--;
                        j--;
                        getLogInfo();
                        pushed = true;
                    }
                }
            }
            lastIndex = $(backStack).last().get(0).attr('index');
            if (L_Heap.data.length == 0 && pushed == true && lastIndex > 0) {
                $(L_Heap).trigger('itemLoaded', lastIndex);
            }
        }
    }




});
