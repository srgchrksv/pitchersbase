import Head from 'next/head';
import Navbar from './Navbar';
import  styles  from "../styles/Navbar.module.css"

export default function Layout({ children, siteTitle}) {
  return (
    <>
     <div className={styles.layout}>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <Navbar />
      <div>
        {children}
        </div>
      <footer className={styles.footer}>
      </footer>
      </div>
    </>
  );
}