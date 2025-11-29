import type { Metadata } from 'next';

import { requireResourceDefinition } from '@/components/resources/resource-config';
import { ResourceWorkbench } from '@/components/resources/resource-workbench';

const definition = requireResourceDefinition('job-templates');

export const metadata: Metadata = {
  title: `${definition.title} · Resource workspace`,
  description: definition.description
};

export default function JobTemplatesResourcePage() {
  return <ResourceWorkbench slug={definition.slug} />;
}
