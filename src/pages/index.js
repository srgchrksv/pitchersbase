import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Link from 'next/link';
import Layout from '../components/Layout';
import styles from '../styles/Index.module.css'
import CompetitionCard from '../components/CompetitionCard';

const siteTitle = "PitchersHub"
const siteText = ''
export default function Home() {
  const [competitions, setCompetitions] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        const postsCollection = collection(db, 'competitions');
        const postsSnapshot = await getDocs(postsCollection);
        const postsList = postsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCompetitions(postsList);
      } catch (err) {
        console.error("Error fetching competitions:", err);
        setError("Failed to fetch competitions. Please try again.");
      }
    };

    fetchCompetitions();
  }, []);

  return (
    <Layout siteTitle={siteTitle}>
      <div className={styles.index}>
        <h1>{siteTitle}</h1>
        <p>In the PitchersHub we have pitchers and catchers... and <strong>Gemini AI</strong> 🤖</p>

        <h3>💡 Pitcher:</h3>
        <p>The visionary that pitches ideas and solutions.</p>

        <h3>🤝 Catcher:</h3>
        <p>Establishes, evaluates and patronizes.</p>

        <h3>🤖 Gemini AI:</h3>
        <p>Will help to find best pitchers.</p>

        <h2>Let's get into it</h2>
        <p>Firstly the catchers are creating the competition events, providing with rules and problem to solve.</p>
        <p>The pitchers then brainstorm and combining with a solution submission, a short video presentation, the pitch.</p>
        <p>Finally the <strong>Gemini AI</strong> will be scoring the pitch based on the catchers defined rules.</p>
        <p>Leader board with scores from <strong>Gemini AI</strong> will be shown at the events page.</p>
        <h1>Current catches to pitch:</h1>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div className={styles.competitions}>
          {competitions.map(competition => (
            <CompetitionCard competition={competition} />
          ))}
        </div>
      </div>
    </Layout>
  );
}
