import { v4 as uuidv4 } from 'uuid';

const formatDate = (date) => {
  if (isNaN(date.getTime())) {
    throw new Error('Invalid Date');
  }
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

const getDayOffset = (day) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days.indexOf(day);
};

const generateICS = (courses, startDate, endDate) => {
  if (isNaN(new Date(startDate).getTime()) || isNaN(new Date(endDate).getTime())) {
    throw new Error('Invalid start or end date');
  }

  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Chronos LUMS//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ];

  const semesterStart = new Date(startDate);
  const semesterEnd = new Date(endDate);

  courses.forEach(course => {
    course.days.forEach(day => {
      const dayOffset = getDayOffset(day);
      const eventStart = new Date(semesterStart);
      eventStart.setDate(eventStart.getDate() + (dayOffset - semesterStart.getDay() + 7) % 7);

      const [startHour, startMinute] = course.startTime.split(':').map(Number);
      eventStart.setHours(startHour, startMinute, 0);

      const eventEnd = new Date(eventStart);
      const [endHour, endMinute] = course.endTime.split(':').map(Number);
      eventEnd.setHours(endHour, endMinute, 0);

      if (isNaN(eventStart.getTime()) || isNaN(eventEnd.getTime())) {
        throw new Error('Invalid event date or time');
      }

      const event = [
        'BEGIN:VEVENT',
        `UID:${uuidv4()}`,
        `DTSTAMP:${formatDate(new Date())}`,
        `DTSTART:${formatDate(eventStart)}`,
        `DTEND:${formatDate(eventEnd)}`,
        `SUMMARY:${course.code} - ${course.title}`,
        `LOCATION:${course.location || 'TBA'}`,
        `DESCRIPTION:Instructor: ${course.instructor}`,
        `RRULE:FREQ=WEEKLY;UNTIL=${formatDate(semesterEnd)}`,
        'BEGIN:VALARM',
        'ACTION:DISPLAY',
        'DESCRIPTION:Class Reminder',
        'TRIGGER:-PT10M',
        'END:VALARM',
        'END:VEVENT'
      ];

      icsContent = icsContent.concat(event);
    });
  });

  icsContent.push('END:VCALENDAR');
  return icsContent.join('\r\n');
};

export const generateICSLink = (courses, startDate, endDate) => {
  try {
    const icsData = generateICS(courses, startDate, endDate);
    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error generating ICS link:', error);
    return null;
  }
};
