/**
 * TypeScript interface contracts for the Enterprise AI Backtest Platform main page.
 *
 * These types define the data shapes exchanged between organisms, molecules, and
 * mock data modules.
 *
 * All data is mock/sample — no live API or persistence.
 */

// ---------------------------------------------------------------------------
// Navigation & Routing
// ---------------------------------------------------------------------------

export type SectionId =
	| 'dashboard'
	| 'strategy-builder'
	| 'fundamental-screener'
	| 'technical-screener'
	| 'backtest-engine'
	| 'performance-result'
	| 'market-regime'
	| 'sentiment-events'
	| 'trade-log'
	| 'settings-billing';

export type NavGroup = 'main' | 'result';

export interface NavSection {
	id: SectionId;
	/** Canonical route path, e.g. '/research-workbench' */
	path: string;
	/** i18n message key — resolved via Paraglide m.* at render time */
	labelKey: string;
	/** Lucide icon component name */
	icon: string;
	group: NavGroup;
}

// ---------------------------------------------------------------------------
// Internationalization
// ---------------------------------------------------------------------------

export type Locale = 'en' | 'zh-TW';

// ---------------------------------------------------------------------------
// Dashboard — FR-007
// ---------------------------------------------------------------------------

export type MetricCategory = 'market' | 'risk' | 'rates' | 'usage';

export interface MarketMetric {
	id: string;
	label: string;
	value: string;
	delta: string;
	deltaPositive: boolean;
	category: MetricCategory;
}

export interface FunctionGatewayCard {
	id: SectionId;
	/** i18n message key */
	titleKey: string;
	descriptionKey: string;
	icon: string;
}

// ---------------------------------------------------------------------------
// Strategy Builder — FR-008 + Export JSON (FR-006)
// ---------------------------------------------------------------------------

export interface Strategy {
	market: string;
	fundamentalFilter: string;
	technicalFilter: string;
	backtestPeriod: string;
	positionSize: string;
	riskRule: string;
}

// ---------------------------------------------------------------------------
// Fundamental Screener — FR-009
// ---------------------------------------------------------------------------

export interface ScreenerResult {
	symbol: string;
	name: string;
	peRatio: number;
	evEbitda: number;
	fcfYield: number;
	roic: number;
	revenueGrowth: number;
	epsGrowth: number;
	/** Composite factor ranking score 0–100 */
	score: number;
}

// ---------------------------------------------------------------------------
// Backtest Engine — FR-011
// ---------------------------------------------------------------------------

export type BacktestMode =
	| 'Single Stock'
	| 'Watchlist'
	| 'Screener Result'
	| 'Index Universe'
	| 'Strategy Comparison'
	| 'Benchmark Comparison';

export type OrderType =
	| 'Market'
	| 'Limit'
	| 'Stop'
	| 'Stop-Limit'
	| 'Trailing Stop'
	| 'Bracket'
	| 'OCO'
	| 'Short Sell';

export interface BacktestParams {
	mode: BacktestMode;
	initialCapital: number;
	startDate: string;
	endDate: string;
	market: string;
	universe: string;
	timeframe: string;
	commissionModel: string;
	slippageModel: string;
	positionSize: string;
	stopLoss: number;
	takeProfit: number;
	direction: 'Long' | 'Short' | 'Both';
	rebalanceFrequency: string;
	orderTypes: OrderType[];
}

// ---------------------------------------------------------------------------
// Performance Result — FR-012, FR-013
// ---------------------------------------------------------------------------

export interface TimeSeriesPoint {
	date: string;
	value: number;
}

export interface MonthlyReturn {
	month: string;
	value: number;
}

export interface BacktestResult {
	totalReturn: number;
	netProfit: number;
	maxDrawdown: number;
	sharpeRatio: number;
	winRate: number;
	profitFactor: number;
	volatility: number;
	exposureTime: number;
	equityCurve: TimeSeriesPoint[];
	drawdownSeries: TimeSeriesPoint[];
	monthlyReturns: MonthlyReturn[];
	benchmarkSeries: TimeSeriesPoint[];
}

export interface MetricTile {
	id: string;
	label: string;
	value: string;
	unit: string;
	/** 0-based display order; mutable via drag-to-reorder */
	order: number;
}

