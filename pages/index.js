import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Calendar from '../components/Calendar';
import CourseSelector from '../components/CourseSelector';
import styles from '../styles/Home.module.css';
import { saveCourses, loadCourses } from '../utils/indexedDB';
import generateICS from '../utils/icsGenerator';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [showCourseSelector, setShowCourseSelector] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [semesterStart, setSemesterStart] = useState(null);
  const [semesterEnd, setSemesterEnd] = useState(null);
  const [showSyncModule, setShowSyncModule] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const savedCourses = await loadCourses();
        setCourses(savedCourses);
      } catch (error) {
        console.error('Error loading courses:', error);
      }
    };
    fetchCourses();
  }, []);

  const addCourse = (course) => {
    const overlapping = courses.some(c =>
      c.days.some(day => course.days.includes(day)) &&
      ((parseTime(c.startTime) < parseTime(course.endTime) &&
        parseTime(c.endTime) > parseTime(course.startTime)))
    );

    setCourses(prevCourses => {
      const updatedCourses = [...prevCourses, course];
      saveCourses(updatedCourses).catch(error => console.error('Error saving courses:', error));
      if (overlapping) {
        setPopupMessage('Course added with an overlapping time conflict.');
      } else {
        setPopupMessage('Course added successfully!');
      }
      setTimeout(() => setPopupMessage(''), 3000);
      return updatedCourses;
    });
  };

  const removeCourse = (id) => {
    setCourses(prevCourses => {
      const updatedCourses = prevCourses.filter(course => course.id !== id);
      saveCourses(updatedCourses).catch(error => console.error('Error saving courses:', error));
      return updatedCourses;
    });
  };

  const toggleCourseSelector = () => {
    setShowCourseSelector(!showCourseSelector);
  };

  const toggleSyncModule = () => {
    setShowSyncModule(!showSyncModule);
  };

  const handleSync = () => {
    if (semesterStart && semesterEnd && courses.length > 0) {
      const icsContent = generateICS(courses, semesterStart, semesterEnd);
      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'fall24_schedule.ics';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setShowSyncModule(false);
    } else {
      setPopupMessage('Please ensure you have set semester dates and added courses.');
      setTimeout(() => setPopupMessage(''), 3000);
    }
  };

  const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0);

  return (
    <div className={styles.container}>
      <Head>
        <title>Chronos.LUMS</title>
      </Head>
      <div className={styles.header}>
        <a 
          href="https://www.linkedin.com/in/ahmadumarfarooq/" 
          target="_blank" 
          rel="noopener noreferrer" 
          className={styles.linkedinLink}
        >
          <img 
            src="/neww.png" 
            alt="LinkedIn" 
            className={styles.linkedinImg}
          />
        </a>
        <div className={styles.headerText}>
          Chronos - LUMS Course Scheduler
        </div>
      </div>
      <main className={styles.main}>
        <div className={styles.content}>
          <div className={styles.calendarContainer}>
            <div className={`${styles.calendarWrapper} ${showCourseSelector ? styles.blur : ''}`}>
              <Calendar courses={courses} removeCourse={removeCourse} />
            </div>
            {showCourseSelector && (
              <div className={styles.selectorWrapper}>
                <CourseSelector addCourse={addCourse} />
              </div>
            )}
          </div>
        </div>
        <button className={styles.toggleButton} onClick={toggleCourseSelector}>
          {showCourseSelector ? '-' : '+'}
        </button>
        <div className={styles.statusOverlay}>
          <p>Credits: {totalCredits} ✌️</p>
          <p>Courses: {courses.length} 🎓</p>
        </div>
        <button onClick={toggleSyncModule} className={styles.syncButton}>
          Sync to device 📅
        </button>
        {showSyncModule && (
          <div className={styles.syncModule}>
            <h3>Set Semester Dates</h3>
            <DatePicker
              selected={semesterStart}
              onChange={date => setSemesterStart(date)}
              selectsStart
              startDate={semesterStart}
              endDate={semesterEnd}
              placeholderText="Semester Start Date"
              className={styles.datePicker}
              dateFormat="dd/MM/yyyy"
              onFocus={e => e.target.blur()}
            />
            <DatePicker
              selected={semesterEnd}
              onChange={date => setSemesterEnd(date)}
              selectsEnd
              startDate={semesterStart}
              endDate={semesterEnd}
              minDate={semesterStart}
              placeholderText="Semester End Date"
              className={styles.datePicker}
              dateFormat="dd/MM/yyyy"
              onFocus={e => e.target.blur()}
            />
            <button onClick={handleSync} className={styles.syncConfirmButton}>Confirm Sync</button>
            <button onClick={toggleSyncModule} className={styles.syncCancelButton}>Cancel</button>
          </div>
        )}
        {popupMessage && (
        <div className={`${styles.popup} ${
          popupMessage.includes('conflict') || popupMessage.includes('Please ensure') 
            ? styles.popupError 
            : styles.popupSuccess
        }`}>
          {popupMessage}
        </div>
      )}
        <div className={styles.feedbackSection}>
          <span>💌 Drop feedback at: </span>
          <a 
            href="https://www.linkedin.com/feed/update/urn:li:activity:7220915168069767168/" 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.linkedinLink}
          >
            <img 
              src="/linkedin.png" 
              alt="LinkedIn Feedback" 
              className={styles.feedbackLinkedinImg}
            />
          </a>
        </div>
      </main>
    </div>
  );
}

const parseTime = (time) => {
  const [hourMin, period] = time.split(/(?=[APap][mM])/);
  let [hour, minute] = hourMin.split(':').map(Number);
  if (/PM/i.test(period) && hour !== 12) hour += 12;
  if (/AM/i.test(period) && hour === 12) hour = 0;
  return hour + minute / 60;
};
