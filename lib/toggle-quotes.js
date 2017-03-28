"use babel";
/* globals atom */

export const toggleQuotes = (editor) => {
	editor.transact(() => {
		const ranges = editor.getSelectedBufferRanges();
		for (let range of ranges) {
			toggleQuoteAtRange(editor, range);
		}
		editor.setSelectedBufferRanges(ranges);
	});
};

const getNextQuoteCharacter = (quoteCharacter, allQuoteCharacters) => {
	let index = allQuoteCharacters.indexOf(quoteCharacter);
	if (index === -1) {
		return null;
	}
		return allQuoteCharacters[(index + 1) % allQuoteCharacters.length];

};

const toggleQuoteAtRange = (editor, range) => {
	let quoteChars = atom.config.get("uzitech-toggle-quotes.quoteCharacters");

	let qRange = getAnyRange(editor, range, quoteChars);
	if (!qRange) {
		return;
	}

	let text = editor.getTextInBufferRange(qRange);
	let [quoteCharacter] = text;
	// In Python a string can have a prefix specifying its format. The Python
	// grammar includes this prefix in the string, and thus we need to exclude
	// it when toggling quotes
	let prefix = "";
	if (/[uUr]/.test(quoteCharacter)) {
    [prefix, quoteCharacter] = text;
	}

	let nextQuoteCharacter = getNextQuoteCharacter(quoteCharacter, quoteChars);

	if (!nextQuoteCharacter) {
		return;
	}

	// let quoteRegex = new RegExp(quoteCharacter, 'g')
	let escapedQuoteRegex = new RegExp(`\\\\${quoteCharacter}`, "g");
	let nextQuoteRegex = new RegExp(nextQuoteCharacter, "g");

	let newText = text
		.replace(nextQuoteRegex, `\\${nextQuoteCharacter}`)
		.replace(escapedQuoteRegex, quoteCharacter);

	newText = prefix + nextQuoteCharacter + newText.slice(1 + prefix.length, -1) + nextQuoteCharacter;

	editor.setTextInBufferRange(qRange, newText);
};

function escapeRegExp(str) {
	return str.replace(/[\\^$.*+?()[\]{}|]/g, "\\$&");
}

function getAnyRange(textEditor, range, quoteChars) {
	const quoteCharsRegex = new RegExp("[" + escapeRegExp(quoteChars) + "]");
	let beginningRange = null;
	let endRange = null;
	let quote = null;
	textEditor.backwardsScanInBufferRange(quoteCharsRegex, [[0, 0], range.start], function (found) {
		beginningRange = found.range;
		quote = found.matchText;
		found.stop();
	});

	if (beginningRange === null) {
		return;
	}

	textEditor.scanInBufferRange(new RegExp(escapeRegExp(quote)), [range.end, textEditor.getBuffer().getEndPosition()], function (found) {
		endRange = found.range;
		found.stop();
	});

	if (endRange === null) {
		return;
	}

	return [beginningRange.start, endRange.end];
}
