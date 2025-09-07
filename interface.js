/*
  User interface functions.

  Copyright (c) 2025 Philip E. Turner. This file is licensed under the Apache License 2.0.
  Please read the license at https://PT-Hrothgar.github.io/LICENSE.txt.
*/

'use strict';

// Whether the user is currently able to add a new word, edit an existing word, etc.
let enabled = true;
// Number of words that currently exist
let wordCount = 0;
// Maximum number of words the user is allowed to input
const MAX_WORDS = 6;
// Key-value pairs for all the properties common to all text inputs
const INPUT_PROPERTIES = {
    autocomplete: 'off',
    autofocus: 'autofocus',
    maxlength: '5',
    size: 8
};

/*
  Return a new text input area with the given id, with all the
  properties specified in the INPUT_PROPERTIES constant.
*/
function createInputField(inputId) {
    // Create the input area
    const newInput = document.createElement('input');
    // Set the input's id and class
    newInput.classList.add('word-input');
    newInput.id = 'input' + inputId;
    // The 'placeholder' attribute has to contain the input's id, so we'll set it here
    newInput.setAttribute('placeholder', 'Guess #' + (inputId + 1));

    // Add an event listener for input into the field
    newInput.addEventListener('input', function() {
        checkInput(Number(this.id[5]));
    });

    // Make sure that the input responds to Enter/Return being pressed
    newInput.addEventListener('keydown', function(key) {
        if (key.key === 'Enter') {
            checkInput(Number(this.id[5]));
        }
    });

    // Set the properties defined at the top of the file
    // (They are common to all input fields; they do not have to contain the input's id)
    for (let property in INPUT_PROPERTIES) {
        newInput.setAttribute(property, INPUT_PROPERTIES[property]);
    }

    return newInput;
}

/*
  Return the color of the given DOM element representing one letter of a word.
  Return 'b' if the letter is gray, 'y' if it is yellow, or 'g' if it is green.
  If the element's classList is undefined, or if it is none of these colors,
  return undefined.
*/
function getColor(element) {
    if (element.classList === undefined) {
        throw 'Cannot get color of object with no classList';
    }

    // Here we have, for each color, the class name representing it
    // and the one-letter value to return.
    const colorMappings = [
        ['gray', 'b'],
        ['yellow', 'y'],
        ['green', 'g']
    ]

    // Loop through 'colorMappings'
    for (let color of colorMappings) {
        if (element.classList.contains(color[0])) {
            // Return the letter for this color.
            return color[1];
        }
    }
    // It was none of those colors.
    throw 'Object had no color';
}

/*
  Return the word represented by the given DOM object.
  To be precise, this function returns a string containing the inner HTML of each of
  the given word's child nodes that have class='color-div', concatenated together.
*/
function readWord(word) {
    // Check that we have a DOM object
    if (word.childNodes === undefined) {
        throw 'Expected DOM object';
    }

    let result = '';

    // Loop through the child nodes
    for (let letter of word.childNodes) {
        // See if this is a letter
        if (letter.classList.contains('color-div')) {
            // Concatenate this letter to 'result' as long as it is defined
            if (letter.innerHTML !== undefined) {
                result += letter.innerHTML;
            }
        }
    }

    return result;
}

/*
  Read the inputted words from the document, and the color of each letter,
  and return an array of all the possible words that would produce those
  colors for those guesses.
  Use the word list specified in the 'which-results' radio input.
*/
function getWordsFromDoc() {
    // All the words the user has inputted
    const words = [],
        // All the five-letter sets of colors (e.g. 'ygbbg')
        colors = [],
        // The DOM objects representing the words
        domWords = document.getElementsByClassName('word'),
        // The word list to use
        wordList = (document.querySelector('input[name="which-results"]:checked').value ===
            'out' ? outputWords : inputWords).slice();

    // Loop through the words
    for (let word of domWords) {
        // The word this DOM element represents
        let newWord = readWord(word);
        // The five-letter set of colors for this word (e.g. 'ygbbg')
        let newColor = '';

        // Loop through all the letters of this word
        for (let letter of word.childNodes) {
            // Concatenate the color of this letter to 'newColor' if it is defined
            try {
                newColor += getColor(letter);
            } catch (err) {}
        }

        // Record this word and this set of colors, as long as they both have length 5
        if (newWord.length === 5 && newColor.length === 5) {
            words.push(newWord);
            colors.push(newColor);
        }
    }

    return getWords(words, colors, wordList);
}

