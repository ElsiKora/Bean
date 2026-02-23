import type { BeanAdapter } from "../../../src/presentation/bean/adapter";
import type { IBeanSpinnerHandleInterface } from "../../../src/presentation/interface";

import { describe, expect, it, vi } from "vitest";

import { BeanFluentApi } from "../../../src/presentation/bean/bean-fluent.presenter";

const createSpinnerHandle = (): IBeanSpinnerHandleInterface => {
	let isSpinning: boolean = true;

	return {
		fail: vi.fn((): void => {
			isSpinning = false;
		}),
		info: vi.fn((): void => {
			isSpinning = false;
		}),
		get isSpinning(): boolean {
			return isSpinning;
		},
		stop: vi.fn((): void => {
			isSpinning = false;
		}),
		succeed: vi.fn((): void => {
			isSpinning = false;
		}),
		update: vi.fn(),
		warn: vi.fn((): void => {
			isSpinning = false;
		}),
	};
};

describe("BeanFluentApi", () => {
	it("delegates all fluent methods and resolves callbacks", async () => {
		const firstSpinnerHandle: IBeanSpinnerHandleInterface = createSpinnerHandle();
		const secondSpinnerHandle: IBeanSpinnerHandleInterface = createSpinnerHandle();
		const spinnerHandles: Array<IBeanSpinnerHandleInterface> = [firstSpinnerHandle, secondSpinnerHandle];
		const resolvedDate: Date = new Date("2026-02-22T00:00:00.000Z");
		const beanAdapter: Partial<BeanAdapter> = {
			confirm: vi.fn(async (): Promise<boolean> => true),
			date: vi.fn(async (): Promise<Date> => resolvedDate),
			editor: vi.fn(async (): Promise<string> => "edited"),
			groupMultiselect: vi.fn(async (): Promise<ReadonlyArray<string>> => ["grouped"]),
			intro: vi.fn(),
			list: vi.fn(async (): Promise<ReadonlyArray<string>> => ["a", "b"]),
			message: vi.fn(),
			multiselect: vi.fn(async (): Promise<ReadonlyArray<string>> => ["multi"]),
			number: vi.fn(async (): Promise<number> => 42),
			outro: vi.fn(),
			password: vi.fn(async (): Promise<string> => "secret"),
			select: vi.fn(async (): Promise<string> => "selected"),
			spinner: vi.fn((): IBeanSpinnerHandleInterface => spinnerHandles.shift() ?? createSpinnerHandle()),
			step: vi.fn(),
			text: vi.fn(async (): Promise<string> => "typed"),
			toggle: vi.fn(async (): Promise<boolean> => true),
		};
		const resolvedValues: Array<unknown> = [];

		await new BeanFluentApi({ beanAdapter: beanAdapter as BeanAdapter })
			.confirm({
				message: "confirm",
				onResolved: (value: boolean | null): void => {
					resolvedValues.push(value);
				},
			})
			.date({
				message: "date",
				onResolved: (value: Date | null): void => {
					resolvedValues.push(value);
				},
			})
			.editor({
				message: "editor",
				onResolved: (value: null | string): void => {
					resolvedValues.push(value);
				},
			})
			.groupMultiselect({
				message: "group-multi",
				onResolved: (value: null | ReadonlyArray<string>): void => {
					resolvedValues.push(value);
				},
				options: [],
			})
			.intro("intro")
			.message("message")
			.list({
				message: "list",
				onResolved: (value: null | ReadonlyArray<string>): void => {
					resolvedValues.push(value);
				},
			})
			.multiselect({
				message: "multi",
				onResolved: (value: null | ReadonlyArray<string>): void => {
					resolvedValues.push(value);
				},
				options: [],
			})
			.number({
				message: "number",
				onResolved: (value: null | number): void => {
					resolvedValues.push(value);
				},
			})
			.outro("outro")
			.password({
				message: "password",
				onResolved: (value: null | string): void => {
					resolvedValues.push(value);
				},
			})
			.select({
				message: "select",
				onResolved: (value: null | string): void => {
					resolvedValues.push(value);
				},
				options: [],
			})
			.spinner({ text: "spinner-stop" })
			.spinner({
				task: async (handle: IBeanSpinnerHandleInterface): Promise<void> => {
					handle.update("working");
				},
				text: "spinner-task",
			})
			.step("step")
			.text({
				message: "text",
				onResolved: (value: null | string): void => {
					resolvedValues.push(value);
				},
			})
			.toggle({
				message: "toggle",
				onResolved: (value: boolean | null): void => {
					resolvedValues.push(value);
				},
			})
			.run();

		expect(beanAdapter.confirm).toHaveBeenCalledTimes(1);
		expect(beanAdapter.date).toHaveBeenCalledTimes(1);
		expect(beanAdapter.editor).toHaveBeenCalledTimes(1);
		expect(beanAdapter.groupMultiselect).toHaveBeenCalledTimes(1);
		expect(beanAdapter.intro).toHaveBeenCalledTimes(1);
		expect(beanAdapter.list).toHaveBeenCalledTimes(1);
		expect(beanAdapter.message).toHaveBeenCalledTimes(1);
		expect(beanAdapter.multiselect).toHaveBeenCalledTimes(1);
		expect(beanAdapter.number).toHaveBeenCalledTimes(1);
		expect(beanAdapter.outro).toHaveBeenCalledTimes(1);
		expect(beanAdapter.password).toHaveBeenCalledTimes(1);
		expect(beanAdapter.select).toHaveBeenCalledTimes(1);
		expect(beanAdapter.spinner).toHaveBeenCalledTimes(2);
		expect(beanAdapter.step).toHaveBeenCalledTimes(1);
		expect(beanAdapter.text).toHaveBeenCalledTimes(1);
		expect(beanAdapter.toggle).toHaveBeenCalledTimes(1);
		expect(firstSpinnerHandle.stop).toHaveBeenCalledTimes(1);
		expect(secondSpinnerHandle.succeed).toHaveBeenCalledTimes(1);
		expect(secondSpinnerHandle.update).toHaveBeenCalledTimes(1);
		expect(resolvedValues).toEqual([true, resolvedDate, "edited", ["grouped"], ["a", "b"], ["multi"], 42, "secret", "selected", "typed", true]);
	});

	it("fails spinner task and rethrows error", async () => {
		const spinnerHandle: IBeanSpinnerHandleInterface = createSpinnerHandle();
		const beanAdapter: Partial<BeanAdapter> = {
			spinner: vi.fn((): IBeanSpinnerHandleInterface => spinnerHandle),
		};

		const runPromise = new BeanFluentApi({ beanAdapter: beanAdapter as BeanAdapter })
			.spinner({
				task: async (): Promise<void> => {
					throw new Error("spinner failed");
				},
				text: "spinner-fail",
			})
			.run();

		await expect(runPromise).rejects.toThrow("spinner failed");
		expect(spinnerHandle.fail).toHaveBeenCalledTimes(1);
	});
});
