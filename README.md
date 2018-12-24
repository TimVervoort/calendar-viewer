# calendar-viewer
Google Calendar like JSON calendar viewer in browser. The JSON format is described in `github.com/timvervoort/ical-viewer`.

# How to use
The SimpleCalendar plugin needs jQuery and moment to function. Include the following scripts in your HTML:
```html
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.23.0/moment.min.js"></script>
<script type="text/javascript" src='https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js'></script>
<script type="text/javascript" src="js/calendar.js"></script>
```

Default styles for the calendar are present in `styles.css`.

Create a DOM object with an ID. Pass the ID from that object and the url to a JSON calendar to the SimpleCalendar constructor to generate a calendar.
```html
<div class="calendar" id="demo"></div>
<script type="text/javascript">
    var calendar = new SimpleCalendar({
        id: 'demo',
        url: 'https://www.example.org/path/to/json/output'
    });
</script>
```

# TODO
- Remove jQuery from the project.
- Limit calendar navigation.
- Draw current time only on the current day, even when navigating.