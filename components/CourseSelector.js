import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import styles from '../styles/CourseSelector.module.css';
import courses from '../public/csvjson.json';

const parseDayAndTime = (classTime) => {
  const daysMap = { 'M': 'Monday', 'T': 'Tuesday', 'W': 'Wednesday', 'Th': 'Thursday', 'F': 'Friday', 'S': 'Saturday', 'Su': 'Sunday'};
  const [days, time] = classTime.split(' ');
  const [startTime, endTime] = time.split('-');

  return {
    days: days.split(/(?=[A-Z])/).map(day => daysMap[day] || day),
    startTime: startTime,
    endTime: endTime
  };
};

const generateColor = (id) => {
  const colors = ['#ffb3ba', '#ffdeb8', '#ffffb8', '#b8e0ff', '#ffc7ff'];
  return colors[id % colors.length];
};

export default function CourseSelector({ addCourse }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [colorMap, setColorMap] = useState({});

  useEffect(() => {
    const newColorMap = { ...colorMap };
    courses.forEach(course => {
      if (!newColorMap[course['Course Code']]) {
        newColorMap[course['Course Code']] = generateColor(Object.keys(newColorMap).length);
      }
    });
    setColorMap(newColorMap);
  }, [courses]);

  const handleAddCourse = (course) => {
    const { days, startTime, endTime } = parseDayAndTime(course['Class Time']);
    const courseWithId = {
      id: uuidv4(),
      code: course['Course Code'],
      title: course['Course Title'],
      credits: parseInt(course['Credit'], 10),
      days,
      startTime,
      endTime,
      instructor: course['Instructor']
    };
    addCourse(courseWithId);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredCourses = courses.filter(course =>
    course['Course Title'].toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.courseSelector}>
      <input
        type="text"
        placeholder="Search by course name"
        value={searchTerm}
        onChange={handleSearch}
        className={styles.searchBar}
      />
      {filteredCourses.map(course => (
        <div
          key={uuidv4()}
          className={styles.courseBox}
          onClick={() => handleAddCourse(course)}
          style={{ backgroundColor: colorMap[course['Course Code']] }}
        >
          <div><strong>{course['Course Title']}</strong></div>
          <div>Code: {course['Course Code']}</div>
          <div>Credits: {course['Credit']}</div>
          <div>Time: {course['Class Time']}</div>
          <div>Instructor: {course['Instructor']}</div>
        </div>
      ))}
    </div>
  );
}
