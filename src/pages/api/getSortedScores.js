// pages/api/getSortedScores.js
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';

// this one route is made to try the next.js server side processing

export default async function handler(req, res) {
    try {
        // Extract the postId from query parameters
        const { postId } = req.body;
       
        // Ensure postId is provided
        if (!postId) {
            return res.status(400).json({ error: 'postId is required' });
        }
        const q = query(collection(db, "submissions"), where('postId', "==", postId), orderBy('score', 'desc'), 
        orderBy('__name__', 'desc'));
        const postsSnapshot = await getDocs(q);
        const data = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log(data)
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data' });
    }
}