/*
  Strip all trailing non-alphabetic characters, and all characters
  after the 5th, from the value of the given DOM text input field.
*/
function resetInput(input) {
    // Validate the parameter
    if (input.value === undefined) {
        throw 'resetInput() expected DOM text input field';
    }

    // New value of the field
    let result = '';
    // Go through the current value of this field
    for (let char of input.value) {
        if (char.search(/[a-zA-Z]/) === -1 || result.length === 5) {
            // This character is non-alphabetic (or we've already
            // recorded 5 characters), so break out of this loop
            break;
        } else {
            // This character is alphabetic, so concatenate
            // it to the new value of the field
            result += char;
        }
    }
    // Set the field's value to be the new value
    input.value = result;
}

/*
  Show the given DOM element by setting its CSS 'display' property
  to the specified value, which defaults to 'block', and its
  'visibility' property to 'visible'.
*/
function show(elem, displayValue = 'block') {
    // Ensure that we have a DOM element
    if (elem.style === undefined) {
        throw 'Expected DOM element';
    }

    elem.style.display = displayValue;
    elem.style.visibility = 'visible';
}

/*
  Hide the given DOM element by setting its CSS 'display' property
  to 'none', and its 'visibility' property to 'hidden'.
*/
function hide(elem) {
    // Ensure that we have a DOM element
    if (elem.style === undefined) {
        throw 'Expected DOM element';
    }

    elem.style.display = 'none';
    elem.style.visibility = 'hidden';
}

/*
  Determine if the given letter can legally be gray, according to the Wordle algorithm.

  Return false if the given letter has a following sibling identical to itself that is yellow.
*/
function grayAllowed(letter) {
    // Check the parameter
    if (letter.classList === undefined) {
        throw 'Expected DOM element';
    }
    if (!letter.classList.contains('color-div')) {
        throw 'Expected letter with class="color-div"';
    }

    let sibling = letter;

    // Go one element further forward in the given letter's siblings each iteration
    while (true) {
        sibling = sibling.nextElementSibling;
        if (sibling === null || !sibling.classList.contains('color-div')) {
            // We got to the end of the word, so return true
            return true;
        } else if (sibling.classList.contains('yellow') && sibling.innerHTML === letter.innerHTML) {
            return false;
        }
    }
}

/*
  Determine if the given letter can legally be yellow, according to the Wordle algorithm.

  Return false if the given letter has a previous sibling identical to itself that is gray.
*/
function yellowAllowed(letter) {
    // Check the parameter
    if (letter.classList === undefined) {
        throw 'Expected DOM element';
    }
    if (!letter.classList.contains('color-div')) {
        throw 'Expected letter with class="color-div"';
    }

    let sibling = letter;

    // Go one element further back in the given letter's siblings each iteration
    while (true) {
        sibling = sibling.previousElementSibling;
        if (sibling === null || !sibling.classList.contains('color-div')) {
            // We got to the beginning of the word, so return true
            return true;
        } else if (sibling.classList.contains('gray') && sibling.innerHTML === letter.innerHTML) {
            return false;
        }
    }
}

