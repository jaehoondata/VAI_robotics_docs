import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Translate from '@docusaurus/Translate';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    to: '/docs/onboarding/dev-environment',
    title: <Translate id="homepage.feature.onboarding.title">온보딩</Translate>,
    description: (
      <Translate id="homepage.feature.onboarding.body">
        팀에 새로 합류했다면 여기부터. 개발 환경 설정을 처음부터 따라 할 수 있습니다.
      </Translate>
    ),
  },
  {
    to: '/docs/guides/example-workflow',
    title: <Translate id="homepage.feature.guides.title">작업 가이드</Translate>,
    description: (
      <Translate id="homepage.feature.guides.body">
        자주 반복되는 작업의 절차를 단계별로 정리했습니다.
      </Translate>
    ),
  },
  {
    to: '/docs/contributing',
    title: <Translate id="homepage.feature.contributing.title">문서 기여</Translate>,
    description: (
      <Translate id="homepage.feature.contributing.body">
        문서가 틀렸거나 빠져 있다면 직접 고칠 수 있습니다. 방법을 안내합니다.
      </Translate>
    ),
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
