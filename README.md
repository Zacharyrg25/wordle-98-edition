# Wordle 98

A Windows 98-styled remake of the classic [Wordle](https://www.nytimes.com/games/wordle/index.html) word-guessing game — complete with draggable modal windows, bevelled borders, a gradient title bar, and a few extra twists.

---

<!-- Replace the placeholder below with an actual screenshot once available -->
> **📸 Screenshot placeholder** — add a screenshot of the game here.  
> ![Wordle 98 gameplay screenshot](./assets/gameplay1.png)
> ![Wordle 98 gameplay screenshot](./assets/gameplay2.png)

---

## Features

- **Classic Wordle gameplay** — 6 attempts to guess the target word
- **Variable word length** — choose between 4 and 8 letters using the slider (before your first guess)
- **Real-time word validation** — only real English words are accepted as guesses
- **Colour-coded feedback** — green (correct position), yellow (wrong position), grey (not in word)
- **Keyboard tracking** — the on-screen keyboard updates to reflect your guesses; physical keyboard is fully supported
- **Word definitions** — after each game, click the target word to see its definition and part of speech
- **Draggable Windows 98 modals** — drag them around the screen just like the real thing
- **Authentic Win98 aesthetic** — custom bitmap fonts, inset box-shadows, gradient title bars, and a slider that fights back

---

## How to Play

1. Open `index.html` in your browser.
2. *(Optional)* Adjust the **Letters** slider to pick a word length between 4 and 8.
3. Type a word using your keyboard or the on-screen keys and press **Enter** to submit.
4. Use the colour hints to narrow down the answer:
   - 🟩 **Green** — correct letter, correct position
   - 🟨 **Yellow** — correct letter, wrong position
   - ⬜ **Grey** — letter is not in the word
5. Guess the word within 6 tries to win!
6. After the game ends, press **Enter** (or click the on-screen Enter key) to start a new game.

---

## Getting Started

No build step or package manager needed — this is a plain HTML/CSS/JS project.

```bash
git clone https://github.com/your-username/wordle-98.git
cd wordle-98
# Open index.html in your browser, or serve it locally:
npx serve .
```

> **Note:** The game fetches random words and validates guesses against live APIs (see [APIs](#apis)), so an internet connection is required during play.

---

## Project Structure

```
wordle-98/
├── index.html        # Main HTML — game board, keyboard, modals
├── style.css         # All styles — Win98 aesthetic, layout, colour states
├── script.js         # Game logic — state management, input handling, API calls
├── words.js          # Word list (loaded before script.js)
└── fonts/
    ├── windows98regular.ttf
    └── windows98bold.ttf
```

---

## APIs

| API | Purpose |
|-----|---------|
| [random-word-api.herokuapp.com](https://random-word-api.herokuapp.com) | Fetches a random English word of the chosen length |
| [api.dictionaryapi.dev](https://api.dictionaryapi.dev) | Validates guesses and retrieves definitions / parts of speech |

Both APIs are free and require no authentication.

---

## Screenshots

<!-- Add screenshots in a `screenshots/` folder and update the paths below -->

| Game in progress | Win screen | Definition modal |
|:---:|:---:|:---:|
| *(screenshot placeholder)* | *(screenshot placeholder)* | *(screenshot placeholder)* |

---

## Known Limitations

- The word-length slider is locked after the first guess of a round — change it before you start typing.
- Dictionary coverage depends on the third-party APIs; very obscure words may occasionally fail validation.
- Drag-to-move on modals uses mouse events only — touch/mobile drag is not yet supported.
- The **X** button in the title bar is intentionally non-functional (it's a joke — see the modal it opens).

---

## Acknowledgements

- Inspired by the original [Wordle](https://www.nytimes.com/games/wordle/index.html) by Josh Wardle.
- Windows 98 bitmap fonts sourced from *(add font credit/link here)*.
- Word data provided by [Free Dictionary API](https://dictionaryapi.dev/) and [Random Word API](https://random-word-api.herokuapp.com).

---

## License

*(Add your chosen license here, e.g. MIT)*