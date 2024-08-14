import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { fetchData } from '@/scripts/fetch';
import Layout from '../components/Layout';
import styles from '../styles/Index.module.css'
import CompetitionCard from '../components/CompetitionCard';

const siteTitle = "Pitchersbase"
const siteText = ''
export default function Home() {
  const [competitions, setCompetitions] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData({
      db,
      collectionName: 'competitions',
      setData: setCompetitions,
      setError,
    });
  }, []);

  return (
    <Layout siteTitle={siteTitle}>
      <div className={styles.index}>
        <h1 className={styles.siteTitle}>{siteTitle}</h1>
        <p>In the Pitchersbase we have pitchers, catchers and <strong>Gemini AI</strong> 🤖</p>

        <h3>💡 Pitcher:</h3>
        <p>The visionary that pitches ideas and solutions.</p>

        <h3>🤝 Catcher:</h3>
        <p>Establishes, evaluates and patronizes.</p>

        <h3>🤖 Gemini AI:</h3>
        <p>Will help to find best pitchers.</p>

        <h2>Let's get into it</h2>
        <p>Firstly the catchers are creating competitions or events, providing the rules and problem to solve.</p>
        <p>The pitchers then got to come up with a short video presentation of solution, call it, the pitch.</p>
        <p>Finally the <strong>Gemini AI</strong> will be scoring the pitch based on the rules set by catchers.</p>
        <h4>Leader board with scores from <strong>Gemini AI</strong> will be shown at the events page.</h4>
        {competitions.length > 0 && <h1 className={styles.siteTitle}>Current catches to pitch:</h1>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div className={styles.competitions}>
          {competitions.map((competition, idx) => (
            <CompetitionCard competition={competition} key={idx} />
          ))}
        </div>
      </div>
    </Layout>
  );
}
