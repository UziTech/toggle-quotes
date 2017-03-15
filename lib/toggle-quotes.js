'use babel'

export const toggleQuotes = (editor) => {
  editor.transact(() => {
    for (let cursor of editor.getCursors()) {
      let position = cursor.getBufferPosition()
      toggleQuoteAtPosition(editor, position)
      cursor.setBufferPosition(position)
    }
  })
}

const getNextQuoteCharacter = (quoteCharacter, allQuoteCharacters) => {
  let index = allQuoteCharacters.indexOf(quoteCharacter)
  if (index === -1) {
    return null
  } else {
    return allQuoteCharacters[(index + 1) % allQuoteCharacters.length]
  }
}

const toggleQuoteAtPosition = (editor, position) => {
  let quoteChars = atom.config.get('uzitech-toggle-quotes.quoteCharacters')
  let token = editor.tokenForBufferPosition(position);

  let range = getAnyRange(editor, position, quoteChars);
  if(!range){
    return
  }

  let text = editor.getTextInBufferRange(range)
  let [quoteCharacter] = text
  // In Python a string can have a prefix specifying its format. The Python
  // grammar includes this prefix in the string, and thus we need to exclude
  // it when toggling quotes
  let prefix = ''
  if (/[uUr]/.test(quoteCharacter)) {
    [prefix, quoteCharacter] = text
  }

  let nextQuoteCharacter = getNextQuoteCharacter(quoteCharacter, quoteChars)

  if (!nextQuoteCharacter) {
    return
  }

  // let quoteRegex = new RegExp(quoteCharacter, 'g')
  let escapedQuoteRegex = new RegExp(`\\\\${quoteCharacter}`, 'g')
  let nextQuoteRegex = new RegExp(nextQuoteCharacter, 'g')

  let newText = text
    .replace(nextQuoteRegex, `\\${nextQuoteCharacter}`)
    .replace(escapedQuoteRegex, quoteCharacter)

  newText = prefix + nextQuoteCharacter + newText.slice(1 + prefix.length, -1) + nextQuoteCharacter

  editor.setTextInBufferRange(range, newText)
}

function escapeRegExp(str) {
  return str.replace(/[\\^$.*+?()[\]{}|]/g, "\\$&");
}

function getRange(textEditor, position, quoteChars) {
  const token = textEditor.tokenForBufferPosition(position);
  const isQuotedString = token.scopes.some(function (scope) {
    return scope.includes("string.quoted");
  });

  if(!isQuotedString){
    return null;
  }

  const searchStart = [position.row, position.column - token.value.length - 2];
  const searchEnd = [position.row, position.column + token.value.length + 2];
  const searchRange = [searchStart, searchEnd];

  const linkRegexp = new RegExp("["+escapeRegExp(quoteChars)+"]"+escapeRegExp(token.value)+"["+escapeRegExp(quoteChars)+"]");
  let range = null;

  textEditor.scanInBufferRange(linkRegexp, searchRange, (found) => {
    range = found.range;
    found.stop();
  });
  return range;
}

function getAnyRange(textEditor, position, quoteChars) {
  quoteCharsRegex = new RegExp("["+escapeRegExp(quoteChars)+"]");
  let beginningRange = null;
  let endRange = null;
  let quote = null;
  textEditor.backwardsScanInBufferRange(quoteCharsRegex, [[0,0], position], function(found){
    beginningRange = found.range;
    quote = found.matchText;
    found.stop();
  });

  if(beginningRange === null){
    return;
  }

  textEditor.scanInBufferRange(new RegExp(escapeRegExp(quote)), [position, textEditor.getBuffer().getEndPosition()], function(found){
    endRange = found.range;
    found.stop();
  });

  if(endRange === null){
    return;
  }

  return [beginningRange.start, endRange.end];
}
