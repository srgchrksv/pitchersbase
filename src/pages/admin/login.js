import { useState } from 'react';
import { useRouter } from 'next/router';
import { logIn, isAdmin } from '../../lib/auth';
import Layout from '../../components/Layout';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await logIn(email, password);
      const adminStatus = true
      if (adminStatus) {
        router.push('/admin/dashboard');
      } else {
        setError('Not authorized as admin');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Layout>
      <h1>Admin Login</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">Login</button>
      </form>
      {error && <p>{error}</p>}
    </Layout>
  );
}