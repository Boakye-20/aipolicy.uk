import HomeContent from './HomeContent';
import { getPolicies } from '@/lib/data';

export default async function Home() {
  const policies = await getPolicies({});
  return <HomeContent initialPolicies={policies} />;
}
