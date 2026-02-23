export class PromptValidationService {
	public validateRequired(value: string, isRequired: boolean): null | string {
		if (!isRequired) {
			return null;
		}

		if (value.trim().length === 0) {
			return "Value is required.";
		}

		return null;
	}

	public validateSelectRequired(selectedCount: number, isRequired: boolean): null | string {
		if (!isRequired) {
			return null;
		}

		if (selectedCount === 0) {
			return "Select at least one option.";
		}

		return null;
	}
}
