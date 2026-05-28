import { ScheduleExecutionConfigSchema } from '$lib/schemas/schedule-execution-config.schema';

const _defaults = ScheduleExecutionConfigSchema.parse({});

class ScheduleExecutionConfigState {
	startDate = $state<string>(_defaults.startDate);
	endDate = $state<string>(_defaults.endDate);
	timeframe = $state<string>(_defaults.timeframe);
	direction = $state<'Long' | 'Short' | 'Both'>(_defaults.direction);

	reset() {
		const d = ScheduleExecutionConfigSchema.parse({});
		this.startDate = d.startDate;
		this.endDate = d.endDate;
		this.timeframe = d.timeframe;
		this.direction = d.direction;
	}
}

export const scheduleExecutionConfigState = new ScheduleExecutionConfigState();