export type ChartTab = 'equity-curve' | 'drawdown' | 'benchmark-overlay' | 'monthly-heatmap';

export interface RegimeBreakdown {
	regime: string;
	returnPct: number;
	maxDrawdown: number;
	winRate: number;
	tradeCount: number;
}

// ---------------------------------------------------------------------------
// Market Regime — FR-014
// ---------------------------------------------------------------------------

export type RegimeStatus = 'active' | 'inactive' | 'warning';

export interface MarketRegime {
	id: string;
	name: string;
	status: RegimeStatus;
	logicDescription: string;
	indicators: string[];
}

// ---------------------------------------------------------------------------
// Sentiment & Events — FR-015
// ---------------------------------------------------------------------------

export type SentimentEventType = 'news' | 'earnings' | 'fed' | 'macro' | 'insider' | 'social';
export type Sentiment = 'positive' | 'negative' | 'neutral';

export interface SentimentEvent {
	id: string;
	type: SentimentEventType;
	/** Empty string for macro/global events without a specific symbol */
	symbol: string;
	date: string;
	headline: string;
	sentiment: Sentiment;
	/** Score in range -1.0 to 1.0 */
	score: number;
}

// ---------------------------------------------------------------------------
// Trade Log — FR-016
// ---------------------------------------------------------------------------

export type TradeDirection = 'Long' | 'Short';

export interface TradeRecord {
	tradeId: string;
	symbol: string;
	direction: TradeDirection;
	entryDate: string;
	entryPrice: number;
	exitDate: string;
	exitPrice: number;
	quantity: number;
	commission: number;
	slippage: number;
	netPnl: number;
	returnPct: number;
	holdingDays: number;
	exitReason: string;
}

// ---------------------------------------------------------------------------
// Settings / Billing — FR-017
// ---------------------------------------------------------------------------

export interface UsageMetric {
	id: string;
	label: string;
	value: string;
	description?: string;
}

// ---------------------------------------------------------------------------
// AI Review Sidebar — FR-018
// ---------------------------------------------------------------------------

export type ConfidenceLevel = 'high' | 'medium' | 'low';
export type FlagSeverity = 'high' | 'medium' | 'low';
export type PlanImpact = 'low' | 'medium' | 'high';

export interface RiskFlag {
	id: string;
	label: string;
	severity: FlagSeverity;
	description: string;
}

export interface AIReview {
	grade: string;
	confidence: ConfidenceLevel;
	riskFlags: RiskFlag[];
}

export interface ResourceUsage {
	tokensUsed: number;
	tokensTotal: number;
	backtestsUsed: number;
	backtestsTotal: number;
	queuePosition: number;
	estimatedRuntime: string;
	complexityScore: number;
	planImpact: PlanImpact;
}

export interface ChatMessage {
	id: string;
	role: 'user' | 'assistant';
	content: string;
	timestamp: string;
}

// ---------------------------------------------------------------------------
// Edit Metric Modal — FR-019
// ---------------------------------------------------------------------------

export interface MetricEditPayload {
	tileId: string;
	newValue: string;
}

// ---------------------------------------------------------------------------
// Molecule Prop Contracts
// ---------------------------------------------------------------------------

/** Props for MetricTile molecule */
export interface MetricTileProps {
	tile: MetricTile | MarketMetric;
	draggable?: boolean;
	onDragStart?: (index: number) => void;
	onDragOver?: (e: DragEvent) => void;
	onDrop?: (index: number) => void;
	onDoubleClick?: (tile: MetricTile) => void;
}

/** Props for RegimeCard molecule */
export interface RegimeCardProps {
	regime: MarketRegime;
}

/** Props for NavItem molecule */
export interface NavItemProps {
	section: NavSection;
	isActive: boolean;
	href: string;
}

/** Props for FunctionGatewayCard molecule */
export interface FunctionGatewayCardProps {
	card: FunctionGatewayCard;
	onClick: () => void;
}

/** Props for RiskFlagItem molecule */
export interface RiskFlagItemProps {
	flag: RiskFlag;
}

/** Props for ScreenerResultRow molecule */
export interface ScreenerResultRowProps {
	result: ScreenerResult;
	onBacktest: (symbol: string) => void;
}