/*
  Change the given letter to the next available color.
  Change yellow to green, green to gray or yellow, and gray to yellow or green, as appropriate.
*/
function nextColor(letter) {
    // Check the parameter
    if (letter.classList === undefined) {
        throw 'Expected DOM element';
    }
    if (!letter.classList.contains('color-div')) {
        throw 'Expected letter with class="color-div"';
    }

    if (letter.classList.contains('yellow')) {
        letter.classList.remove('yellow');
        letter.classList.add('green');
    } else if (letter.classList.contains('green')) {
        letter.classList.remove('green');

        // See if this letter is allowed to be gray or not
        if (grayAllowed(letter)) {
            letter.classList.add('gray');
        } else {
            // Since it is not allowed to be gray, go directly to yellow
            letter.classList.add('yellow');
        }
    } else if (letter.classList.contains('gray')) {
        letter.classList.remove('gray');

        // See if this letter is allowed to be yellow or not
        if (yellowAllowed(letter)) {
            letter.classList.add('yellow');
        } else {
            // Since it is not allowed to be yellow, go directly to green
            letter.classList.add('green');
        }
    } else {
        throw 'Letter had no color';
    }
}

/*
  Check the value of the <input> element with the given id, and update it (by converting
  it to upper case, etc.) If the input has a 5-letter word in it, remove the input
  and add a <div class="word"> child to the word grid, containing the new word.
*/
function checkInput(inputId) {
    // Get the input element from the document
    const input = document.getElementById('input' + inputId);

    if (input.value.search(/^[a-zA-Z]{0,5}$/) === -1) {
        // This field contains non-alphabetic characters, so strip them
        resetInput(input);
    }

    // Convert the field's value to upper case
    input.value = input.value.toUpperCase();

    // If the word in this input is fewer than 5 letters long, we're done here
    if (input.value.length < 5) {
        return;
    }

    // The new <div> element that will contain this word
    const newWord = document.createElement('div');
    // Set its class and id
    newWord.classList.add('word');
    newWord.id = 'word' + inputId;
    // Variables for populating a new word
    let letter, text;

    // Get each letter of the word in turn
    for (let i = 0; i < 5; i++) {
        // For each letter, create an element that looks like <span class='color-div gray'>
        letter = document.createElement('span');
        letter.classList.add('color-div', 'gray');
        // Add the letter itself to the new <span> element
        text = document.createTextNode(input.value[i]);
        letter.appendChild(text);

        // Add an event listener to the letter (to change its color)
        letter.addEventListener('click', function() {
            nextColor(this);
        });

        // Add the new <span> element to the word
        newWord.appendChild(letter);
    }

    // DOM elements that we need to know about
    const wordGrid = document.getElementById('word-grid');
    const addWord = document.getElementById('add-word');
    const allWords = document.getElementsByClassName('word');

    // Create the buttons for editing and deleting this word
    const editBtn = document.createElement('i');
    const deleteBtn = document.createElement('i');
    // Turn them into icons with Font Awesome
    editBtn.classList.add('far', 'fa-edit');
    deleteBtn.classList.add('far', 'fa-trash-alt');
    // Add titles to the icons
    editBtn.title = 'Edit word';
    deleteBtn.title = 'Delete word';

    // Add event listeners to the icons
    editBtn.addEventListener('click', function() {
        // If this button is 'unclickable', exit right now
        if (this.classList.contains('no-click')) {
            return;
        }
        editWord(Number(this.parentNode.id[4]));
    });
    deleteBtn.addEventListener('click', function() {
        // If this button is 'unclickable', exit right now
        if (this.classList.contains('no-click')) {
            return;
        }
        deleteWord(Number(this.parentNode.id[4]));
    });

    // Add the icons to the new word
    newWord.appendChild(editBtn);
    newWord.appendChild(deleteBtn);

    // See if this word is in the list of allowed guesses
    if (!inputWords.includes(input.value)) {
        // Since it is not, add a little warning
        let warning = document.createElement('div');
        warning.classList.add('word-warning');
        text = document.createTextNode('Not in word list');
        warning.appendChild(text);

        // Add the 'dismiss' button
        let dismiss = document.createElement('span');
        dismiss.classList.add('warning-dismiss');

        // Add an event listener to the 'dismiss' button
        dismiss.addEventListener('click', function() {
            this.parentNode.remove();
        });

        // Add text to the dismiss button
        text = document.createTextNode('×');
        dismiss.appendChild(text);
        warning.appendChild(dismiss);

        // Add this warning to the new word
        newWord.appendChild(warning);
    }

    // Determine where to insert the new word into the grid
    let nextSibling = (inputId === wordCount) ? addWord : allWords[inputId];
    wordGrid.insertBefore(newWord, nextSibling);

    // Remove the <input> element
    input.remove();
    // Increment the word count
    wordCount++;
    // Enable the user interface
    enableInterface();
    // Show this DOM element that contains instructions
    // to the user for changing the colors of letters
    show(document.getElementById('show-after-input'));
}

