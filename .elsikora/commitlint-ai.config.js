export default {
	maxRetries: 3,
	mode: "auto",
	model: "claude-opus-4-5",
	provider: "anthropic",
	ticket: {
		source: "auto",
		pattern: "[a-z]{2,}-[0-9]+",
		patternFlags: "i",
		normalization: "upper",
		missingBranchLintBehavior: "error",
	},
	validationMaxRetries: 3,
};
