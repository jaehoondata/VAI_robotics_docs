import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    to: '/docs/ai-worker/overview',
    title: 'AI WORKER',
    description: 'ROBOTIS의 semi-humanoid 로봇 FFW-SG2의 하드웨어·소프트웨어 사양과 구동·종료 절차입니다.',
  },
  {
    to: '/docs/meta-quest-3/overview',
    title: 'Meta Quest 3',
    description: 'VR teleoperation에 사용하는 Meta Quest 3의 장비 특징과 기본 사용법입니다.',
  },
  {
    to: '/docs/Interactive-marker/interactive-marker',
    title: 'Interactive Marker',
    description: 'RViz 인터랙티브 마커와 Joint/EEF 컨트롤러로 FFW-SG2를 조작하는 방법입니다.',
  },
  {
    to: '/docs/vr-teleoperation/setup',
    title: 'VR Teleoperation',
    description: '팀 파이프라인으로 FFW-SG2를 face-to-face teleoperation하고 데모를 녹화합니다.',
  },
];

function Feature({to, title, description}) {
  return (
    <div className={clsx('col col--3', styles.col)}>
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
