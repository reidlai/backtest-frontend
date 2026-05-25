import { describe, it, expect } from 'vitest';
import {
	AIReviewPanelSchema,
	AIReviewSidebarSchema,
	DashboardMetricGridSchema,
	FunctionGatewaysSchema,
	LiveControlFormSchema,
	MainMenuGroupSchema,
	NavigationSidebarSchema,
	QuickActionsPanelSchema,
	ResourceCostPanelSchema,
	ResultMenuGroupSchema,
	StubSectionSchema,
	TopBarSchema
} from '$lib/schemas';

describe('Empty organism schemas', () => {
	it('AIReviewPanelSchema defaults review with empty grade and low confidence', () => {
		const result = AIReviewPanelSchema.parse({});
		expect(result.review.grade).toBe('');
		expect(result.review.confidence).toBe('low');
		expect(result.review.riskFlags).toEqual([]);
	});

	it('AIReviewSidebarSchema parses empty input', () => {
		expect(AIReviewSidebarSchema.parse({})).toEqual({});
	});

	it('DashboardMetricGridSchema defaults metrics to empty array', () => {
		const result = DashboardMetricGridSchema.parse({});
		expect(result.metrics).toEqual([]);
	});

	it('FunctionGatewaysSchema defaults gatewayCards to empty array', () => {
		const result = FunctionGatewaysSchema.parse({});
		expect(result.gatewayCards).toEqual([]);
	});

	it('LiveControlFormSchema parses empty input', () => {
		expect(LiveControlFormSchema.parse({})).toEqual({
			totalReturn: '42.8',
			maxDrawdown: '-18.2',
			winRate: '58.3'
		});
	});

	it('MainMenuGroupSchema defaults mainSections to empty array', () => {
		const result = MainMenuGroupSchema.parse({});
		expect(result.mainSections).toEqual([]);
	});

	it('NavigationSidebarSchema parses empty input', () => {
		expect(NavigationSidebarSchema.parse({})).toEqual({});
	});

	it('QuickActionsPanelSchema parses empty input', () => {
		expect(QuickActionsPanelSchema.parse({})).toEqual({});
	});

	it('ResourceCostPanelSchema defaults resourceUsage with sample values', () => {
		const result = ResourceCostPanelSchema.parse({});
		expect(result.resourceUsage.tokensUsed).toBe(4250);
		expect(result.resourceUsage.tokensTotal).toBe(10000);
		expect(result.resourceUsage.planImpact).toBe('medium');
	});

	it('ResultMenuGroupSchema defaults resultSections to empty array', () => {
		const result = ResultMenuGroupSchema.parse({});
		expect(result.resultSections).toEqual([]);
	});

	it('StubSectionSchema defaults title to Section', () => {
		const result = StubSectionSchema.parse({});
		expect(result.title).toBe('Section');
	});

	it('TopBarSchema parses empty input', () => {
		expect(TopBarSchema.parse({})).toEqual({});
	});
});
