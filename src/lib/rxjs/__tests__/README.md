# RxJS Stream Tests

## Testing Approach

- **Value assertions**: `firstValueFrom(subject$)` after `refresh()` call with mocked `apiClient`
- **Error path**: mock `apiClient` to reject; assert `error$` emits and `data$` retains prior value
- **`loading$` transitions**: subscribe before calling `refresh()`, collect emissions, assert sequence
- **switchMap cancellation**: call `refresh()` twice with first mock delayed; assert only second result emits

All mocks use `vi.fn()` from Vitest. `apiClient` is mocked at the module level via `vi.mock`.
No `TestScheduler` is required for these tests — Promise-based mocks with `await` are sufficient.
