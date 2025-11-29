import type { Metadata } from 'next';

import {
  resourceDefinitions,
  ResourceSlug
} from '@/components/resources/resource-config';
import { ResourceWorkbench } from '@/components/resources/resource-workbench';

type ResourcePageParams = {
  slug: ResourceSlug;
};

const resourceMetadataCache = resourceDefinitions.reduce<Record<ResourceSlug, Metadata>>(
  (acc, definition) => {
    acc[definition.slug] = {
      title: `${definition.title} · Resource workspace`,
      description: definition.description
    };
    return acc;
  },
  {} as Record<ResourceSlug, Metadata>
);

export const dynamicParams = false;

export function generateStaticParams() {
  return resourceDefinitions.map((definition) => ({ slug: definition.slug }));
}

export function generateMetadata({ params }: { params: ResourcePageParams }): Metadata {
  return resourceMetadataCache[params.slug] ?? {
    title: 'Resource workspace',
    description: 'Manage every API resource with a unified CRUD interface.'
  };
}

export default function ResourceDetailPage({ params }: { params: ResourcePageParams }) {
  return <ResourceWorkbench slug={params.slug} />;
}
