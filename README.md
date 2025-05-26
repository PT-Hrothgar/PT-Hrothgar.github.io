# Wordle Master
#### Video Demo: [https://youtu.be/OV_csPOjHX8](https://youtu.be/OV_csPOjHX8)
#### Description: Wordle Master is designed to help out anyone who is playing the New York Times game Wordle and feeling stuck.
Suppose you were three guesses into a Wordle game, and it looked like this:

![Wordle guesses STARE, DOING, and LUMPY completely gray except for the R and E in STARE and the Y in LUMPY, which are yellow](mystery.png)

On your own, you might have quite a bit of trouble thinking of a Wordle guess that contains R, E, and Y (but not in those positions), and that does not contain any of the letters that are gray above.  
This is what Wordle Master is designed for. You can go to [https://PT-Hrothgar.github.io](https://PT-Hrothgar.github.io), where it is hosted with GitHub Pages, and type in these three words. Then all you have to do is click on the R, E, and Y to turn them yellow, and select "Find Results" to find the one possible solution to this puzzle.

Wordle Master is a front-end web application that runs entirely with client-side JavaScript. Here are its files.

##### index.html
This is, of course, the main HTML file that defines the page itself. It links to all the other files (`styles.css`, `words.js`, `wordle.js`, and `interface.js`) to get them working, defines the document tree and all the DOM elements that `interface.js` expects to find, and contains the user guide. It also links to my Font Awesome kit so that we can use FA icons on the "edit" and "delete" buttons. There is a copyright notice at the bottom of the page with a link to `about_license.html`, which itself contains a link to `LICENSE.txt`.

I decided during development that if somebody is visiting Wordle Master with JavaScript disabled in their browser, because the page won't work at all, it should give them a warning rather than show a completely unfunctional page. Thus, in `styles.css`, the page's wrapper element (`<div id="content-js-only">`) is hidden by default, and it is only shown by JavaScript. The only internal JavaScript in `index.html` is a short little script that does just that, and there is a large `<noscript>` element that directs the user to enable JavaScript.

##### styles.css
Here is all the not-super-interesting CSS that is so essential for the page layout. This file's most notable features are the following:  
- Links to the Google fonts Encode Sans Expanded, used for most of the page, and Noto Sans Mono, used for the headers and the inputted guesses.
- `@property` rules used to define the gray, yellow, and green colors used on Wordle guesses, and that Wordle Master also uses as theme colors (for example, in the header). They match the colors used by Wordle itself.
- Red and pink "error" colors, also defined with `@property`. They are used in the `<noscript>` element described above, and in the "Not in word list" warnings.
- A media query to switch to a one-column layout on smaller screens (<900px), and to slightly decrease font sizes to make the page less cramped.
- Finally, it hides the page content's wrapper element (along with several other elements that will not be shown at first), so that it will only be shown when JavaScript is enabled.

##### words.js
All that this file does is define the two word lists used by the other files. They are `outputWords`, the 2,309-word array that corresponds to the list from which the Wordle target word is chosen each day, and from which Wordle Master's output words are taken by default, and `inputWords`, the 14,855-word array that is the list of valid guesses in Wordle. `inputWords` is checked as the user inputs words, to determine whether or not to show a "Not in word list" warning. As is specified in the comments, `outputWords` is taken from [https://www.wordunscrambler.net/word-list/wordle-word-list](https://www.wordunscrambler.net/word-list/wordle-word-list), and `inputWords` is taken from [https://raw.githubusercontent.com/tabatkins/wordle-list/main/words](https://raw.githubusercontent.com/tabatkins/wordle-list/main/words).

> [!WARNING]
> Wordle itself does not seem to have an official published word list, so the one we use **is not perfect**. It is, I think, very similar to the list actually used by Wordle, but sometimes (as on April 21, 2025, when the word was SPATE), there is a Wordle target word that is not on it.

Note that both word lists are already sorted by how common their letters are. It seemed more efficient to pre-sort them so that when the results are chosen from them, they are already in sorted order, than to have to sort the results anew every single time before outputting them.

> [!NOTE]
> By the way, this is what I officially mean by sorting the words by "how common their letters are": Each letter of the alphabet is assigned a "point value" based on how commonly it appears in dictionaries, and each word is assigned a point value equal to the sum of the point values of its letters. Finally, the words are sorted by descending point value. (I did this sorting once and for all a while ago with a Python script.)

##### wordle.js
This file and `interface.js` are really the heart of Wordle Master, the most interesting and important parts. They are both written in strict mode. Broadly speaking, this file accomplishes the abstract tasks that have nothing to do with the document itself, such as generating feedback for a given Wordle guess, and actually choosing the words to output from the `outputWords` array defined in `words.js`.

The way the results are found is this: `interface.js` reads the input words and their colors from the document into two arrays of equal length. `wordle.js` checks each one of the `outputWords`, seeing if it would generate the given colors for the given input words as feedback if it was the target word. To me, this method - looking at each output word and saying, "Is this a possibility?" - seemed much simpler and more straightforward than somehow parsing the inputs to determine what a result *would* look like.

This file also contains a function, `repeatedLetters()`, that returns the number of repeated letters in a given word. `interface.js` uses this function to sort the results by number of repeated letters, if the user so chooses.

##### interface.js
Here we have all the functions relating to the document, and particularly to the user interface. Among other things, these functions can create input fields labeled "Guess #1", etc., where the user can enter his/her guesses. As the user inputs text, they process it: they convert the text to uppercase and remove non-alphabetic characters. When the user inputs the fifth letter of a word, they remove the input field and create a Wordle guess out of the inputted word. The guess has all letters gray initially, and there are "edit" and "delete" buttons, with tooltips explaining their purpose, to the right of it. Event listeners are added to each of the five letters so that when they are clicked, they change from gray to yellow, yellow to green, or green to gray.

> [!IMPORTANT]
> Sometimes a letter, when clicked, will change from gray directly to green, or from green directly to yellow. This is because, as is explained in the user guide, there are situations in which a letter cannot be yellow, or gray. Note that in Wordle, it is impossible for a guess that has two identical letters (for example, E's) to have the first E colored gray and the second E colored yellow. Thus, Wordle Master prevents you from coloring a guess this way - it is a safety mechanism against inconsistent inputs.

This file also keeps track of the when the user interface is "enabled", so that when there is an active input field (for entering a new word or editing an existing one), the user cannot select "Find Results", or start editing another word, or entering a new one, etc. At these times, when the user interface is "disabled", the "edit" and "delete" buttons are disabled and the "Find Results" button is hidden.

As this file shows and hides DOM elements with CSS fairly frequently, there are functions `show()` and `hide()` to streamline this process.

Finally, this file contains functions for reading the guesses themselves and their colors from the document, and displaying the results to the user. The colors of the five letters of each word are read into a five-character string, so if the first and fourth letters of a word were green, its third letter was yellow, and its second and fifth letters were gray, that word's "color string" would be `'gbygb'`, for 'green, black, yellow, green, black': this is always the format in which Wordle Master's functions represent colors.  
The function `getWordsFromDoc()` reads the inputted words and their colors from the document into two arrays of equal length, and passes them to the function `getWords()` defined in `wordle.js` to get the actual results.  
Highest in the hierarchy is `getResults()`, which is the function actually called when the user selects "Find Results". This function:
- Reads the `which-results` radio input to determine which word list to use for the results.
- Calls `getWordsFromDoc()` with that word list to get the results themselves.
- Reads the "sortmethod" radio input to determine the user's desired sorting method, and, if necessary, sorts the results by number of repeated letters.
> [!NOTE]
> Note that even if the results are sorted by number of repeated letters, within a section of the sorted array whose words all have the same number of repeated letters, the original sorted order will be preserved.
- Splits the results into three arrays of equal length and writes one array to each column of the `<div>` element reserved for the purpose.
- Handles the showing of appropriate messages about the results, e.g. "No results found" or "Showing only the top 75 of [for example] 373 results".

##### about_license.html
This short HTML file simply contains the sentence "The code for this website is licensed under the Apache License 2.0", with a hyperlink to LICENSE.txt.

##### Image files: favicon.ico, mystery.png, sleep.png, wordlemaster.png, wordlemaster_mobile.png
`favicon.ico` is the M on the green background that is the logo of Wordle Master.

`mystery.png` contains the Wordle guesses STARE, DOING, and LUMPY as shown at the top of this README. It is used at the top of the user guide in the same way it is used here: to demonstrate a case where you would have a lot of trouble without Wordle Master.

`sleep.png` contains the Wordle guess SLEEP colored impossibly: with the first E gray and the second E yellow. It is used in the user guide where it is explaining why such a coloring of a Wordle guess is impossible.

`wordlemaster.png` is a screenshot of Wordle Master in action. It is used as the OGP image of the site, and is shown at the bottom of the user guide to show the solution to the STARE-DOING-LUMPY puzzle.

`wordlemaster_mobile.png` is the same as the above image, except that the screenshot is of the one-column layout of Wordle Master used on mobile devices. It is used instead of `wordlemaster.png` on mobile devices, since it is less wide.

**Happy Wordling, everybody!**
