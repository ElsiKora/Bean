import { ONE_CONSTANT, ZERO_CONSTANT } from "@domain/constant";

const buildLcsMatrix = (input: { afterLines: ReadonlyArray<string>; beforeLines: ReadonlyArray<string> }): Array<Array<number>> => {
	const matrix: Array<Array<number>> = Array.from({ length: input.beforeLines.length + ONE_CONSTANT }, (): Array<number> => {
		return Array.from({ length: input.afterLines.length + ONE_CONSTANT }, (): number => ZERO_CONSTANT);
	});

	for (let beforeIndex: number = ONE_CONSTANT; beforeIndex <= input.beforeLines.length; beforeIndex += ONE_CONSTANT) {
		for (let afterIndex: number = ONE_CONSTANT; afterIndex <= input.afterLines.length; afterIndex += ONE_CONSTANT) {
			const previousBeforeIndex: number = beforeIndex - ONE_CONSTANT;
			const previousAfterIndex: number = afterIndex - ONE_CONSTANT;
			const targetRow: Array<number> | undefined = matrix[beforeIndex];

			if (targetRow === undefined) {
				continue;
			}

			if (input.beforeLines[previousBeforeIndex] === input.afterLines[previousAfterIndex]) {
				targetRow[afterIndex] = (matrix[previousBeforeIndex]?.[previousAfterIndex] ?? ZERO_CONSTANT) + ONE_CONSTANT;

				continue;
			}

			targetRow[afterIndex] = Math.max(matrix[previousBeforeIndex]?.[afterIndex] ?? ZERO_CONSTANT, matrix[beforeIndex]?.[previousAfterIndex] ?? ZERO_CONSTANT);
		}
	}

	return matrix;
};

export class TextDiffService {
	public buildOperations(input: { afterLines: ReadonlyArray<string>; beforeLines: ReadonlyArray<string> }): Array<{ line: string; type: "delete" | "equal" | "insert" }> {
		const matrix: Array<Array<number>> = buildLcsMatrix(input);
		const operations: Array<{ line: string; type: "delete" | "equal" | "insert" }> = [];
		let beforeIndex: number = input.beforeLines.length;
		let afterIndex: number = input.afterLines.length;

		while (beforeIndex > ZERO_CONSTANT || afterIndex > ZERO_CONSTANT) {
			const hasBeforeLine: boolean = beforeIndex > ZERO_CONSTANT;
			const hasAfterLine: boolean = afterIndex > ZERO_CONSTANT;

			if (hasBeforeLine && hasAfterLine) {
				const previousBeforeIndex: number = beforeIndex - ONE_CONSTANT;
				const previousAfterIndex: number = afterIndex - ONE_CONSTANT;

				if (input.beforeLines[previousBeforeIndex] === input.afterLines[previousAfterIndex]) {
					operations.push({
						line: input.beforeLines[previousBeforeIndex] ?? "",
						type: "equal",
					});
					beforeIndex = previousBeforeIndex;
					afterIndex = previousAfterIndex;

					continue;
				}
			}

			if (!hasBeforeLine) {
				const previousAfterIndex: number = afterIndex - ONE_CONSTANT;
				operations.push({
					line: input.afterLines[previousAfterIndex] ?? "",
					type: "insert",
				});
				afterIndex = previousAfterIndex;

				continue;
			}

			if (!hasAfterLine) {
				const previousBeforeIndex: number = beforeIndex - ONE_CONSTANT;
				operations.push({
					line: input.beforeLines[previousBeforeIndex] ?? "",
					type: "delete",
				});
				beforeIndex = previousBeforeIndex;

				continue;
			}

			const topScore: number = matrix[beforeIndex - ONE_CONSTANT]?.[afterIndex] ?? ZERO_CONSTANT;
			const leftScore: number = matrix[beforeIndex]?.[afterIndex - ONE_CONSTANT] ?? ZERO_CONSTANT;

			if (leftScore >= topScore) {
				const previousAfterIndex: number = afterIndex - ONE_CONSTANT;
				operations.push({
					line: input.afterLines[previousAfterIndex] ?? "",
					type: "insert",
				});
				afterIndex = previousAfterIndex;
			} else {
				const previousBeforeIndex: number = beforeIndex - ONE_CONSTANT;
				operations.push({
					line: input.beforeLines[previousBeforeIndex] ?? "",
					type: "delete",
				});
				beforeIndex = previousBeforeIndex;
			}
		}

		operations.reverse();

		return operations;
	}
}
