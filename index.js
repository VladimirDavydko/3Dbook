$(function () {

    // *******************************************************************
    // **                    global variables                           **
    // *******************************************************************

    var player = document.getElementById('player');
    var slider = document.getElementById('slider');
    var p_bar = document.getElementById('p-bar');
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
    var currentMousePos = { x: -1, y: -1 };
    var queue = [];

    // *******************************************************************
    // **                         events                                **
    // *******************************************************************

    $(document).bind('mousedown', function() {isMouseDown = true;});
    $(document).bind('mouseup', function() {isMouseDown = false;});
    $(document).bind('keydown', navKey);
    $(b_refresh).bind('click', refresh);
    $(b_play).bind('click', play);
    $(p_bar).bind('mousedown', moveSlider);
    $(player).bind('pause play', setPlayPauseIcon);
    $(b_prev).bind('click', prev);
    $(b_next).bind('click', next);
    $(p_bar).bind('mousemove', move);
    $(document).mousemove(function(event) {
        currentMousePos.x = event.pageX;
        currentMousePos.y = event.pageY;
    });

    // *******************************************************************
    // **                      onload functionality                     **
    // *******************************************************************

    setInterval(function() {setSliderProgress();}, 10);
    setData(true);

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

    function prev(x) {
        i--;
        setData();
    }

    function next() {
        i++;
        setData();
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
            player.currentTime = player.duration * pos/pBar_Width;
        }
        play();
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

    function setData(start) {
        resetSlider();
        if (i >= 0 && i < model.length) {
            $(t_area1).text(model[i].text1);
            $(t_area2).text(model[i].text2);
            $(player).attr('src', model[i].src);
        }
        if (i < 0) i = 0;
        if (i >= model.length) i = model.length - 1;
        if (start != true) {
            refresh();
        }
    }

    var queueSize = 5;
    function loadQueue() {
        for (var x = 0; x < model.length && x < queueSize; x++) {
            var newPlayer = $(player).clone();
            newPlayer.attr('src', model[x].src);
            newPlayer.text1 = model[x].text1;
            newPlayer.text2 = model[x].text2;
            queue.push(newPlayer);
        }
    }
    
});
