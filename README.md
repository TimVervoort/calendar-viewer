# calendar-viewer
Google Calendar like JSON calendar viewer in browser. The JSON format is described in [https://www.github.com/timvervoort/ical-viewer](github.com/timvervoort/ical-viewer).

# How to use
The simple calendar plugin needs `moment.js` to function. Include the following scripts in your HTML:
```html
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.23.0/moment.min.js"></script>
<script type="text/javascript" src="js/calendar.js"></script>
```

Default styles for the calendar are present in `styles.css`.

Create a DOM object with an ID. Pass the ID from that object and the url to a JSON calendar to the SimpleCalendar constructor to generate a calendar. These parameters are required.
```html
<div class="calendar" id="demo"></div>
<script type="text/javascript">
    var calendar = new SimpleCalendar({
        id: 'demo',
        url: 'https://www.example.org/path/to/json/output'
    });
</script>
```

## Optional parameters
hours
: Define the amount of hours in a day. Can be 12 or 24. The default setting is `24`. This function is not ready yet. (positive Integer)

nextDays
: Defines the amount of days to display, start counting from monday the current week. The default setting is `60` days. (positive Integer)

redrawTimeInt
: The amount of seconds to redraw the current time marking. The default setting is `10` seconds. (positive Float)

todayName
: A readable label for today. The default value is `today`. Another example could be 'vandaag' (today in Dutch). (String)

tomorrowName
: A readable label for today. The default value is `tomorrow`. Another example could be 'morgen' (tomorrow in Dutch). (String)

weekdayNames
: Readable labels for weekdays, starting from sunday. The default value is `['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']`. Another example could be `['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag']`. (array of Strings)

# Working demo
```html
<!DOCTYPE html>
<html lang="nl">
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <title>Calendar Viewer</title>
        <link type="text/css" rel="stylesheet" href="css/styles.css" />
        <link type="text/css" rel="stylesheet" href="css/calendar.css" />
    </head>
    <body>

        <div class="calendar" id="demo-calendar"></div>
        
        <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.23.0/moment.min.js"></script>
        <script type="text/javascript" src='https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js'></script>
        <script type="text/javascript" src="js/calendar.js"></script>
        <script type="text/javascript">
            var calendar = new SimpleCalendar({
                id: 'demo-calendar',
                url: 'https://www.timvervoort.com/api/agenda/',
                todayName: 'vandaag',
                tomorrowName: 'morgen',
                weekdayNames: ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag']
            });
        </script>

    </body>
</html>
```