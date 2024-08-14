import React from 'react';
import Link from 'next/link'; // Assuming you're using Next.js
import styles from '../styles/Index.module.css'
import Image from 'next/image'

const CompetitionCard = ({ competition, customStyles = {}, isSubstring = true }) => {
  return (
    <div key={competition.id} className={customStyles.competition || styles.competition}>
      <Link href={`/events/${competition.id}`}>
        {competition.imageUrl && (<Image src={competition.imageUrl} width={500} height={500} alt={competition.title} className={customStyles.image || styles.image} />)}
        <h2 className={customStyles.title || styles.title}>{competition.title}</h2>
        <p className={customStyles.content || styles.content}>{isSubstring ? (competition.content.substring(0, 100) + '...') : (competition.content)}</p>
      </Link>
    </div>
  );
};

export default CompetitionCard;