/*
  Replace the word with the given id with a text input field,
  so that the user can edit the word itself.
*/
function editWord(wordId) {
    // Disable the user interface
    disableInterface();

    // Get the word from the document
    const DOMWord = document.getElementById('word' + wordId);
    // Create the new input field
    const newInput = createInputField(wordId);
    // Set the input field's value
    newInput.value = readWord(DOMWord);
    // Remove 'DOMWord' from the document
    DOMWord.remove();
    // Get the word grid
    const wordGrid = document.getElementById('word-grid');
    // Get the id of the element that will be the input's next sibling
    let siblingId = (wordId + 1 === wordCount) ? 'add-word' : 'word' + (wordId + 1);

    // Insert the input field into the grid
    wordGrid.insertBefore(newInput, document.getElementById(siblingId));

    // Give the input field focus
    newInput.focus();

    // Decrement the number of existing words
    wordCount--;
}

/*
  Delete the word with the given id from the document,
  and update the ids of the remaining words accordingly.
*/
function deleteWord(wordId) {
    // Remove this word
    document.getElementById('word' + wordId).remove();

    // Reset the ids of all the remaining words
    const allWords = document.getElementsByClassName('word');
    for (let i = 0; i < allWords.length; i++) {
        allWords[i].id = 'word' + i;
    }

    // Decrement the number of existing words
    wordCount--;
    // Enable the user interface
    enableInterface();
}

/*
  Disable the user interface, so that the user cannot
  add new words, change existing words, etc.
*/
function disableInterface() {
    // Disable each of the icons
    for (let i of document.querySelectorAll('.word .far')) {
        // Add the 'no-click' class to the icon if it doesn't have it already.
        // This class turns the icon light gray and sets the cursor to 'not-allowed',
        // to strongly hint to the user that it won't do anything.
        if (!i.classList.contains('no-click')) {
            i.classList.add('no-click');
        }
    }

    // Hide the button that adds a new word
    hide(document.getElementById('add-word'));
    // Hide the button that solves the puzzle
    hide(document.getElementById('go'));
    // Set this global variable
    enabled = false;
}

/*
  Enable the user interface, so that the user can
  add new words, change existing words, etc.
*/
function enableInterface() {
    // Loop through all the icons
    for (let i of document.querySelectorAll('.word .far')) {
        // If this is the 'delete' button for the only existing word, it must NOT be enabled
        if (i.classList.contains('fa-trash-alt') && wordCount === 1) {
            // Add the 'no-click' class if it does not already exist
            if (!i.classList.contains('no-click')) {
                i.classList.add('no-click');
            }
        } else {
            // Remove the 'no-click' class if it exists
            if (i.classList.contains('no-click')) {
                i.classList.remove('no-click');
            }
        }
    }

    // Unless there are the maximum number of words already, show the 'add word' button
    if (wordCount < MAX_WORDS) {
        show(document.getElementById('add-word'), 'inline-block');
    }
    // Show the button that solves the puzzle
    show(document.getElementById('go'));
    // Set this global variable
    enabled = true;
}

/* Add a text input area for the user to type in a new word. */
function addWord() {
    // If the user interface is not enabled, exit right now
    if (!enabled) {
        return;
    }

    // Disable the user interface
    disableInterface();

    // Create the new input field
    const newInput = createInputField(wordCount);
    // Insert this input into the word grid, just before the 'add word' button
    const wordGrid = document.getElementById('word-grid');
    const addWord = document.getElementById('add-word');
    wordGrid.insertBefore(newInput, addWord);

    // Give the input field focus
    newInput.focus();
}

