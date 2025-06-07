import { Buffer } from 'buffer';

// Make Buffer available globally
(globalThis as any).Buffer = Buffer;
