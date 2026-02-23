import type { RenderFrameEntity } from "@domain/entity/render-frame.entity";

export class FrameDiffService {
	public hasChanged(previous: null | RenderFrameEntity, next: RenderFrameEntity): boolean {
		if (previous === null) {
			return true;
		}

		if (previous.LINES.length !== next.LINES.length) {
			return true;
		}

		if (previous.CURSOR.row !== next.CURSOR.row || previous.CURSOR.column !== next.CURSOR.column) {
			return true;
		}

		for (let index: number = 0; index < previous.LINES.length; index += 1) {
			if (previous.LINES[index] !== next.LINES[index]) {
				return true;
			}
		}

		return false;
	}
}
