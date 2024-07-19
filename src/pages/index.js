import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import {HomepageFeatures, Overview} from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';
import styles from './index.module.css';
import {useState} from "react";

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <img src="img/logo.svg" style={{height: 160, width: 160}}/>
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p style={{fontSize: '1.5rem', marginBottom: 0}}>{siteConfig.tagline}</p>
        <p style={{fontSize: '1.5rem', marginBottom: 0}}>{siteConfig.customFields.subTagline}</p>
      </div>
    </header>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`Async Redux`}
      description="The modern version of Redux. State management that is simple to learn and easy to use; Powerful enough to handle complex applications with millions of users; Testable.">
      <HomepageHeader/>
      <main>
        <HomepageFeatures/>
        <Overview/>
      </main>
    </Layout>
  );
}



