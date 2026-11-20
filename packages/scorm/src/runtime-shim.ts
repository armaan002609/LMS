/**
 * SCORM 1.2 and SCORM 2004 Runtime Shim Bridge (TRD §5.4, BRAIN.md §7.5)
 * Sandboxed iframe bridge exposing window.API (1.2) and window.API_1484_11 (2004).
 */

export interface ScormCommitPayload {
  attemptId: string;
  cmi: Record<string, string>;
  completionStatus?: string;
  successStatus?: string;
  scoreRaw?: number;
  totalTime?: number;
}

export class ScormRuntimeBridge {
  private cmiStore: Record<string, string> = {};
  private attemptId: string;
  private onCommitCallback: (data: ScormCommitPayload) => void;

  constructor(attemptId: string, onCommit: (data: ScormCommitPayload) => void) {
    this.attemptId = attemptId;
    this.onCommitCallback = onCommit;
  }

  // SCORM 1.2 API
  getAPI12() {
    return {
      LMSInitialize: (_param: string) => 'true',
      LMSFinish: (_param: string) => {
        this.commit();
        return 'true';
      },
      LMSGetValue: (element: string) => this.cmiStore[element] || '',
      LMSSetValue: (element: string, value: string) => {
        this.cmiStore[element] = String(value);
        return 'true';
      },
      LMSCommit: (_param: string) => {
        this.commit();
        return 'true';
      },
      LMSGetLastError: () => '0',
      LMSGetErrorString: (_err: string) => 'No error',
      LMSGetDiagnostic: (_err: string) => 'No diagnostic info',
    };
  }

  // SCORM 2004 API (API_1484_11)
  getAPI2004() {
    return {
      Initialize: (_param: string) => 'true',
      Terminate: (_param: string) => {
        this.commit();
        return 'true';
      },
      GetValue: (element: string) => this.cmiStore[element] || '',
      SetValue: (element: string, value: string) => {
        this.cmiStore[element] = String(value);
        return 'true';
      },
      Commit: (_param: string) => {
        this.commit();
        return 'true';
      },
      GetLastError: () => '0',
      GetErrorString: (_err: string) => 'No error',
      GetDiagnostic: (_err: string) => 'No diagnostic info',
    };
  }

  private commit() {
    this.onCommitCallback({
      attemptId: this.attemptId,
      cmi: { ...this.cmiStore },
      completionStatus:
        this.cmiStore['cmi.core.lesson_status'] ||
        this.cmiStore['cmi.completion_status'],
      scoreRaw: parseFloat(
        this.cmiStore['cmi.core.score.raw'] ||
        this.cmiStore['cmi.score.raw'] ||
        '0'
      ),
    });
  }
}
