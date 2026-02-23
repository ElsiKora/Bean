import type { TBeanTreeNodeType } from "../type";

import { ONE_CONSTANT, TREE_BRANCH_LAST_PREFIX_CONSTANT, TREE_BRANCH_MIDDLE_PREFIX_CONSTANT, TREE_CONTINUE_PREFIX_CONSTANT, TREE_EMPTY_PREFIX_CONSTANT } from "../constant";

export class BeanTreeRendererService {
	public render(input: TBeanTreeNodeType): string {
		const lines: Array<string> = [];

		const visit = (node: TBeanTreeNodeType, branchPrefix: string, continuationPrefix: string): void => {
			lines.push(`${branchPrefix}${node.label}`);
			const childNodes: ReadonlyArray<TBeanTreeNodeType> = node.children ?? [];

			for (const [index, childNode] of childNodes.entries()) {
				const isLastChild: boolean = index === childNodes.length - ONE_CONSTANT;
				const childBranchPrefix: string = `${continuationPrefix}${isLastChild ? TREE_BRANCH_LAST_PREFIX_CONSTANT : TREE_BRANCH_MIDDLE_PREFIX_CONSTANT}`;
				const childContinuationPrefix: string = `${continuationPrefix}${isLastChild ? TREE_EMPTY_PREFIX_CONSTANT : TREE_CONTINUE_PREFIX_CONSTANT}`;
				visit(childNode, childBranchPrefix, childContinuationPrefix);
			}
		};

		visit(input, "", "");

		return lines.join("\n");
	}
}
