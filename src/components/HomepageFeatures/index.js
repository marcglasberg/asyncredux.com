import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';
import Link from "@docusaurus/Link";

const FeatureList = [
  {
    title: 'For React',
    Svg: require('@site/static/img/react.svg').default,
    description: (
      <>
        Async Redux is easier than Redux, Zustand, MobX and React Query.
        Available since April 2024, in&nbsp;<a
        href='https://www.npmjs.com/package/async-redux-react'>npm</a>
      </>
    ),
    page: 'react',
  },
  {
    title: 'For Flutter',
    Svg: require('@site/static/img/flutter.svg').default,
    description: (
      <>
        Async Redux is in the top 8% most used Flutter packages.
        Available since 2020 in&nbsp;<a href='https://pub.dev/packages/async_redux'>pub.dev</a>
      </>
    ),
    page: 'flutter',
  },
];

function Feature({Svg, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img"/>
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
      <div style={{display: 'flex', justifyContent: 'center'}}>
        <Link
          className="button button--primary button--lg"
          to="/docs/intro">
          Get Started
        </Link>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row" style={{display: 'flex', justifyContent: 'center'}}>
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
