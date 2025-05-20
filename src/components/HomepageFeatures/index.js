import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';
import Link from "@docusaurus/Link";
import { useState } from "react";
import OverviewContent from './OverviewContent';

const FeatureList = [];

function Feature({ Svg, title, page, description }) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className={styles.getStartedTextAndLogo}>
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Link
          className="button button--primary button--lg"
          style={{ marginBottom: 50 }}
          to={`/${page}/intro`}>
          Get Started
        </Link>
      </div>
    </div>
  );
}

export function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row" style={{ display: 'flex', justifyContent: 'center' }}>
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function Overview() {
  return (
    <div>
      <section className={styles.features}>
        <div className="container">
          <div className={styles.overview}>
            <OverviewContent />
          </div>

          <div style={{ height: 10 }}></div>          
          <div style={{
            display: 'flex',
            width: '100%',
            maxWidth: 670,
            margin: '20px auto 0 auto',
            justifyContent: 'right'
          }}>
            <Link
              className="button button--primary button--lg"
              style={{ marginBottom: 5, alignItems: 'center' }}
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
          <p>&nbsp;</p>
        </div>
      </section>
    </div>
  );
}
