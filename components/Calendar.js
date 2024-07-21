import React, { useEffect, useState } from 'react';
import styles from '../styles/Calendar.module.css';

const hours = Array.from({ length: 12 }, (_, i) => i + 7);
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const parseTime = (time) => {
  const [hourMin, period] = time.split(/(?=[APap][mM])/);
  let [hour, minute] = hourMin.split(':').map(Number);
  if (/PM/i.test(period) && hour !== 12) hour += 12;
  if (/AM/i.test(period) && hour === 12) hour = 0;
  return hour + minute / 60;
};

const formatTime = (time) => {
  const hours = Math.floor(time);
  const minutes = Math.round((time % 1) * 60);
  const period = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  return `${formattedHours}:${minutes.toString().padStart(2, '0')}${period}`;
};

const getOverlappingGroups = (courses, day) => {
  const dayCourses = courses.filter(course => course.days.includes(day));
  const overlaps = [];
  dayCourses.forEach(course => {
    const overlappingCourses = overlaps.find(group =>
      group.some(c => parseTime(c.startTime) < parseTime(course.endTime) &&
                      parseTime(c.endTime) > parseTime(course.startTime))
    );
    if (overlappingCourses) {
      overlappingCourses.push(course);
    } else {
      overlaps.push([course]);
    }
  });
  return overlaps;
};

const generateColor = (id) => {
  const colors = ['#ffb3ba', '#ffdeb8', '#ffffb8', '#b8e0ff', '#ffc7ff'];
  return colors[id % colors.length];
};

export default function Calendar({ courses, removeCourse }) {
  const [colorMap, setColorMap] = useState({});

  useEffect(() => {
    const newColorMap = { ...colorMap };
    courses.forEach(course => {
      if (!newColorMap[course.id]) {
        newColorMap[course.id] = generateColor(Object.keys(newColorMap).length);
      }
    });
    setColorMap(newColorMap);
  }, [courses]);

  return (
    <div className={styles.calendarContainer}>
      <div className={styles.header}>
        <div className={styles.timeColumn}></div>
        {days.map(day => (
          <div key={day} className={styles.dayColumn}>{day}</div>
        ))}
      </div>
      <div className={styles.body}>
        {hours.map((hour) => (
          <React.Fragment key={hour}>
            <div className={styles.timeColumn}>{formatTime(hour)}</div>
            {days.map(day => (
              <div key={`${day}-${hour}`} className={styles.cell}>
                {getOverlappingGroups(courses, day).flatMap((group, groupIdx, groups) =>
                  group.map((course, idx) => {
                    const startTime = parseTime(course.startTime);
                    const endTime = parseTime(course.endTime);
                    const top = (startTime - hour) * 60;
                    const height = (endTime - startTime) * 60;
                    const fontSize = 14 / group.length + 'px';

                    return (
                      <div
                        key={course.id}
                        className={styles.course}
                        style={{
                          top: `${top}px`,
                          height: `${height}px`,
                          width: `calc(${100 / group.length}% - 10px)`,
                          left: `calc(${(100 / group.length) * idx}% + 5px)`,
                          fontSize: fontSize,
                          backgroundColor: colorMap[course.id],
                        }}
                        onClick={() => {}}
                      >
                        <div className={styles.courseContent}>
                          <div className={styles.courseCode}>{course.code}</div>
                          <div className={styles.courseTime}>{course.startTime} - {course.endTime}</div>
                        </div>
                        <button
                          className={styles.removeButton}
                          onClick={(e) => { e.stopPropagation(); removeCourse(course.id); }}
                        >
                          ×
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
