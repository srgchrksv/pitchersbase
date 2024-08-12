import { useState, useEffect, useRef } from 'react';
import { collection, addDoc, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import styles from '../styles/SubmissionSection.module.css'

export default function SubmissionSection({ competition }) {
  const [submissions, setSubmissions] = useState([]);
  const [newSubmission, setNewSubmission] = useState('');
  const user = useAuth();
  const postId = competition.id
  const [isLoading, setIsLoading] = useState(false);
  const [scores, setScores] = useState([]);
  const fileInputRef = useRef(null);

  async function fetchScores() {
    console.log(postId);
    const requestBody = { postId: postId };
  
    try {
      const response = await fetch('/api/getSortedScores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
  
      const data = await response.json();
      console.log(data);
      setScores(data);
    } catch (error) {
      console.error('Error fetching scores:', error);
      // Handle error, e.g., display an error message to the user
    }
  }

  async function fetchSubmissions () {
    try {
      const q = query(
        collection(db, 'submissions'),
        where('postId', '==', postId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const fetchedSubmissions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSubmissions(fetchedSubmissions);
    } catch(error) {
      console.error(error)
    }
  };
  useEffect(() => {
  

    if (postId) {
      fetchSubmissions();
      fetchScores();
    }

  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    console.log('Form submitted');
    if (!user) {
      alert('You must be logged in to submit');
      setIsLoading(false); // Reset loading state
      return;
    }

    if (!newSubmission.trim()) {
      setIsLoading(false); // Reset loading state
      return;
    }

    // Proceed with video upload or text submission...
    try {
      const videoFile = e.target.elements.video?.files[0];
      if (videoFile) {
        const storage = getStorage();
        const videoRef = ref(storage, `submissions/${user.uid}-${Date.now()}.mp4`);
        await uploadBytes(videoRef, videoFile);
        const videoUrl = await getDownloadURL(videoRef);

        await addDoc(collection(db, 'submissions'), {
          postId,
          title: competition.title,
          competitionRules: competition.competitionRules,
          content: newSubmission,
          author: user.email,
          createdAt: new Date().toISOString(),
          videoUrl
        });
      } else {
        await addDoc(collection(db, 'submissions'), {
          postId,
          content: newSubmission,
          author: user.email,
          createdAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error submitting:', error);
      alert('Error submitting. Please try again.');
    }

    setIsLoading(false);
    setNewSubmission('');
    fileInputRef.current.value = '';
    console.log('Submission complete');
  };

  return (
    <div className={styles.index}>
      <h3>Submissions</h3>
      {user ? (
        <form onSubmit={handleSubmit} className={styles.form}>
          <textarea
            className={styles.textarea}
            value={newSubmission}
            onChange={(e) => setNewSubmission(e.target.value)}
            placeholder="Write a submission description..."
            required
          />
          <input type="file" name="video" accept="video/*" className={styles.fileInput} ref={fileInputRef} required />
          <button type="submit" className={styles.button}>Competition Submission</button>
          {isLoading && <span>Submitting...</span>}
        </form>
      ) : (
        <p>Please log in to make your pitch.</p>
      )}
      <div className={styles.competitions}>
        {submissions.map(submission => (
          <div key={submission.id} className={styles.competition}>
            <video controls className={styles.image}>
              <source src={submission.videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <p className={styles.content}>{submission.content}</p>
            <small>By {submission.author} on {new Date(submission.createdAt).toLocaleString()}</small>
          </div>
        ))}
      </div>
      <div>
        <div className={styles.index}>
          <h1>Leader Board</h1>
          <table>
            <thead>
              <tr>
                <th className={styles.th}>Rank</th>
                <th className={styles.th}>Author</th>
                <th className={styles.th}>Score</th>
              </tr>
            </thead>
            <tbody className={styles.table}>
              {scores ? (
                scores.map((score, idx) => (
                  <tr key={score.id}>
                    <td className={styles.td}>{idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}</td>
                    <td className={styles.td}>{score.author}</td>
                    <td className={styles.td}>{score.score}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3">No scores yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        </div>
    </div>
  );
}