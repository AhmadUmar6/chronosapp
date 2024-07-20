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
      <div className={styles.headerText}>
        Chronos - LUMS Course Scheduler
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
      <a 
        href="https://www.linkedin.com/in/ahmadumarfarooq/" 
        target="_blank" 
        rel="noopener noreferrer" 
        style={{
          bottom: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '70px',
          height: '60px',
          zIndex: 10,
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'translateX(-50%) scale(1.1)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'translateX(-50%) scale(1.0)'}
      >
        <img 
          src="/new.png" 
          alt="LinkedIn" 
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
            opacity: 1,
          }}
        />
      </a>
    </div>
  );
}
