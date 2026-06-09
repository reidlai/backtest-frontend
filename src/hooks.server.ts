import type { Handle } from '@sveltejs/kit';
import { getTextDirection } from '$lib/paraglide/runtime';
import { paraglideMiddleware } from '$lib/paraglide/server';
import pino from 'pino';
import { env } from '$env/dynamic/public';

const serverLogger = pino({ level: env.PUBLIC_LOG_LEVEL ?? 'info' });
serverLogger.info(
	{
		PUBLIC_BACKTEST_EAPI_URL: env.PUBLIC_BACKTEST_EAPI_URL,
		PUBLIC_USE_MOCK_DATA: env.PUBLIC_USE_MOCK_DATA,
		PUBLIC_LOG_LEVEL: env.PUBLIC_LOG_LEVEL
	},
	'app env'
);

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) =>
				html
					.replace('%paraglide.lang%', locale)
					.replace('%paraglide.dir%', getTextDirection(locale))
		});
	});

export const handle: Handle = handleParaglide;
