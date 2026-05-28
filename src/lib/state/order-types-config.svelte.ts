import { SvelteSet } from 'svelte/reactivity';
import { OrderTypesConfigSchema } from '$lib/schemas/order-types-config.schema';
import type { OrderType } from '$lib/schemas/order-types-config.schema';

const _defaults = OrderTypesConfigSchema.parse({});

class OrderTypesConfigState {
	selectedOrderTypes = new SvelteSet<OrderType>(_defaults.selectedOrderTypes as OrderType[]);

	reset() {
		const d = OrderTypesConfigSchema.parse({});
		this.selectedOrderTypes.clear();
		for (const t of d.selectedOrderTypes) {
			this.selectedOrderTypes.add(t as OrderType);
		}
	}
}

export const orderTypesConfigState = new OrderTypesConfigState();
