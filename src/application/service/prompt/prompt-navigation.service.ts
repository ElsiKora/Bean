import type { SelectOptionValueObject } from "@domain/value-object/select-option.value-object";

export class PromptNavigationService {
	public findFirstEnabledIndex(options: ReadonlyArray<SelectOptionValueObject>): number {
		return options.findIndex((option: SelectOptionValueObject): boolean => !option.isDisabled && !option.isSeparator);
	}

	public groupByName(options: ReadonlyArray<SelectOptionValueObject>): Map<string, Array<SelectOptionValueObject>> {
		const grouped: Map<string, Array<SelectOptionValueObject>> = new Map<string, Array<SelectOptionValueObject>>();

		for (const option of options) {
			const groupName: string = option.group ?? "default";
			const group: Array<SelectOptionValueObject> = grouped.get(groupName) ?? [];
			group.push(option);
			grouped.set(groupName, group);
		}

		return grouped;
	}

	public moveNext(currentIndex: number, optionCount: number, withLoop: boolean = true): number {
		if (optionCount <= 0) {
			return 0;
		}

		if (!withLoop) {
			return Math.min(currentIndex + 1, optionCount - 1);
		}

		return (currentIndex + 1) % optionCount;
	}

	public moveNextEnabled(currentIndex: number, options: ReadonlyArray<SelectOptionValueObject>, withLoop: boolean = true): number {
		if (options.length === 0) {
			return 0;
		}

		let index: number = currentIndex;
		let iteration: number = 0;

		while (iteration < options.length) {
			index = this.moveNext(index, options.length, withLoop);

			if (!options[index]?.isDisabled && !options[index]?.isSeparator) {
				return index;
			}

			if (!withLoop && index === options.length - 1) {
				return currentIndex;
			}

			iteration += 1;
		}

		return currentIndex;
	}

	public movePrevious(currentIndex: number, optionCount: number, withLoop: boolean = true): number {
		if (optionCount <= 0) {
			return 0;
		}

		if (!withLoop) {
			return Math.max(currentIndex - 1, 0);
		}

		return (currentIndex - 1 + optionCount) % optionCount;
	}

	public movePreviousEnabled(currentIndex: number, options: ReadonlyArray<SelectOptionValueObject>, withLoop: boolean = true): number {
		if (options.length === 0) {
			return 0;
		}

		let index: number = currentIndex;
		let iteration: number = 0;

		while (iteration < options.length) {
			index = this.movePrevious(index, options.length, withLoop);

			if (!options[index]?.isDisabled && !options[index]?.isSeparator) {
				return index;
			}

			if (!withLoop && index === 0) {
				return currentIndex;
			}

			iteration += 1;
		}

		return currentIndex;
	}

	public toggleIndex(selectedIndices: ReadonlySet<number>, cursorIndex: number): Set<number> {
		const next: Set<number> = new Set<number>(selectedIndices);

		if (next.has(cursorIndex)) {
			next.delete(cursorIndex);
		} else {
			next.add(cursorIndex);
		}

		return next;
	}
}
