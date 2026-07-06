import { getPolicies } from '@/lib/data';
import DepartmentsContent from './DepartmentsContent';

export default async function DepartmentsPage() {
    const policies = await getPolicies({});
    return <DepartmentsContent initialPolicies={policies} />;
}
