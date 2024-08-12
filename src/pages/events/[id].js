import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import Layout from '../../components/Layout';
import SubmissionSection from '../../components/SubmissionSection';
import styles from '../../styles/Index.module.css'
import CompetitionCard from '../../components/CompetitionCard';

export default function BlogCompetition() {
  const router = useRouter();
  const { id } = router.query;
  const [competition, setCompetition] = useState(null);
  useEffect(() => {
    const fetchCompetition = async () => {
      if (id) {
        const postDoc = await getDoc(doc(db, 'competitions', id));
        if (postDoc.exists()) {
          setCompetition({ id: postDoc.id, ...postDoc.data() });
        } else {
          router.push('/404');
        }
      }
    };

    fetchCompetition();
  }, [id, router]);

  if (!competition) return <Layout><div>Loading...</div></Layout>;
  return (
    <Layout>
      <div className={styles.index}>
      <article>
        <CompetitionCard competition={competition} />
      </article>
      <SubmissionSection competition={competition} />
    </div>
    </Layout>
  );
}