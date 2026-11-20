import { XMLParser } from 'fast-xml-parser';

export interface ScormManifestMetadata {
  version: '1.2' | '2004';
  title: string;
  identifier: string;
  entryHref: string;
  resources: Array<{ identifier: string; href: string; type: string }>;
}

export function parseManifestXml(xmlContent: string): ScormManifestMetadata {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    parseTagValue: false,
  });

  const parsed = parser.parse(xmlContent);
  const manifest = parsed.manifest;

  if (!manifest) {
    throw new Error('Invalid manifest: missing root <manifest> element');
  }

  // Detect SCORM version (1.2 vs 2004)
  const rawSchemaVersion = manifest.metadata?.schemaversion || manifest.metadata?.['adlcp:schemaversion'] || '';
  const schemaVersion = String(rawSchemaVersion);
  const is2004 = schemaVersion.includes('2004') || schemaVersion.includes('CAM 1.3');
  const version = is2004 ? '2004' : '1.2';

  const title =
    manifest.organizations?.organization?.title ||
    manifest.organizations?.organization?.['#text'] ||
    'SCORM Course';

  const resourcesList = manifest.resources?.resource || [];
  const normalizedResources = Array.isArray(resourcesList) ? resourcesList : [resourcesList];

  const primaryResource = normalizedResources.find(
    (r: any) => r['@_href'] && (r['@_scormtype'] === 'sco' || r['@_adlcp:scormType'] === 'sco')
  ) || normalizedResources[0];

  const entryHref = primaryResource?.['@_href'] || 'index.html';

  return {
    version,
    title: typeof title === 'string' ? title : 'SCORM Course',
    identifier: manifest['@_identifier'] || 'scorm-package',
    entryHref,
    resources: normalizedResources.map((r: any) => ({
      identifier: r['@_identifier'] || '',
      href: r['@_href'] || '',
      type: r['@_type'] || '',
    })),
  };
}
