import { useState, useEffect, useRef } from 'react';
import { collection, addDoc, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { fetchData } from '@/scripts/fetch';
import styles from '../styles/SubmissionSection.module.css'

export default function SubmissionSection({ competition }) {
  const [submissions, setSubmissions] = useState([]);
  const [newSubmission, setNewSubmission] = useState('');
  const user = useAuth();
  const postId = competition.id
  const [successMessage, setSuccessMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false)
  const [scores, setScores] = useState([]);
  const fileInputRef = useRef(null);

  async function fetchScores() {
    try {
      const requestBody = { postId: postId };
      const response = await fetch('/api/getSortedScores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const data = await response.json();
      setScores(data);
    } catch (error) {
      console.error('Error fetching scores:', error);
    }
  }

  useEffect(() => {

    if (postId) {
      fetchData({
        db,
        collectionName: 'submissions',
        queryCondition: ['postId', '==', postId],
        order: ['createdAt', 'desc'],
        setData: setSubmissions,
      });
      fetchScores();
    }

  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage('')
    console.log('Form submitted');

    if (!user) {
      alert('You must be logged in to submit');
      setIsLoading(false);
      return;
    }

    try {
      const videoFile = e.target.elements.video?.files[0];
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

      // Clear form and reset state
      setNewSubmission('');
      fileInputRef.current.value = '';

      // Fetch updated submissions
      await fetchData({
        db,
        collectionName: 'submissions',
        queryCondition: ['postId', '==', postId],
        order: ['createdAt', 'desc'],
        setData: setSubmissions,
      });

      console.log('Submission complete');
      setSuccessMessage("Submitted sucessfully. Now Gemini will score your submission. To see your score on the leader board come back little bit later and refresh the page, give Gemini some time. For now you can watch your submision down below.")
    } catch (error) {
      console.error('Error submitting:', error);
      alert('Error submitting. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
          <h4>Upload your video submission:</h4>
          <input type="file" name="video" accept="video/*" className={styles.fileInput} ref={fileInputRef} required />
          <button type="submit" className={styles.button}>Competition Submission</button>
          {isLoading && <span>Submitting...</span>}
          {successMessage}
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
        {submissions.length >= 1 && <div className={styles.index}>
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
        </div>}
      </div>
    </div>
  );
}