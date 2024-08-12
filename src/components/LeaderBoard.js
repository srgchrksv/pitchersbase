// pages/sortedScores.js
import { useEffect, useState } from 'react';

export default function SortedScores({ postId }) {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    async function fetchScores() {
        console.log(postId)
        const requestBody = { postId: postId };

        const response = await fetch('/api/getSortedScores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        });

const data = await response.json();
      console.log(data)
    /setScores(data);
    }

    fetchScores();
  }, []);

  return (
    <div>
      <h1>Sorted Scores</h1>
      <ul>
        {scores.map(score => (
          <li key={score.id}>
            <strong>{score.author}:</strong> {score.score}
          </li>
        ))}
      </ul>
    </div>
  );
}
