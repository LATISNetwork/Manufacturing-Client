import { Buffer } from 'buffer';
import process from 'process';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
globalThis.Buffer = Buffer;
globalThis.process = process;