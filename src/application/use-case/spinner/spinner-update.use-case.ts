import type { SpinnerStateEntity } from "@domain/entity/spinner-state.entity";

export class SpinnerUpdateUseCase {
	public execute(input: { state: SpinnerStateEntity; text: string }): SpinnerStateEntity {
		if (!input.state.IS_ACTIVE) {
			return input.state.with({ text: input.text });
		}

		const runtime: { currentState: SpinnerStateEntity; render: (state: SpinnerStateEntity) => void } | null = input.state.TIMER_HANDLE as {
			currentState: SpinnerStateEntity;
			render: (state: SpinnerStateEntity) => void;
		} | null;
		const nextState: SpinnerStateEntity = input.state.with({ text: input.text });

		if (runtime !== null) {
			runtime.currentState = nextState;
		}
		runtime?.render(nextState);

		return nextState;
	}
}
