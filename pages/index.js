import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Calendar from '../components/Calendar';
import CourseSelector from '../components/CourseSelector';
import StatusOverlay from '../components/StatusOverlay';
import styles from '../styles/Home.module.css';
import { saveCourses, loadCourses } from '../utils/indexedDB';

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [showCourseSelector, setShowCourseSelector] = useState(false);

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
    setCourses(prevCourses => {
      const updatedCourses = [...prevCourses, course];
      saveCourses(updatedCourses).catch(error => console.error('Error saving courses:', error));
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
            src="/new2.png" 
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
          <div className={`${styles.calendarWrapper} ${showCourseSelector ? styles.shrinkCalendar : ''}`}>
            <Calendar courses={courses} removeCourse={removeCourse} />
          </div>
          {showCourseSelector && (
            <div className={styles.selectorWrapper}>
              <CourseSelector addCourse={addCourse} />
            </div>
          )}
        </div>
        <button className={styles.toggleButton} onClick={toggleCourseSelector}>
          {showCourseSelector ? '-' : '+'}
        </button>
        <StatusOverlay courses={courses} />
      </main>
    </div>
  );
}
