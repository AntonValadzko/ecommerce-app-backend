/** Temporarily override process.env keys for a test, then restore. */
export function withEnv(vars: Record<string, string | undefined>, fn: () => void): void {
  const backup = new Map<string, string | undefined>();

  for (const [key, value] of Object.entries(vars)) {
    backup.set(key, process.env[key]);
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }

  try {
    fn();
  } finally {
    for (const [key, value] of backup.entries()) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
}
