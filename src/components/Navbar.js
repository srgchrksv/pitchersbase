import Link from 'next/link';
import { useAuth, logOut, isAdmin } from '../lib/auth';
import styles from '../styles/Navbar.module.css';
import { useState, useEffect } from 'react';


export default function Navbar() {
  const user = useAuth();
  const [admin, setIsAdmin] = useState(null); // Initial state: unknown

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const result = await isAdmin(user);
        setIsAdmin(result);
      } catch (error) {
        console.error('Error checking admin status:', error);
        // Handle error, e.g., set isAdmin to false or show an error message
      }
    };
    checkAdminStatus();
  }, [user]);

  return (
    <nav className={styles.nav}>
      <Link href="/">Home </Link>
      {user ? (
        <>
          <span>Welcome, {user.email}</span>
          {admin ? (
            <Link href="/admin/dashboard"><span className={styles.adminDashboardLink}>Admin Dashboard</span></Link>
          ) : ("")}
          <button onClick={logOut} className={styles.navButton}>Log out</button> 
        </>
      ) : (
        <>
          <Link href="/login">Log in</Link>
          <Link href="/signup">Sign up</Link>
        </>
      )}

    </nav>
  );
}
