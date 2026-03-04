const { parseISO, isSameDay, getHours, startOfWeek, addDays } = require('date-fns');
const { utcToZonedTime, format } = require('date-fns-tz');

const currentWeek = new Date('2026-03-03T12:00:00-05:00'); 
const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

const lessons = [
  { scheduled_start: '2026-03-02T16:30:00Z' }, 
  { scheduled_start: '2026-03-04T22:00:00Z' }  
];

console.log("WeekDays:");
weekDays.forEach(d => console.log(d));

console.log("\nParsing direct parseISO:");
for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
  let targetDate = weekDays[dayIdx];
  for (let hour = 8; hour <= 21; hour++) {
    const hits = lessons.filter((lesson) => {
      const lessonUserDate = parseISO(lesson.scheduled_start); // parseISO ignores local timezone info when there is a 'Z', wait, no, it creates a Date object. Date object's .getHours() returns LOCAL time hours!
      return isSameDay(lessonUserDate, targetDate) && getHours(lessonUserDate) === hour;
    });
    if (hits.length > 0) {
      console.log(`Found lesson on day ${dayIdx} at local hour ${hour}.`);
    }
  }
}
