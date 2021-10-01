'use strict';

const last = require('array-last');
const t = require('../../../../utils/tokens');

const continueToken = t.continueToken;

module.exports = function expansionArithmetic(state, source, reducers) {
	const char = source && source.shift();

	const xp = last(state.expansion);
	
	
	if (char === ')' && state.current.slice(-1)[0] === ')') {
		
		if (state.expansionTokenCount > 0) {
			return {
				nextReduction: reducers.expansionCommandOrArithmetic,
				nextState: state.appendChar(char).replaceLastExpansion({command: (xp.command || '') + char}).removeExpansionTokenCount()
			}
		}
		
		return {
			nextReduction: state.previousReducer,
			nextState: state
				.appendChar(char)
				.replaceLastExpansion({
					type: 'arithmetic_expansion',
					expression: xp.value.slice(0, -1),
					loc: Object.assign({}, xp.loc, {end: state.loc.current})
				})
				.removeExpansionTokenCount()
				.deleteLastExpansionValue()
		};
	}

	if (char === undefined) {
		return {
			nextReduction: state.previousReducer,
			tokensToEmit: [continueToken('$((')],
			nextState: state.replaceLastExpansion({
				loc: Object.assign({}, xp.loc, {end: state.loc.previous})
			})
		};
	}
	
	return state.expansionTokenCount > 0 ? {
		nextReduction: expansionArithmetic,
		nextState: state.appendChar(char).replaceLastExpansion({command: (xp.command || '') + char})
	} :	{
		nextReduction: expansionArithmetic,
		nextState: state.appendChar(char).replaceLastExpansion({value: (xp.value || '') + char})
	};
};
