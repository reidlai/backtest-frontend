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
	it('AIReviewPanelSchema parses empty input', () => {
		expect(AIReviewPanelSchema.parse({})).toEqual({});
	});

	it('AIReviewSidebarSchema parses empty input', () => {
		expect(AIReviewSidebarSchema.parse({})).toEqual({});
	});

	it('DashboardMetricGridSchema parses empty input', () => {
		expect(DashboardMetricGridSchema.parse({})).toEqual({});
	});

	it('FunctionGatewaysSchema defaults gatewayCards to empty array', () => {
		const result = FunctionGatewaysSchema.parse({});
		expect(result.gatewayCards).toEqual([]);
	});

	it('LiveControlFormSchema parses empty input', () => {
		expect(LiveControlFormSchema.parse({})).toEqual({});
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

	it('ResourceCostPanelSchema parses empty input', () => {
		expect(ResourceCostPanelSchema.parse({})).toEqual({});
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
