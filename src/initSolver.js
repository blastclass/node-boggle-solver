import config from './config';
import findAdjacents from './findAdjacents';
import utils from './utils';

const MIN_WORD_LEN = config.minWordLen;

export default function initSolver(boggle, boggleSize, trie, minWordLen) {
  // allow the user to customise the minimum word length returned
  // the default is 3
  minWordLen = minWordLen || MIN_WORD_LEN;

  // create the matrix
  const boggleMatrix = utils.getBoggleMatrix(boggleSize, boggle);

  // create the results object that will contain
  // a word and corresponding co-ordinates
  const results = [];
  const wordList = [];

  // recursive solve algorithm
  const solve = function(word, position, deepCoords = [], deepUsed = []) {
    const [row, col] = position;
    const wordLen = word.length;

    // create new copies of both coords and used positions
    // for each letter
    const coords = deepCoords.slice();
    const used = deepUsed.slice();

    // push the current position into the co-ordinates array
    coords.push(position);

    // check if the current word is valid
    if (wordLen >= minWordLen) {
      const isValid = trie.hasWord(word);
      const isFound = wordList.includes(word);

      if (isValid && !isFound) {
        results.push({ word, coords });
        wordList.push(word);

        // reset co-ordinates ready for the next word
        deepCoords = [];
      }
    }

    // find adjacent letters in the matrix
    const adjacents = findAdjacents(position, boggleSize, deepUsed);

    // filter adjacents that are not valid prefixes
    const validAdjacents = adjacents.filter((adjacent) => {
      const [x, y] = adjacent;
      const isPrefix = trie.isPrefix(word + boggleMatrix[x][y]);

      return isPrefix;
    });

    validAdjacents.forEach((adjacent) => {
      used.push(position);

      const [x, y] = adjacent;
      const letter = boggleMatrix[x][y];
      const currentWord = word + letter;

      solve(currentWord, adjacent, coords, used);
    });
  };

  // solve each letter in turn
  boggleMatrix.forEach((row, rowIndex) => {
    row.forEach((col, colIndex) => {
      solve(boggleMatrix[rowIndex][colIndex], [rowIndex, colIndex]);
    });
  });

  return results;
};
