import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <p className={styles.heroDescription}>
          AgentVault packages local agents, deploys to ICP canisters, and preserves
          reconstructible state for resilient automation.
        </p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/getting-started/installation">
            Install AgentVault
          </Link>
          <Link
            className="button button--outline button--lg"
            to="/docs/user/tutorial-v1.0">
            Read Tutorial
          </Link>
        </div>
      </div>
    </header>
  );
}

function TrustBar() {
  return (
    <div className={styles.trustBar}>
      <div className="container">
        <div className={styles.trustItems}>
          <div className={styles.trustItem}>
            <span className={styles.trustIcon}>📦</span>
            <span>Open Source</span>
          </div>
          <div className={styles.trustItem}>
            <span className={styles.trustIcon}>🌐</span>
            <span>Built on ICP</span>
          </div>
          <div className={styles.trustItem}>
            <span className={styles.trustIcon}>⛓️</span>
            <span>Multi-Chain</span>
          </div>
          <div className={styles.trustItem}>
            <span className={styles.trustIcon}>💾</span>
            <span>Backup & Rebuild</span>
          </div>
          <div className={styles.trustItem}>
            <span className={styles.trustIcon}>✅</span>
            <span>508 Tests</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickInstall() {
  return (
    <section className={styles.quickInstall}>
      <div className="container">
        <h2>Quick Install</h2>
        <div className={styles.codeBlock}>
          <code>npm install -g agentvault</code>
        </div>
        <p className={styles.quickStart}>
          Then run <code>agentvault init my-agent</code> to create your first project.
        </p>
      </div>
    </section>
  );
}

export default function Home(): JSX.Element {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title} - Persistent On-Chain AI Agents`}
      description="Deploy autonomous AI agents to ICP canisters for persistent, 24/7 execution without browser dependencies.">
      <HomepageHeader />
      <TrustBar />
      <main>
        <HomepageFeatures />
        <QuickInstall />
      </main>
    </Layout>
  );
}
