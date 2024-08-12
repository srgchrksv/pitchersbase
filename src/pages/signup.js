import { useState } from 'react';
import { useRouter } from 'next/router';
import { signUp } from '../lib/auth';
import Layout from '../components/Layout';
import styles from '../styles/Signup.module.css'


export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [selectedRole, setSelectedRole] = useState('pitchers');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signUp(email, password, username, selectedRole);
      if (selectedRole === 'pitchers') {
        router.push('/');
      } else if (selectedRole === 'catchers') {
        router.push('/admin/dashboard');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <h1 className={styles.title}>Sign Up</h1>
        <div className={styles.form}>
        <form onSubmit={handleSubmit}>
          <select className={styles.content} id="roleSelect" value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
            <option value="pitchers">Pitcher</option>
            <option value="catchers">Catcher</option>
          </select>
          <input className={styles.content}
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            required
          />
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
          <button className={styles.button} type="submit">Sign Up</button>
        </form>
        </div>
        {error && <p>{error}</p>}
      </div>
    </Layout >
  );
}