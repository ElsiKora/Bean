import { describe, expect, it } from "vitest";
import { BeanTreeRendererService } from "../../../src/presentation/bean/service/bean-tree-renderer.service";

describe("BeanTreeRendererService", () => {
	it("renders nested tree with continuation prefixes", () => {
		const service = new BeanTreeRendererService();

		const rendered: string = service.render({
			children: [
				{
					children: [{ label: "grandchild-1" }, { label: "grandchild-2" }],
					label: "child-1",
				},
				{ label: "child-2" },
			],
			label: "root",
		});

		expect(rendered).toContain("root");
		expect(rendered).toContain("├─ child-1");
		expect(rendered).toContain("│  ├─ grandchild-1");
		expect(rendered).toContain("│  └─ grandchild-2");
		expect(rendered).toContain("└─ child-2");
	});
});