/*
  Display a message in the output section of the
  document, telling the user that only the top 75
  (of the given number) of results are being shown.
*/
function recordOverflow(overflowNo) {
    // This <span> element should contain the number itself
    document.getElementById('overflow-no').innerHTML = overflowNo;
    // Show the paragraph containing it
    show(document.getElementById('overflow'));
}

/*
  Write the words in the given array to the given DOM element, delimited by line breaks
  and with numbered indexes starting from the given start point, which defaults to 1.
*/
function writeWords(wordList, target, start = 1) {
    // Check parameters
    if (typeof wordList != 'object') {
        throw 'Expected array of words';
    }
    if (target.innerHTML === undefined) {
        throw 'Expected DOM object';
    }

    // The text we'll write to the given target
    let text = '';

    // Loop through the given array of words
    for (let i = 0; i < wordList.length; i++) {
        // Concatenate a string to 'text' that looks like, for example, '1. CYBER<br>'
        text += i + start + '. ' + wordList[i] + '<br>';
    }

    // Write the text to the given target
    target.innerHTML = text;
}

/*
  Find all the possibilities from the target word,
  and write them to the output section of the document.
*/
function getResults() {
    // Get the results themselves
    let results = getWordsFromDoc();

    // If there are no results, show the message that says so, and hide whatever results may be showing
    if (results.length === 0) {
        show(document.getElementById('no-words-found'));
        hide(document.getElementById('words-found'));
        return;
    }

    // Check the 'sortmethod' radio input
    if (document.querySelector('input[name="sortmethod"]:checked').value === 'yes') {
        // Sort the results by number of repeated letters
        results.sort((a, b) => repeatedLetters(a) - repeatedLetters(b));
    }

    // If there is an overflow, show the message that says so, and cut off any extra words
    if (results.length > 75) {
        recordOverflow(results.length);
        results = results.slice(0, 75);
    } else {
        // If there is not an overflow, hide the message that says there is
        hide(document.getElementById('overflow'));
    }

    // Show the element that contains the results themselves
    show(document.getElementById('words-found'));
    // Hide the element that says there are no results
    hide(document.getElementById('no-words-found'));

    // See if there are 0, 1, or 2 words more than a multiple of 3
    const extras = results.length % 3;
    // Determine how many words will be in each of the three arrays
    const arrayLength = (results.length - extras) / 3;
    // Determine where to split the original array to make it into three smaller, equally sized arrays
    let break1 = arrayLength,
        break2 = arrayLength * 2;

    if (extras === 2) {
        // If there are two words left over, record that the first and second
        // arrays will both have 1 element extra by moving up both breaks
        break1 += 1;
        break2 += 2;
    } else if (extras === 1) {
        // If there is one word left over, record that the first array
        // will have 1 element extra by moving up both breaks
        break1 += 1;
        break2 += 1;
    }

    // Write each of the three sections of the array of results to one of the three output areas
    writeWords(results.slice(0, break1), document.getElementById('output1'));
    writeWords(results.slice(break1, break2), document.getElementById('output2'), break1 + 1);
    writeWords(results.slice(break2), document.getElementById('output3'), break2 + 1);
}

document.addEventListener('DOMContentLoaded', function() {
    // Add the input for the first word automatically
    addWord();

    // Add an event listener to the 'Find Results' button, that finds the results
    document.querySelector('#find-results button').addEventListener('click', getResults);

    // Add an event listener to the 'Add Word' button, that adds a new word
    document.getElementById('add-word').addEventListener('click', addWord);

    // Add an event listener to the link to the user guide that makes it scroll smoothly into view
    document.getElementById('to-user-guide').addEventListener('click', function() {
        document.getElementById('user-guide').scrollIntoView({
            'behavior': 'smooth',
            'block': 'start'
        });
    });
});
