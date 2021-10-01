'use strict';

const last = require('array-last');

function isSpecialParameter(char) {
	return char.match(/^[0-9\-!@#\?\*\$]$/);
}

module.exports = function expansionStart(state, source, reducers) {
	const char = source && source.shift();
	
	const xp = last(state.expansion);

	if (char === '{') {
		
		if (state.expansionTokenCount > 0) {
			state.replaceLastExpansion({command: (xp.command || '') + char});
		}

		return {
			nextReduction: reducers.expansionParameterExtended,
			nextState: state.appendChar(char)
		};
	}

	if (char === '(') {
		
		if (state.expansionTokenCount > 0) {
			state.replaceLastExpansion({command: (xp.command || '') + char});
		}

		return {
			nextReduction: reducers.expansionCommandOrArithmetic,
			nextState: state.appendChar(char)
		};
	}

	if (char.match(/[a-zA-Z_]/)) {

		if (state.expansionTokenCount > 0) {
			
			return {
				nextReduction: reducers.expansionParameter,
				nextState: state.appendChar(char).replaceLastExpansion({command: (xp.command || '') + char})
			}
		}

		return {
			nextReduction: reducers.expansionParameter,
			nextState: state.appendChar(char).replaceLastExpansion({
				parameter: char,
				type: 'parameter_expansion'
			})
		};
	}

	if (isSpecialParameter(char)) {

		if (state.expansionTokenCount > 0) {
			return {
				nextReduction: reducers.expansionCommandOrArithmetic,
				nextState: state.appendChar(char).removeExpansionTokenCount().replaceLastExpansion({command: (xp.command || '') + char})
			}
		}

		return reducers.expansionSpecialParameter(state, [char].concat(source));
	}

	return state.previousReducer(state, [char].concat(source));
};
