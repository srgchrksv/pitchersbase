import { useState, useEffect, useRef } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth,  checkAdminStatus } from '../../lib/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { fetchData } from '@/scripts/fetch';
import Layout from '../../components/Layout';
import CompetitionCard from '../../components/CompetitionCard';
import styles from '../../styles/Dashboard.module.css';


export default function AdminDashboard() {
  const [competitions, setCompetitions] = useState([]);
  const [newCompetition, setNewCompetition] = useState({ createdBy: '', imageUrl: '', title: '', content: '', competitionRules: '' });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(null);
  const [isAdmin, setIsAdmin] = useState(null); // Initial state: unknown
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const user = useAuth();

  useEffect(() => {
    setSuccessMessage("")
    checkAdminStatus(user, setIsAdmin);
    if (user && isAdmin) {
      fetchData({
        db,
        collectionName: 'competitions',
        queryCondition: ['createdBy', '==', user.uid],
        setData: setCompetitions,
        setError,
      });

    }
  }, [user]);

  const handleAddCompetition = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!user) {
        console.error("User not found. handleAddCompetition.");
        setLoading(false);
        return;
      }
      const newCompetitionData = {
        ...newCompetition,
        createdAt: new Date().toISOString(),
        createdBy: user.uid
      };

      // Access the image file
      const selectedImage = e.target.elements.image?.files[0];

      // Check if image is selected
      if (selectedImage) {
        const storage = getStorage();
        // Upload the image to Firebase Storage (replace with your upload logic)
        const storageRef = ref(storage, `competitions/${selectedImage.name}`);
        await uploadBytes(storageRef, selectedImage);

        // Get the uploaded image URL
        const imageUrl = await getDownloadURL(storageRef);
        newCompetitionData.imageUrl = imageUrl;
      }

      // Add competition data to Firestore
      const docRef = await addDoc(collection(db, 'competitions'), newCompetitionData);
      console.log("Document written with ID: ", docRef.id);

      setNewCompetition({ createdBy: user.uid, imageUrl: '', title: '', content: '', competitionRules: '' });
      await fetchData({
        db,
        collectionName: 'competitions',
        queryCondition: ['createdBy', '==', user.uid],
        setData: setCompetitions,
        setError,
      });  // Refresh competitions after adding
      setSuccessMessage('Competition added successfully!');
      fileInputRef.current.value = '';
    } catch (err) {
      console.error("Error adding competition:", err);
      setError(`Failed to add competition: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCompetition = async (id) => {
    setLoading(true);
    setError('');
    try {
      await deleteDoc(doc(db, 'competitions', id));
      await fetchData({
        db,
        collectionName: 'competitions',
        queryCondition: ['createdBy', '==', user.uid],
        setData: setCompetitions,
        setError,
      });  // Refresh competitions after deleting
    } catch (err) {
      console.error("Error deleting competition:", err);
      setError(`Failed to delete competition: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <Layout><div>Loading...</div></Layout>;
 
  if(!isAdmin) return <Layout><div>You are not authorized...</div></Layout>; 

  return (
    <Layout>
      
      <div className={styles.container}>
        <h1>Catchers Dashboard</h1>
        <h3>Create an event</h3>
        {successMessage && <p className={styles.success}>{successMessage}</p>}
        {error && (
          <p className={styles.error}>{error}</p>
        )}
        <form onSubmit={handleAddCompetition} className={styles.form}>
          <input ref={fileInputRef} type="file" name="image" accept="image/*" className={styles.input} />
          <input
            type="text"
            value={newCompetition.title}
            onChange={(e) => setNewCompetition({ ...newCompetition, title: e.target.value })}
            placeholder="Title"
            required
            className={styles.input}
          />
          <textarea
            value={newCompetition.content}
            onChange={(e) => setNewCompetition({ ...newCompetition, content: e.target.value })}
            placeholder="Content"
            required
            className={styles.content}
          />
          <textarea
            type="text"
            value={newCompetition.competitionRules}
            onChange={(e) => setNewCompetition({ ...newCompetition, competitionRules: e.target.value })}
            placeholder="competition rules"
            required
            className={styles.content}
          />
          <button type="submit" disabled={loading} className={styles.button}>
            {loading ? 'Adding...' : 'Add Competition'}
          </button>
        </form>
        <h2 className={styles.competitions}>Existing Competitions</h2>
        <div className={styles.competitions}>
          {competitions.map(competition => (
            <div key={competition.id} className={styles.competition}>
              <CompetitionCard competition={competition} />
              <button onClick={() => handleDeleteCompetition(competition.id)} disabled={loading}>
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}