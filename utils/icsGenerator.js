import { format, parse, addDays } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

const generateICS = (courses, semesterStart, semesterEnd) => {
  const dayMap = {
    'Monday': 'MO',
    'Tuesday': 'TU',
    'Wednesday': 'WE',
    'Thursday': 'TH',
    'Friday': 'FR',
    'Saturday': 'SA',
    'Sunday': 'SU'
  };

  const formatDate = (date) => format(date, "yyyyMMdd'T'HHmmss'Z'");

  const parseTime = (time) => {
    // This regex will match various time formats including "1:30p", "1:30 PM", "13:30"
    const match = time.match(/(\d{1,2}):(\d{2})\s*(([AaPp])\.?[Mm]?\.?)?/);
    if (!match) throw new Error(`Invalid time format: ${time}`);

    let [, hours, minutes, , period] = match;
    hours = parseInt(hours, 10);
    minutes = parseInt(minutes, 10);

    // Convert to 24-hour format if necessary
    if (period) {
      const isPM = period.toLowerCase().startsWith('p');
      if (isPM && hours !== 12) hours += 12;
      if (!isPM && hours === 12) hours = 0;
    }

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  // Ensure semesterStart and semesterEnd are properly formatted
  const formatSemesterDate = (date) => {
    if (date instanceof Date) {
      return format(date, 'yyyy-MM-dd');
    }
    return date;  // Assume it's already a string in 'yyyy-MM-dd' format
  };

  const formattedSemesterStart = formatSemesterDate(semesterStart);
  const formattedSemesterEnd = formatSemesterDate(semesterEnd);

  const events = courses.flatMap(course => {
    const { code, title, days, startTime, endTime } = course;
    return days.map(day => {
      const dayIndex = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(day);
      let courseStart = parse(formattedSemesterStart, 'yyyy-MM-dd', new Date());
      courseStart = addDays(courseStart, (7 + dayIndex - courseStart.getDay()) % 7);

      const dtstart = parse(`${format(courseStart, 'yyyy-MM-dd')} ${parseTime(startTime)}`, 'yyyy-MM-dd HH:mm', new Date());
      const dtend = parse(`${format(courseStart, 'yyyy-MM-dd')} ${parseTime(endTime)}`, 'yyyy-MM-dd HH:mm', new Date());
      const rruleEnd = parse(formattedSemesterEnd, 'yyyy-MM-dd', new Date());
      rruleEnd.setHours(23, 59, 59);

      return [
        'BEGIN:VEVENT',
        `UID:${uuidv4()}`,
        `DTSTAMP:${formatDate(new Date())}`,
        `SUMMARY:${title} (${code})`,
        `DTSTART:${formatDate(dtstart)}`,
        `DTEND:${formatDate(dtend)}`,
        `RRULE:FREQ=WEEKLY;BYDAY=${dayMap[day]};UNTIL=${formatDate(rruleEnd)}`,
        'BEGIN:VALARM',
        'TRIGGER:-PT10M',
        'ACTION:DISPLAY',
        'DESCRIPTION:Reminder',
        'END:VALARM',
        'END:VEVENT'
      ].join('\r\n');
    });
  }).join('\r\n');

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Your Organization//Your Product//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    events,
    'END:VCALENDAR'
  ].join('\r\n');

  return icsContent;
};

export default generateICS;