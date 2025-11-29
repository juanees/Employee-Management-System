import type { Metadata } from 'next';

import { requireResourceDefinition } from '@/components/resources/resource-config';
import { ResourceWorkbench } from '@/components/resources/resource-workbench';

const definition = requireResourceDefinition('jobs');

export const metadata: Metadata = {
  title: `${definition.title} · Resource workspace`,
  description: definition.description
};

export default function JobsResourcePage() {
  return <ResourceWorkbench slug={definition.slug} />;
}
