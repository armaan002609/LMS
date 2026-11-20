import { describe, it, expect, vi } from 'vitest';
import { parseManifestXml } from '../src/manifest-parser';
import { ScormRuntimeBridge } from '../src/runtime-shim';

describe('SCORM Manifest Parser & Runtime Shim (FR-STD-1, FR-STD-2, TRD §5.4)', () => {
  const sample12Xml = `<?xml version="1.0" standalone="no" ?>
<manifest identifier="course_12" version="1.0"
  xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
  </metadata>
  <organizations default="org_1">
    <organization identifier="org_1">
      <title>Introduction to Safety 1.2</title>
      <item identifier="item_1" identifierref="res_1">
        <title>Safety Module</title>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="res_1" type="webcontent" adlcp:scormtype="sco" href="launcher.html" />
  </resources>
</manifest>`;

  const sample2004Xml = `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="course_2004" version="1"
  xmlns="http://www.imsglobal.org/xsd/imscp_v1p1">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>2004 4th Edition</schemaversion>
  </metadata>
  <organizations default="org_2004">
    <organization identifier="org_2004">
      <title>Cybersecurity Awareness 2004</title>
    </organization>
  </organizations>
  <resources>
    <resource identifier="res_2004" type="webcontent" adlcp:scormType="sco" href="index_lms.html" />
  </resources>
</manifest>`;

  it('correctly parses SCORM 1.2 manifest XML', () => {
    const meta = parseManifestXml(sample12Xml);
    expect(meta.version).toBe('1.2');
    expect(meta.title).toBe('Introduction to Safety 1.2');
    expect(meta.entryHref).toBe('launcher.html');
  });

  it('correctly parses SCORM 2004 manifest XML', () => {
    const meta = parseManifestXml(sample2004Xml);
    expect(meta.version).toBe('2004');
    expect(meta.title).toBe('Cybersecurity Awareness 2004');
    expect(meta.entryHref).toBe('index_lms.html');
  });

  it('handles SCORM 1.2 runtime shim commits and stores CMI data', () => {
    const onCommit = vi.fn();
    const bridge = new ScormRuntimeBridge('attempt-123', onCommit);
    const api12 = bridge.getAPI12();

    expect(api12.LMSInitialize('')).toBe('true');
    expect(api12.LMSSetValue('cmi.core.lesson_status', 'completed')).toBe('true');
    expect(api12.LMSSetValue('cmi.core.score.raw', '95')).toBe('true');
    expect(api12.LMSGetValue('cmi.core.score.raw')).toBe('95');
    expect(api12.LMSCommit('')).toBe('true');

    expect(onCommit).toHaveBeenCalledWith(
      expect.objectContaining({
        attemptId: 'attempt-123',
        completionStatus: 'completed',
        scoreRaw: 95,
      })
    );
  });

  it('handles SCORM 2004 API_1484_11 runtime shim calls', () => {
    const onCommit = vi.fn();
    const bridge = new ScormRuntimeBridge('attempt-456', onCommit);
    const api2004 = bridge.getAPI2004();

    expect(api2004.Initialize('')).toBe('true');
    expect(api2004.SetValue('cmi.completion_status', 'completed')).toBe('true');
    expect(api2004.SetValue('cmi.score.raw', '100')).toBe('true');
    expect(api2004.Terminate('')).toBe('true');

    expect(onCommit).toHaveBeenCalledWith(
      expect.objectContaining({
        attemptId: 'attempt-456',
        completionStatus: 'completed',
        scoreRaw: 100,
      })
    );
  });
});
