class SimpleCalendar {

    constructor(settings) {

        // Get required settings
        if (!settings.id) {
            console.log('%cError: no calendar id provided.', 'background-color:#dc3545;color:#fff;font-size:14px;padding:6px;border-radius:4px;');
        }

        if (!settings.url) {
            console.log('%cError: no calendar url provided.', 'background-color:#dc3545;color:#fff;font-size:14px;padding:6px;border-radius:4px;');
        }

        this.calendarId = settings.id;
        this.url = settings.url;

        // Optional settings
        this.hours = (settings.hours === undefined) ? '24' : settings.hours;
        this.nextDays = (settings.nextDays === undefined) ? '60' : settings.nextDays;
        this.redrawTimeInt = (settings.redrawTimeInt === undefined) ? '10' : settings.redrawTimeInt;
        this.todayName = (settings.todayName === undefined) ? 'today' : settings.todayName;
        this.tomorrowName = (settings.tomorrowName === undefined) ? 'tomorrow' : settings.tomorrowName;
        this.weekdayNames = (settings.weekdayNames === undefined) ? ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] : settings.weekdayNames;
        this.loadingText = (settings.loadingText === undefined) ? 'Loading events...' : settings.loadingText;
        // Helpers
        this.beginDay = new Date().setHours(0, 0, 1, 0);  
        this.currentWeek = 0;
        this.dateHelper = new DateHelper();
        this.init();

    }

    /**
     * Initialize calendar. Draw needed objects, start listeners and fetch events.
     */
    init() {
        document.getElementById(this.calendarId).innerHTML += '<div id="loading">' + this.loadingText + '</div>';
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
        console.log('%cCalendar ready!', 'background-color:#28a745;color:#fff;font-size:14px;padding:6px;border-radius:4px;');
    }

    /**
     * Listen to mouse, touch and keyboard actions to navigate calendar.
     */
    addNavigationListeners() {

        var t = this;

        // Keyboard navigation
        document.onkeydown = function(e) {
            switch (e.keyCode) {
                case 37: // Left arrow
                    t.prevWeek();
                    break;
                case 39: // Right arrow
                    t.nextWeek();
                    break;
            }
        };

        // Slide navigation using touch swiping
        var touchstartX = 0;
        var touchendX = 0;
        var gestureZone = document.getElementById(this.calendarId);

        // Listen to touch start
        gestureZone.addEventListener('touchstart', function(e) {
            touchstartX = event.changedTouches[0].screenX;
        }, false);

        // Listen to touch end
        gestureZone.addEventListener('touchend', function(e) {
            touchendX = event.changedTouches[0].screenX;
            handleGesture();
        }, false); 

        // Deterimine touch gesture direction
        function handleGesture() {
            if (touchendX <= touchstartX) { // Slide to left, go to next image
                t.nextWeek();
            }
            if (touchendX >= touchstartX) { // Slide to right, go to previous image
                t.prevWeek();
            }
        }

        // Click to make reservations
        document.addEventListener('click', function(e) {
            var top = ((e.pageY - 80) / (document.body.scrollHeight - 80)) * 100;
            var height = 100 / t.hours;
            e.toElement.innerHTML += '<div style="top:'+top+'%;height:'+height+'%">New reservation</div>';
        });

    }

    /**
     * Only show the current time marker on the current week, hide it in the other weeks.
     * Assuming the currentMarker object exists.
     */
    toggleCurrent() {
        this.initCurrent();
        if (this.currentWeek !== 0) { document.getElementById('currentMarker').style.opacity = 0; }
        else { document.getElementById('currentMarker').style.opacity = 1; }
    }

    /**
     * Create current time marker if it doesn't exist already.
     */
    initCurrent() {
        if (!document.getElementById('currentMarker')) {
            document.getElementById(this.calendarId).innerHTML += '<div id="currentMarker"></div>';
        }
    }

    /**
     * Display next week.
     */
    nextWeek() {
        if (this.currentWeek >= this.nextDays / 7 - 1) { return; } // No more days provided
        this.currentWeek++;
        document.getElementById('dates').scrollLeft = (window.innerWidth - 50) * this.currentWeek;
        this.toggleCurrent(); // Check if current time marker is needed
    }
    
    /**
     * Display previous week.
     */
    prevWeek() {
        if (this.currentWeek <= 0) { return; } // Can't go back in time
        this.currentWeek--;
        document.getElementById('dates').scrollLeft = (window.innerWidth - 50) * this.currentWeek;
        this.toggleCurrent(); // Check if current time marker is needed
    }  
    
    /**
     * Redraw the current time marker to encoporate time passing.
     */
    redrawCurrent() {        
        this.initCurrent(); // Create current time marker if it doesn't exist already
        var d = new Date(); // Get current time
        var now = d.toString();
        var open = new Date().setHours(0, 0, 0, 0); // Get the first second of today
        var curDiff =  this.dateHelper.difference(open, now); // Hour difference between now and first second of today
        var curOffset = curDiff / this.hours;
        var weekday = (d.getDay() + 6) % 7; // Determine the day
        document.getElementById('currentMarker').style.top = 'calc((100% - 80px) * ' + curOffset + ' + 80px)';
        document.getElementById('currentMarker').style.left = 'calc(((100% - 50px) / 7) * ' + weekday + ' + 50px)';
    }

    /**
     * Get JSON reservations from server and draw them in the calendar.
     */
    drawReservations() {
        var t = this; // Because this is overriden in the function below
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                var data = JSON.parse(this.responseText).data;
                for (var day = 0; day < data.length; day++) {
                    for (var slot = 0; slot < data[day].slots.length; slot++) {
                        var reservation = data[day].slots[slot];
                        t.drawReservation(data[day].date, reservation.start, reservation.end);
                    }
                }
                document.getElementById('loading').style.opacity = '0'; // Hide loading message
            }
        };
        xmlhttp.open("GET", this.url, true);
        xmlhttp.send();
    }

    /**
     * Draw hour marks.
     */
    drawHours() {
        if (!document.getElementById('times')) {
            document.getElementById(this.calendarId).innerHTML += '<ul id="times"></div>';
        }
        for (var i = 0; i < this.hours; i++) {
            var h = '0' + i;
            document.getElementById('times').innerHTML += '<li data-hour="'+i+'">' + h.slice(-2) + ':00</li>';
        }
    }

    /**
     * Draw weekday names.
     */
    drawWeekdays() {
        if (!document.getElementById('weekdays')) {
            document.getElementById(this.calendarId).innerHTML += '<ul id="weekdays"></ul>';
        }
        for (var i = 0; i < 7; i++) {
            document.getElementById('weekdays').innerHTML += '<li>' + this.weekdayNames[(i + 1) % 7] + '</li>';
        }
    }

    /**
     * Draw all possible future dates.
     */
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

    /**
     * Draw a new reservation in the calendar.
     * @param {String} date : YYYY-MM-DD
     * @param {String} start : YYYY-MM-DD HH:MM:SS
     * @param {String} end : YYYY-MM-DD HH:MM:SS
     */
    drawReservation(date, start, end) {
        if (!date || !start || !end) { return; }
        var d = this.dateHelper.difference(this.beginDay, new Date().setHours(this.dateHelper.getHour(start), this.dateHelper.getMin(start), 0, 0));
        var offset = Math.max((100 / this.hours) * d, 0);
        var d = this.dateHelper.difference(new Date().setHours(this.dateHelper.getHour(start), this.dateHelper.getMin(start), 0, 0), new Date().setHours(this.dateHelper.getHour(end), this.dateHelper.getMin(end), 0, 0));
        var height = (100 / this.hours) * d;
        var dateBlock = document.querySelector('ul#dates li[data-date="' + date + '"] .reservations');
        if (!dateBlock) { return; } // Date does not exist
        dateBlock.innerHTML += '<div data-start="' + start + '" data-end="' + end + '">' + this.dateHelper.get(start) + ' - ' + this.dateHelper.get(end) + '</div>';
        var rObj = document.querySelector('ul#dates li[data-date="' + date + '"] div[data-start="' + start + '"]');
        rObj.style.top = 'calc(' + offset + '% )';
        rObj.style.height = 'calc(' + height + '%)';
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