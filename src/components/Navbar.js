import Link from 'next/link';
import { useAuth, logOut, checkAdminStatus } from '../lib/auth';
import styles from '../styles/Navbar.module.css';
import { useState, useEffect } from 'react';


export default function Navbar() {
  const user = useAuth();
  const [isAdmin, setIsAdmin] = useState(null);
  useEffect(() => {
    checkAdminStatus(user, setIsAdmin);
  }, [user]);

  return (
    <nav className={styles.nav}>
      <Link href="/">Home </Link>
      {user ? (
        <>
          <span>Welcome, {user.email}</span>
          {isAdmin ? (
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
