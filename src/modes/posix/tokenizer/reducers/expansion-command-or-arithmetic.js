'use strict';

const last = require('array-last');
const t = require('../../../../utils/tokens');

const continueToken = t.continueToken;

module.exports = function expansionCommandOrArithmetic(state, source, reducers) {
	const char = source && source.shift();
	const xp = last(state.expansion);

	if (char === '(' && state.current.slice(-2) === '$(') {

		if (state.expansionTokenCount) {
			state.replaceLastExpansion({command: (xp.command || '') + char})
		}

		return {
			nextReduction: reducers.expansionArithmetic,
			nextState: state.appendChar(char),
		};
	}

	if (!state.escaping && char === "$") {
		return {
			nextReduction: reducers.expansionStart,
			nextState: state.appendChar(char).addExpansionTokenCount().replaceLastExpansion({command: (xp.command || '') + char}),
		};
	}

	if (char === undefined) {
		return {
			nextReduction: state.previousReducer,
			tokensToEmit: [continueToken('$(')],
			nextState: state.replaceLastExpansion({
				loc: Object.assign({}, xp.loc, {end: state.loc.previous})
			})
		};
	}

	if (char === ")") {
		
		if (!state.expansionTokenCount) {
			
			return {
				nextReduction: state.previousReducer,
				nextState: state.appendChar(char).replaceLastExpansion({
					type: "command_expansion",
					loc: Object.assign({}, xp.loc, {
						end: state.loc.current,
					}),
				}),
			};

		} else {
			
			return {
				nextReduction: reducers.expansionCommandOrArithmetic,
				nextState: state.appendChar(char).removeExpansionTokenCount().replaceLastExpansion({command: (xp.command || '') + char})
			}
		}
	}

	return {
		nextReduction: reducers.expansionCommandOrArithmetic,
		nextState: state.appendChar(char).replaceLastExpansion({command: (xp.command || '') + char})
	};
};
