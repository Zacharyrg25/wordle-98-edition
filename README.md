# Wordle 98

A faithful reimagining of the classic [New York Times Wordle](https://www.nytimes.com/games/wordle/index.html) wrapped in a pixel-perfect **Windows 98 aesthetic** — complete with draggable modal windows, inset/raised box-shadow buttons, and a retro title bar.

> **Live demo:** _(add link here)_

---

## Screenshot

> ![Wordle 98 gameplay screenshot](./assets/gameplay1.png)
> ![Wordle 98 gameplay screenshot](./assets/gameplay2.png)

---

## Features

- **Dynamic word length** — a range slider lets you switch between 4 and 8 letter words before a round begins
- **Live word validation** — every guess is checked against a real dictionary API; only real words are accepted
- **Colour-coded feedback** — correct position (green), wrong position (yellow), and absent (grey) hints after each guess, reflected on both the board and the on-screen keyboard
- **Post-game definitions** — after each round, players can click the answer to look up its dictionary definition and part of speech
- **Draggable Win98 modals** — help and joke dialogs can be repositioned by dragging their title bars, exactly like classic Windows windows
- **Dual input support** — physical keyboard and on-screen keyboard both supported, with matching active-key visual feedback
- **Responsive board** — board grid rebuilds automatically when word length changes

---

## Tech Stack

| Layer      | Technology |
|------------|------------|
| Markup     | HTML5      |
| Styling    | CSS3 (custom properties, `inset` box-shadow for Win98 chrome) |
| Logic      | Vanilla JavaScript (ES2017+, `async/await`) |
| Fonts      | Custom Windows 98 bitmap-style TrueType fonts |

**No frameworks. No build tools. No dependencies.**

---

## APIs

| API | Purpose |
|-----|---------|
| [Random Word API](https://random-word-api.herokuapp.com) | Fetches a random word of a specified length to use as the round's answer |
| [Free Dictionary API](https://api.dictionaryapi.dev) | Validates player guesses and retrieves part-of-speech + definition for the post-game reveal |

Both APIs are free and require no API key.

---

## How to Play

1. Open `index.html` in any modern browser — no server required
2. Type a word using your keyboard or the on-screen buttons and press **Enter** to submit
3. Use the colour hints to narrow down the answer in 6 tries
4. After the round, click the answer word to see its definition
5. Press **Enter** (or click **Enter** on-screen) to start a new game

---

## Project Structure

```
wordle-98/
├── index.html        # App shell and DOM structure
├── style.css         # All styling — Win98 chrome, game board, keyboard
├── script.js         # Game logic, API calls, modal management
├── words.js          # (reserved for a local word list)
└── fonts/
    ├── windows98regular.ttf
    └── windows98bold.ttf
```

---

## Local Setup

No build step is needed. Clone or download the repository and open `index.html` directly in a browser:

```bash
git clone https://github.com/<your-username>/wordle-98.git
cd wordle-98
open index.html        # macOS
# or
start index.html       # Windows
```

> Because the app fetches from external APIs, a network connection is required for word selection and validation.

---

## Implementation Highlights

### Two-pass duplicate-letter scoring
Standard Wordle scoring handles duplicate letters with a two-pass algorithm: the first pass locks in exact matches and removes those letters from a working copy of the answer; the second pass scores remaining letters as present or absent. This ensures that a duplicated guessed letter is never counted more than the number of times it appears in the answer.

### Async guess validation with concurrency guard
Guess submission is gated by a `checkingGuess` boolean that prevents multiple simultaneous API requests if a player presses Enter repeatedly before the first response returns.

### CSS custom properties for full theme control
All colours, shadows, spacing, and sizes are defined as CSS variables in `:root`, making visual adjustments — or a full theme swap — a single-file change.

---

## Future Improvements

- Hard mode (revealed hints must be used in subsequent guesses)
- Win/loss streak statistics with `localStorage` persistence
- Share result emoji grid (à la NYT Wordle)
- Mobile touch drag support for modal windows
- Offline word list to reduce API dependency

---

## License

This project is for portfolio and educational purposes. The Windows 98 aesthetic is a tribute to Microsoft's classic UI design.