import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    to: '/docs/meta-quest-3/overview',
    title: 'Meta Quest 3',
    description: 'VR teleoperation에 사용하는 Meta Quest 3의 설정과 기능을 정리했습니다.',
  },
  {
    to: '/docs/ai-worker/overview',
    title: 'AI WORKER',
    description: 'ROBOTIS의 semi-humanoid 로봇 FFW-SG2의 구성과 사용법을 다룹니다.',
  },
  {
    to: '/docs/contributing',
    title: '문서 기여',
    description: '문서가 틀렸거나 빠져 있다면 직접 고칠 수 있습니다. 방법을 안내합니다.',
  },
];

function Feature({to, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <Link to={to} className={styles.card}>
        <Heading as="h3" className={styles.cardTitle}>
          {title}
        </Heading>
        <p className={styles.cardBody}>{description}</p>
      </Link>
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
