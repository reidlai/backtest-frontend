import pino from 'pino';
import { env } from '$env/dynamic/public';

const level = env.PUBLIC_LOG_LEVEL ?? 'info';

export const logger = pino({ level, browser: { asObject: true } });
