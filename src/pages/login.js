import { useState } from 'react';
import { useRouter } from 'next/router';
import { logIn } from '../lib/auth';
import Layout from '../components/Layout';
import styles from '../styles/Signup.module.css'

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await logIn(email, password);
      router.push('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
      <h1 className={styles.title}>Login</h1>
    <div className={styles.form}>
      <form onSubmit={handleSubmit}>
        <input className={styles.content}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input className={styles.content}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button className={styles.button} type="submit">Login</button>
      </form>
      </div> 
      {error && <p>{error}</p>}
      </div>
    </Layout>
  );
}