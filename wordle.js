/*
  Backend functions, that do not directly relate to the document.

  Copyright (c) 2025 Philip E. Turner. This file is licensed under the Apache License 2.0.
  Please read the license at https://PT-Hrothgar.github.io/LICENSE.txt.
*/

'use strict';

/*
  Return a new string with the character of 'orig' at index
  'index' changed to the string 'replacement'.
*/
function replaceAt(orig, index, replacement) {
    return orig.substring(0, index) + replacement + orig.substring(index + replacement.length);
}

/* Return the number of repeated letters in the given string. */
function repeatedLetters(word) {
    // Store all the letters the word has contained so far
    let newWord = '';
    let result = 0;

    // Loop through the word
    for (let c of word) {
        if (newWord.includes(c)) {
            // This letter is a repeat
            result++;
        } else {
            // This letter is not a repeat, so store it in 'newWord'
            newWord += c;
        }
    }
    return result;
}

/*
  Return a five-letter set of colors as feedback, if the Wordle user
  guessed 'guess' for the word 'target'.
*/
function getFeedback(guess, target) {
    // Ensure the arguments are 5 letters long
    if (guess.length != 5 || target.length != 5) {
        throw 'Cannot generate feedback unless both guess and target are 5 letters long';
    }

    // Result string, in which all letters are 'b' for black by default
    let result = 'bbbbb';
    // Which letters in the target word we have already processed
    const usedLettersInTarget = [false, false, false, false, false];

    // See which slots in 'result' will be green
    for (let i = 0; i < 5; i++) {
        if (target[i] == guess[i]) {
            result = replaceAt(result, i, 'g');
            // Record having used this character, so that
            // we don't try to turn it yellow later.
            usedLettersInTarget[i] = true;
        }
    }

    // See which slots in 'result' will be yellow
    for (let i = 0; i < 5; i++) {
        if (!usedLettersInTarget[i]) {
            // This letter was not matched in the right location;
            // see if it was matched in a wrong location
            for (let j = 0; j < 5; j++) {
                // See if this letter in 'guess' is a match that
                // has not already been turned green or yellow.
                if (guess[j] == target[i] && result[j] == 'b') {
                    // This letter in 'guess' should be yellow.
                    result = replaceAt(result, j, 'y');
                    // Break out so that we don't record more than
                    // one yellow letter for this letter of the target.
                    break;
                }
            }
        }
    }
    return result;
}

/*
  Return true if the given guesses would generate the given colors
  respectively as feedback, if the Wordle word was the given word.
*/
function matchesGuesses(word, guesses, colors) {
    // Loop through the guesses and colors
    for (let i = 0; i < guesses.length; i++) {
        // If the feedback for this guess would differ
        // from this set of colors, return false
        if (getFeedback(guesses[i], word) != colors[i]) {
            return false;
        }
    }
    // Each of the guesses generated the corresponding
    // set of colors as feedback, so return true
    return true;
}

/*
  Return an array of all the words that would produce
  the given colors for the given guesses as feedback.
  Take results from the given word list.
*/
function getWords(guesses, colors, wordList) {
    // Ensure that there are the same number of sets of colors as guesses
    if (guesses.length != colors.length) {
        throw 'There must be the same number of guesses as sets of colors';
    }

    // Array of result words
    const result = [];

    // Loop the given word list
    for (let word of wordList) {
        if (matchesGuesses(word, guesses, colors)) {
            // Record this word, as it is a possibility.
            result.push(word);
        }
    }
    return result;
}
