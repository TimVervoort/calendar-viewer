var weekdayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
var tomorrowName = 'tomorrow';
var todayName = 'today';
var url = 'https://www.timvervoort.com/api/agenda/';
var beginDay = new Date().setHours(0, 0, 1, 0);
var hours = 24;
var nextDays = 60;
    
$(document).ready(function () {

    // Returns the amount of hours between two dates
    function timeDifference(a, b) {
        var msPerMinute = 60 * 1000;
        var msPerHour = msPerMinute * 60;
        var elapsed = new moment(b) - new moment(a);
        return elapsed / msPerHour;
    }

    function getHour(date) {
        return date.split(' ')[1].split(':')[0];
    }
    function getMin(date) {
        return date.split(' ')[1].split(':')[1];
    }

    function getTime(date) {
        return getHour(date)+':'+getMin(date);
    }

    function drawReservation(date, start, end) {
        if (!date || !start || !end) { return; }

        var timeDiff = timeDifference(beginDay, new Date().setHours(getHour(start), getMin(start), 0, 0));
        var offset = Math.max((100 / hours) * timeDiff, 0);

        var timeDiff = timeDifference(new Date().setHours(getHour(start), getMin(start), 0, 0), new Date().setHours(getHour(end), getMin(end), 0, 0));
        var height = (100 / hours) * timeDiff;

        var dateBlock = $('ul.dates li[data-date="'+date+'"] .reservations');
        var reservationBlock = '<div data-start="'+start+'" data-end="'+end+'">'+getTime(start)+' - '+getTime(end)+'</div>';
        dateBlock.append(reservationBlock);
        var rObj = $('ul.dates li[data-date="'+date+'"] div[data-start="'+start+'"]');
        rObj.css('top', 'calc(' + offset + '% )');
        rObj.css('height', 'calc(' + height + '%)');
    }

    // Get monday for the current week
    function getMonday(d) {
        d = new Date(d);
        var day = d.getDay();
        var diff = d.getDate() - day + (day == 0 ? -6:1);
        return new Date(d.setDate(diff));
    }

    function addDays(d, qty) {
        var newDate = new Date(d.getTime()); // Copy date
        newDate.setDate(d.getDate() + qty);
        return newDate;
    }

    // Draw next visible days
    function drawDates() {
        var start = getMonday(new Date());
        var d = new Date();
        for (var i = 0; i < nextDays; i++) {
            d = addDays(start, i);
            var stamp = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
            $('ul.dates').append('<li data-date="'+stamp+'" data-day="'+d.getDay()+'"><span>'+d.getDate() + '/' + (d.getMonth() + 1) +'</span><section class="reservations"></span></li>');
        }
    }

    // Draw weekdays
    function drawWeekdays() {
        for (var i = 0; i < 7; i++) {
            $('ul.weekdays').append('<li>'+weekdayNames[(i + 1) % 7]+'</li>');
        }
    }

    // Retreive JSON reservations from server
    function drawReservations() {
        $.getJSON(url, function(data) {
            $.each(data['data'], function(key, val) {
                $.each(val['slots'], function(k, r) {
                    drawReservation(val['date'], r['start'], r['end']);
                });
            });
        });
    }

    // Redraw current time marker
    setInterval(function(){
        var now = new Date().toString();
        var open = new Date().setHours(0, 0, 0, 0);
        var curDiff =  timeDifference(open, now);
        var curTimeOffset = (100 / hours) * curDiff;
        $('.currentTimeMarker').css('top', curTimeOffset + '%');
    }, 1000);

    drawWeekdays();
    drawDates();
    drawReservations();

});