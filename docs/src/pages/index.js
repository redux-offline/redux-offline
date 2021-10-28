import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';

import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './index.module.css';
import HomepageFeatures from '../components/HomepageFeatures';

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`Build Offline-First Apps ${siteConfig.title}`}
      description="Build Offline-First Apps for Web and React Native">
      <main>
        <div className={styles.hero}>
          <div className={styles.heroInner}>
            <h1 className={styles.heroProjectTagline}>
              <img
                className={styles.heroLogo}
                src={useBaseUrl('/img/logo.png')}
              />
              <span
                className={styles.heroTitleTextHtml}
              >
                {siteConfig.tagline}
              </span>
            </h1>
            <div className={styles.indexCtas}>
              <Link className="button button--primary" to="/docs/introduction">
                Get Started
              </Link>
              {/* TODO add this in the future */}
              {/* <Link className="button button--info" to="https://docusaurus.new">
                Playground
              </Link> */}
              <span className={styles.indexCtasGitHubButtonWrapper}>
                <iframe
                  className={styles.indexCtasGitHubButton}
                  src="https://ghbtns.com/github-btn.html?user=redux-offline&amp;repo=redux-offline&amp;type=star&amp;count=true&amp;size=large"
                  width={160}
                  height={30}
                  title="GitHub Stars"
                />
              </span>
            </div>
          </div>
        </div>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
