import type { IKeyEventInterface } from "@domain/interface/input/key-event.interface";

import type { TListCommandType } from "./type/list-command.type";
import type { TTextCommandType } from "./type/text-command.type";

import { KEY_MAP_CONSTANT } from "../../constant/prompt/key-map.constant";

export class PromptKeyDispatchService {
	public resolveListCommand(event: IKeyEventInterface): TListCommandType {
		if (event.NAME === KEY_MAP_CONSTANT.ESCAPE || (event.IS_CTRL && event.NAME === KEY_MAP_CONSTANT.CTRL_C) || (event.IS_CTRL && event.NAME === KEY_MAP_CONSTANT.CTRL_D)) {
			return "cancel";
		}

		if (event.NAME === KEY_MAP_CONSTANT.DOWN) {
			return "down";
		}

		if (event.NAME === KEY_MAP_CONSTANT.UP) {
			return "up";
		}

		if (event.NAME === KEY_MAP_CONSTANT.LEFT) {
			return "left";
		}

		if (event.NAME === KEY_MAP_CONSTANT.RIGHT) {
			return "right";
		}

		if (event.NAME === KEY_MAP_CONSTANT.SPACE) {
			return "space";
		}

		if (event.NAME === KEY_MAP_CONSTANT.BACKSPACE) {
			return "backspace";
		}

		if (event.NAME === KEY_MAP_CONSTANT.ENTER) {
			return "enter";
		}

		if (!event.IS_CTRL && !event.IS_META && event.SEQUENCE.length === 1) {
			return "text";
		}

		return "noop";
	}

	public resolveTextCommand(event: IKeyEventInterface): TTextCommandType {
		if (event.NAME === KEY_MAP_CONSTANT.ESCAPE || (event.IS_CTRL && event.NAME === KEY_MAP_CONSTANT.CTRL_C) || (event.IS_CTRL && event.NAME === KEY_MAP_CONSTANT.CTRL_D)) {
			return "cancel";
		}

		if (event.NAME === KEY_MAP_CONSTANT.ENTER) {
			return "enter";
		}

		if (event.NAME === KEY_MAP_CONSTANT.BACKSPACE) {
			return "backspace";
		}

		if (event.NAME === KEY_MAP_CONSTANT.LEFT) {
			return "left";
		}

		if (event.NAME === KEY_MAP_CONSTANT.RIGHT) {
			return "right";
		}

		if (event.NAME === KEY_MAP_CONSTANT.HOME) {
			return "home";
		}

		if (event.NAME === KEY_MAP_CONSTANT.END) {
			return "end";
		}

		if (event.NAME === KEY_MAP_CONSTANT.DELETE) {
			return "delete";
		}

		if (event.IS_CTRL && event.NAME === "a") {
			return "ctrl-a";
		}

		if (event.IS_CTRL && event.NAME === "k") {
			return "ctrl-k";
		}

		if (event.IS_CTRL && event.NAME === "u") {
			return "ctrl-u";
		}

		if (event.IS_CTRL && event.NAME === "w") {
			return "ctrl-w";
		}

		if (!event.IS_CTRL && !event.IS_META && event.SEQUENCE.length === 1) {
			return "text";
		}

		return "noop";
	}
}
