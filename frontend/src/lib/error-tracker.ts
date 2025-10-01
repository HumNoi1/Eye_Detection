/**
 * Simple Error Tracking System
 * Can be extended to send to external services like Sentry
 */

type ErrorLog = {
  id: string;
  timestamp: number;
  message: string;
  stack?: string;
  context?: Record<string, unknown>;
  level: 'error' | 'warning' | 'info';
};

class ErrorTracker {
  private errors: ErrorLog[] = [];
  private maxErrors = 100;
  private listeners: Set<(errors: ErrorLog[]) => void> = new Set();

  captureError(error: Error | string, context?: Record<string, unknown>) {
    const errorLog: ErrorLog = {
      id: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      message: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      context,
      level: 'error'
    };

    this.errors.unshift(errorLog);
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }

    this.notifyListeners();
    console.error('[ErrorTracker]', errorLog);
  }

  captureWarning(message: string, context?: Record<string, unknown>) {
    const errorLog: ErrorLog = {
      id: `warn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      message,
      context,
      level: 'warning'
    };

    this.errors.unshift(errorLog);
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }

    this.notifyListeners();
    console.warn('[ErrorTracker]', errorLog);
  }

  captureInfo(message: string, context?: Record<string, unknown>) {
    const errorLog: ErrorLog = {
      id: `info_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      message,
      context,
      level: 'info'
    };

    this.errors.unshift(errorLog);
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }

    this.notifyListeners();
  }

  subscribe(listener: (errors: ErrorLog[]) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.errors]));
  }

  getErrors() {
    return [...this.errors];
  }

  clearErrors() {
    this.errors = [];
    this.notifyListeners();
  }

  exportErrors() {
    return JSON.stringify(this.errors, null, 2);
  }
}

export const errorTracker = new ErrorTracker();
export type { ErrorLog };
