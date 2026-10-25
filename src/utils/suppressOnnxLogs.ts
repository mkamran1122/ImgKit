/**
 * Utility to configure ONNX Runtime and Hugging Face Transformers logging,
 * and filter out benign constant-folding warnings emitted during model graph optimization.
 */

// Filter check for benign ONNX runtime optimization messages
export function isBenignOnnxMessage(...args: unknown[]): boolean {
  for (const arg of args) {
    if (typeof arg === 'string') {
      if (
        arg.includes('onnxruntime') &&
        (arg.includes('constant_folding') ||
          arg.includes("can't constant fold") ||
          arg.includes('Could not find a CPU kernel') ||
          arg.includes('ApplyImpl'))
      ) {
        return true;
      }
      if (arg.includes('[W:onnxruntime:')) {
        return true;
      }
    } else if (arg && typeof arg === 'object') {
      const str = String((arg as { message?: string }).message || '');
      if (
        str.includes('onnxruntime') &&
        (str.includes('constant_folding') || str.includes("can't constant fold"))
      ) {
        return true;
      }
    }
  }
  return false;
}

// Install console filters
const origWarn = console.warn;
console.warn = (...args: unknown[]) => {
  if (isBenignOnnxMessage(...args)) return;
  origWarn.apply(console, args);
};

const origError = console.error;
console.error = (...args: unknown[]) => {
  if (isBenignOnnxMessage(...args)) return;
  origError.apply(console, args);
};

const origLog = console.log;
console.log = (...args: unknown[]) => {
  if (isBenignOnnxMessage(...args)) return;
  origLog.apply(console, args);
};

// Configure global ort environment if present
if (typeof window !== 'undefined') {
  const win = window as unknown as {
    ort?: { env?: { logLevel?: string } };
  };
  win.ort = win.ort || {};
  win.ort.env = win.ort.env || {};
  win.ort.env.logLevel = 'error';
}

// Configure @huggingface/transformers and onnxruntime-web log level
export async function configureOnnxLogLevel(): Promise<void> {
  try {
    const { env } = await import('@huggingface/transformers');
    if (env?.backends?.onnx) {
      env.backends.onnx.logLevel = 'error';
    }
  } catch {
    // Transformers not yet loaded or running in an environment without it
  }

  try {
    // @ts-expect-error onnxruntime-web type export issue
    const ort = (await import('onnxruntime-web')) as { env?: { logLevel?: string } };
    if (ort?.env) {
      ort.env.logLevel = 'error';
    }
  } catch {
    // onnxruntime-web not loaded yet
  }
}

// Immediately trigger configuration
void configureOnnxLogLevel();
