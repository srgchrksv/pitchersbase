import React from 'react';
import Link from 'next/link'; // Assuming you're using Next.js
import styles from '../styles/Index.module.css'

const CompetitionCard = ({ competition }) => {
  return (
    <div key={competition.id} className={styles.competition}>
      <Link href={`/events/${competition.id}`}>
        <img src={competition.imageUrl} alt={competition.title} className={styles.image}/>
        <h2 className={styles.title}>{competition.title}</h2>
        <p className={styles.content}>{competition.content.substring(0, 100)}...</p>
      </Link>
    </div>
  );
};

export default CompetitionCard;