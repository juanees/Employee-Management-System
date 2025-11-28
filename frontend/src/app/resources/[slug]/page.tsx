import { ResourceWorkbench } from '@/components/resources/resource-workbench';

export default function ResourceDetailPage({ params }: { params: { slug: string } }) {
  return <ResourceWorkbench slug={params.slug} />;
}
