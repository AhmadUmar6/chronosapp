import React from 'react';
import styles from '../styles/StatusOverlay.module.css';

export default function StatusOverlay({ courses }) {
  const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0);

  return (
    <div className={styles.statusOverlay}>
      <p>Credits: {totalCredits}</p>
      <p>Courses: {courses.length}</p>
    </div>
  );
}
