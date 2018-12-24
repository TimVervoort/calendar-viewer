class SimpleCalendar {

    constructor(settings) {

        if (!settings.id) {
            console.log('Error: no calendar id provided.');
        }

        if (!settings.url) {
            console.log('Error: no calendar url provided.');
        }

        // Settings
        this.calendarId = settings.id;
        this.url = settings.url;
        this.hours = (settings.hours === undefined) ? '24' : settings.hours;
        this.nextDays = (settings.nextDays === undefined) ? '60' : settings.nextDays;
        this.redrawTimeInt = (settings.redrawTimeInt === undefined) ? '1O' : settings.redrawTimeInt;
        this.todayName = (settings.todayName === undefined) ? 'today' : settings.todayName;
        this.tomorrowName = (settings.tomorrowName === undefined) ? 'tomorrow' : settings.tomorrowName;
        this.weekdayNames = (settings.weekdayNames === undefined) ? ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] : settings.weekdayNames;

        // Helpers
        this.beginDay = new Date().setHours(0, 0, 1, 0);  
        this.currentWeek = 0;
        this.dateHelper = new DateHelper();
        this.init();

    }

    init() {
        var t = this;
        t.drawHours();
        t.drawWeekdays();
        t.drawDates();
        t.addNavigationListeners();     
        t.drawReservations();
        t.redrawCurrent();
        setInterval(function(){
            t.redrawCurrent();
        }, t.redrawTimeInt * 1000);
    }

    addNavigationListeners() {
        var t = this;
        document.onkeydown = function(e) {
            switch (e.keyCode) {
                case 37:
                    t.prevWeek();
                    break;
                case 39:
                    t.nextWeek();
                    break;
            }
        };
    }

    nextWeek() {
        this.currentWeek++;
        document.getElementById('dates').scrollLeft = (window.innerWidth - 50) * this.currentWeek;
    }
    
    prevWeek() {
        this.currentWeek--;
        document.getElementById('dates').scrollLeft = (window.innerWidth - 50) * this.currentWeek;
    }  
    
    redrawCurrent() {
        if (!document.getElementById('currentMarker')) {
            document.getElementById(this.calendarId).innerHTML += '<div id="currentMarker"></div>';
        }
        var d = new Date();
        var now = d.toString();
        var open = new Date().setHours(0, 0, 0, 0);
        var curDiff =  this.dateHelper.difference(open, now);
        var curOffset = curDiff / this.hours;
        var weekday = (d.getDay() - 1) % 7;
        document.getElementById('currentMarker').style.top = 'calc((100% - 80px) * ' + curOffset + ' + 80px)';
        document.getElementById('currentMarker').style.left = 'calc((100% / 7) * ' + weekday + ' + 50px)';
    }

    drawReservations() {
        var t = this;
        $.getJSON(this.url, function(data) {
            $.each(data['data'], function(key, val) {
                $.each(val['slots'], function(k, r) {
                    t.drawReservation(val['date'], r['start'], r['end']);
                });
            });
        });
    }

    drawHours() {
        if (!document.getElementById('times')) {
            document.getElementById(this.calendarId).innerHTML += '<ul id="times"></div>';
        }
        for (var i = 0; i < this.hours; i++) {
            var h = '0' + i;
            document.getElementById('times').innerHTML += '<li data-hour="'+i+'">' + h.slice(-2) + ':00</li>';
        }
    }

    drawWeekdays() {
        if (!document.getElementById('weekdays')) {
            document.getElementById(this.calendarId).innerHTML += '<ul id="weekdays"></ul>';
        }
        for (var i = 0; i < 7; i++) {
            document.getElementById('weekdays').innerHTML += '<li>' + this.weekdayNames[(i + 1) % 7] + '</li>';
        }
    }

    drawDates() {
        if (!document.getElementById('dates')) {
            document.getElementById(this.calendarId).innerHTML += '<ul id="dates"></ul>';
        }
        var start = this.dateHelper.getMonday(new Date());
        var d = new Date();
        for (var i = 0; i < this.nextDays; i++) {
            d = this.dateHelper.addDays(start, i);
            var stamp = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
            document.getElementById('dates').innerHTML += '<li data-date="' + stamp + '" data-day="' + d.getDay() + '"><span>' + d.getDate() + '/' + (d.getMonth() + 1) + '</span><section class="reservations"></span></li>';
        }
    }

    drawReservation(date, start, end) {
        if (!date || !start || !end) { return; }
        var d = this.dateHelper.difference(this.beginDay, new Date().setHours(this.dateHelper.getHour(start), this.dateHelper.getMin(start), 0, 0));
        var offset = Math.max((100 / this.hours) * d, 0);
        var d = this.dateHelper.difference(new Date().setHours(this.dateHelper.getHour(start), this.dateHelper.getMin(start), 0, 0), new Date().setHours(this.dateHelper.getHour(end), this.dateHelper.getMin(end), 0, 0));
        var height = (100 / this.hours) * d;
        var dateBlock = $('ul#dates li[data-date="' + date + '"] .reservations');
        var reservationBlock = '<div data-start="' + start + '" data-end="' + end + '">' + this.dateHelper.get(start) + ' - ' + this.dateHelper.get(end) + '</div>';
        dateBlock.append(reservationBlock);
        var rObj = $('ul#dates li[data-date="' + date + '"] div[data-start="' + start + '"]');
        rObj.css('top', 'calc(' + offset + '% )');
        rObj.css('height', 'calc(' + height + '%)');
    }

}

class DateHelper {

    constructor() {

    }

    addDays(d, qty) {
        var newDate = new Date(d.getTime()); // Copy date
        newDate.setDate(d.getDate() + qty);
        return newDate;
    }

    getMonday(d) {
        d = new Date(d);
        var day = d.getDay();
        var diff = d.getDate() - day + (day == 0 ? -6:1);
        return new Date(d.setDate(diff));
    }

    difference(a, b) {
        var msPerMinute = 60 * 1000;
        var msPerHour = msPerMinute * 60;
        var elapsed = new moment(b) - new moment(a);
        return elapsed / msPerHour;
    }
    
    getHour(date) {
        return date.split(' ')[1].split(':')[0];
    }

    getMin(date) {
        return date.split(' ')[1].split(':')[1];
    }

    get(date) {
        return this.getHour(date) + ':' + this.getMin(date);
    }

}