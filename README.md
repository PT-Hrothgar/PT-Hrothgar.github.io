# Wordle Master
#### Video Demo: [https://youtu.be/OV_csPOjHX8](https://youtu.be/OV_csPOjHX8)
#### Description: Wordle Master is designed to help out anyone who is playing the New York Times game Wordle and feeling stuck.
Suppose you were three guesses into a Wordle game, and it looked like this:

![Wordle guesses STARE, DOING, and LUMPY completely gray except for the R and E in STARE and the Y in LUMPY, which are yellow](mystery.png)

On your own, you might have quite a bit of trouble thinking of a Wordle guess that contains R, E, and Y (but not in those positions), and that does not contain any of the letters that are gray above.  
This is what Wordle Master is designed for. You can go to [https://PT-Hrothgar.github.io](https://PT-Hrothgar.github.io), where it is hosted with GitHub Pages, and type in these three words. Then all you have to do is click on the R, E, and Y to turn them yellow, and select "Find Results" to find the one possible solution to this puzzle.

Here is a description of each of Wordle Master's files and what they do.

##### index.html
This is, of course, the main HTML file that defines the page itself. It links to all the other pages (`styles.css`, `words.js`, `wordle.js`, and `interface.js`) to get them working, defines the document tree and all the DOM elements that `interface.js` expects to find, and contains the user guide. It also links to my Font Awesome kit so that we can use FA icons on the "edit" and "delete" buttons. There is a copyright notice at the bottom of the page with a link to `about_license.html`, which itself contains a link to `LICENSE.txt`.

I decided during development that if somebody is visiting Wordle Master with JavaScript disabled in their browser, because the page won't work at all, it should give them a warning rather than show a completely unfunctional page. Thus, in `styles.css`, the page's wrapper element (`<div id="content-js-only">`) is hidden by default, and it is only shown by JavaScript. The only internal JavaScript in `index.html` is a short little script that does just that, and there is a large `<noscript>` element that directs the user to enable JavaScript.

##### styles.css
Here is all the not-super-interesting CSS that is so essential for the page layout. This file's most notable features are the following:  
- `@property` rules used to define the gray, yellow, and green colors used on Wordle guesses, and that Wordle Master also uses as theme colors (for example, in the header). They match the colors used by Wordle itself.
- Red and pink "error" colors, also defined with `@property`. They are used in the `<noscript>` element described above, and in the "Not in word list" warnings.
- A media query to switch to a one-column layout on smaller screens (<900px), and to slightly decrease font sizes to make the page less cramped.
- Finally, it hides the page content's wrapper element (along with several other elements that will not be shown at first), so that it will only be shown when JavaScript is enabled.

##### words.js
All that this file does is define the two word lists used by the other files. They are `outputWords`, the 2,309-word array that corresponds to the list from which the Wordle target word is chosen each day, and from which all of Wordle Master's output words are taken, and `inputWords`, the 14,855-word array that is the list of valid guesses in Wordle. `inputWords` is only checked as the user inputs words, to determine whether or not to show a "Not in word list" warning. As is specified in the comments, `outputWords` is taken from [https://www.wordunscrambler.net/word-list/wordle-word-list](https://www.wordunscrambler.net/word-list/wordle-word-list), and `inputWords` is taken from [https://raw.githubusercontent.com/tabatkins/wordle-list/main/words](https://raw.githubusercontent.com/tabatkins/wordle-list/main/words).

Note that the output words are already sorted by how common their letters are. It seemed more efficient to pre-sort them so that when the results are chosen from them, they are already in sorted order, than to have to sort the results anew every single time before outputting them.

> [!NOTE]
> By the way, this is what I officially mean by sorting the words by "how common their letters are": Each letter of the alphabet is assigned a "point value" based on how commonly it appears in dictionaries, and each word is assigned a point value equal to the sum of the point values of its letters. Finally, the words are sorted by descending point value. (I did this sorting once and for all a while ago with a Python script.)

##### wordle.js
This file and `interface.js` are really the heart of Wordle Master, the most interesting and important parts. They are both written in strict mode. Broadly speaking, this file accomplishes the abstract tasks that have nothing to do with the document itself, such as generating feedback for a given Wordle guess, and actually choosing the words to output from the `outputWords` array defined in `words.js`.

The way the results are found is this: `interface.js` reads the input words and their colors from the document into two arrays of equal length. `wordle.js` checks each one of the `outputWords`, seeing if it would generate the given colors for the given input words as feedback if it was the target word. To me, this method - looking at each output word and saying, "Is this a possibility?" - seemed much simpler and more straightforward than somehow parsing the inputs to determine what a result *would* look like.
