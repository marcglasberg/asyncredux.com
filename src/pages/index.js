import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import { HomepageFeatures, Overview } from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';
import styles from './index.module.css';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <img src="img/flutter.svg" alt="State Management for Flutter" style={{ height: 160, width: 160 }} />
        <Heading as="h1" className="hero__title">
          Async Redux
        </Heading>
        <p style={{ fontSize: '1.5rem', marginBottom: 20 }}>Powerful State Management for Flutter</p>        
        <div style={{ marginTop: 20 }}>
          <Link
            className="button button--primary button--lg"
            style={{ alignItems: 'center' }}
            to={`/flutter/intro`}>
            <span style={{ display: 'inline-block', transform: 'translateY(-6px)' }}>
              Get Started &nbsp;<span style={{
                fontSize: 30,
                display: 'inline-block',
                transform: 'translateY(2px)'
              }}>»</span>
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`Async Redux`}
      description="State management for Flutter that is simple to learn and easy to use; Powerful enough to handle complex applications with millions of users; Testable.">
      <HomepageHeader />
      <main>
        <Overview />
      </main>
    </Layout>
  );
}



