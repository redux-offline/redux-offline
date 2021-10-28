import React from 'react';
import clsx from 'clsx';
import styles from './HomepageFeatures.module.css';

const FeatureList = [
  {
    title: 'Easy to Use',
    Svg: require('../../static/img/easy.svg').default,
    description: (
      <>
        Start quickly with built-in features and deliver a seamless out-of-the-box offline first experience.
      </>
    ),
  },
  {
    title: 'Completely customizable',
    Svg: require('../../static/img/focus.svg').default,
    description: (
      <>
        If you know how to write apps using JavaScript you can customize any part of Redux Offline.
      </>
    ),
  },
  {
    title: 'Powered by Redux',
    Svg: require('../../static/img/redux.svg').default,
    description: (
      <>
        Extend or customize your offline architecture using Redux.
      </>
    ),
  },
];

function Feature({Svg, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} alt={title} />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
