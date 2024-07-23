import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import styles from '../styles/CourseSelector.module.css';
import courses from '../public/csvjson.json';

const parseDayAndTime = (days, startTime, endTime) => {
  const daysMap = { 'M': 'Monday', 'T': 'Tuesday', 'W': 'Wednesday', 'R': 'Thursday', 'F': 'Friday', 'S': 'Saturday', 'U': 'Sunday' };
  return {
    days: days.split('').map(day => daysMap[day] || day),
    startTime,
    endTime
  };
};

const generateColor = () => {
  const colors = ['#ffb3ba', '#ffdeb8', '#ffffb8', '#b8e0ff', '#ffc7ff'];
  return colors[Math.floor(Math.random() * colors.length)];
};

export default function CourseSelector({ addCourse }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [colorMap, setColorMap] = useState({});

  useEffect(() => {
    const newColorMap = { ...colorMap };
    courses.sort(() => Math.random() - 0.5).forEach(course => {
      if (!newColorMap[course['Course Code']]) {
        newColorMap[course['Course Code']] = generateColor();
      }
    });
    setColorMap(newColorMap);
  }, [courses]);

  const handleAddCourse = (course) => {
    const { days, startTime, endTime } = parseDayAndTime(course['Days'], course['Start Time'], course['End Time']);
    const courseWithId = {
      id: uuidv4(),
      code: course['Course Code'],
      title: course['Course Title'],
      credits: parseInt(course['Credit Hrs'], 10),
      days,
      startTime,
      endTime,
      instructor: course['Instructor'],
      section: course['Section']
    };
    addCourse(courseWithId);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredCourses = courses.filter(course =>
    course['Course Title'].toLowerCase().includes(searchTerm.toLowerCase()) ||
    course['Course Code'].toLowerCase().includes(searchTerm.toLowerCase()) ||
    course['Instructor'].toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.courseSelector}>
      <input
        type="text"
        placeholder="Search by name/code/instructor"
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
          <div>Section: {course['Section']}</div> {/* Added this line */}
          <div>Credits: {course['Credit Hrs']}</div>
          <div>Days: {course['Days'].split('').map(day => parseDayAndTime(day, '', '').days[0]).join(', ')}</div>
          <div>Time: {course['Start Time']} - {course['End Time']}</div>
          <div>Instructor: {course['Instructor']}</div>
        </div>
      ))}
    </div>
  );
}
