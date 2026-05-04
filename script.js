/**
 * @fileoverview Wordle 98 — Game Logic
 *
 * Handles all game state, user input (keyboard and on-screen), word validation,
 * modal management, and post-game definition lookup for Wordle 98.
 *
 * External dependencies (loaded via <script> tags before this file):
 *   - words.js  : (reserved for a local word list if needed)
 *
 * External APIs used:
 *   - https://random-word-api.herokuapp.com  : Fetches a random word of a given length
 *   - https://api.dictionaryapi.dev          : Validates words and fetches definitions
 */

// ============================================================
// GAME STATE
// ============================================================

/** @type {number} Index of the row currently being filled (0–5). */
let currentRow = 0;

/** @type {number} Index of the next empty column in the current row. */
let currentCol = 0;

/** @type {string} The letters the player has typed so far for the current row. */
let currentGuess = "";

/** @type {number} Number of letters in the target word (controlled by the slider). */
let letterCount = 5;

/** @type {string} The target word the player is trying to guess (all caps). */
let answer = "";

/** @type {boolean} Whether the game is actively accepting input. */
let running = true;

/**
 * @type {boolean}
 * Guards against submitting multiple guesses simultaneously while an async
 * validation request is in flight.
 */
let checkingGuess = false;

// ============================================================
// DOM REFERENCES
// ============================================================

const gameBoard        = document.getElementById("game-board");
const keys             = document.querySelectorAll(".key");
const statusMessage    = document.getElementById("status-message");
const letterSlider     = document.getElementById("letter-slider");
const definitionPrompt = document.getElementById("definition-prompt");
const definitionModal  = document.getElementById("definition-modal");
const definitionWord   = document.getElementById("definition-word");
const definitionText   = document.getElementById("definition-text");

/** @type {NodeList} Live reference to all board rows; rebuilt on each new game. */
let boardRows;

// ============================================================
// INITIALIZATION
// ============================================================

startNewGame();

// ============================================================
// API HELPERS
// ============================================================

/**
 * Fetches the part of speech and primary definition for a given word from the
 * Free Dictionary API.
 *
 * @async
 * @param {string} word - The word to look up (case-insensitive).
 * @returns {Promise<{partOfSpeech: string, definition: string}>}
 *   Resolves with the part of speech and definition, or fallback strings if
 *   the word cannot be found.
 */
async function getDefinitionInfo(word) {
    const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`
    );

    if (!response.ok) {
        return {
            partOfSpeech: "unknown",
            definition: "Definition not found."
        };
    }

    const data = await response.json();
    const partOfSpeech  = data[0].meanings[0].partOfSpeech;
    const definition    = data[0].meanings[0].definitions[0].definition;

    return { partOfSpeech, definition };
}

/**
 * Returns the correct indefinite article ("a" or "an") for a given word,
 * based on whether it starts with a vowel sound.
 *
 * @param {string} word - The word to evaluate.
 * @returns {"a"|"an"}
 */
function getArticle(word) {
    return "aeiou".includes(word[0].toLowerCase()) ? "an" : "a";
}

/**
 * Fetches a random, dictionary-valid word of the specified length.
 * Retries up to 50 times in case the random API returns a word that is not in
 * the dictionary or is the wrong length.
 *
 * @async
 * @param {number} length - The desired word length.
 * @returns {Promise<string>} Resolves with an all-caps valid word.
 * @throws {Error} If no valid word is found after 50 attempts.
 */
async function getRandomWord(length) {
    for (let i = 0; i < 50; i++) {
        const response = await fetch(
            `https://random-word-api.herokuapp.com/word?length=${length}`
        );
        const data = await response.json();
        const word = data[0].toUpperCase();

        if (word.length === length && await isValidWord(word)) {
            return word;
        }
    }

    throw new Error("Could not find a valid answer word.");
}

/**
 * Checks whether a word exists in the dictionary by querying the Free
 * Dictionary API.
 *
 * @async
 * @param {string} word - The word to validate (case-insensitive).
 * @returns {Promise<boolean>} Resolves with `true` if the word is valid.
 */
async function isValidWord(word) {
    const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`
    );
    return response.ok;
}

// ============================================================
// GAME SETUP
// ============================================================

/**
 * Resets all game state and starts a new round. Rebuilds the board, clears
 * keyboard colours, then fetches a new target word.
 *
 * @async
 * @returns {Promise<void>}
 */
async function startNewGame() {
    currentRow   = 0;
    currentCol   = 0;
    currentGuess = "";
    running      = true;

    definitionPrompt.textContent = "";
    definitionWord.textContent   = "";
    definitionText.textContent   = "";

    statusMessage.textContent = `Picking a ${letterSlider.value}-letter word for you to guess...`;

    buildBoard();

    keys.forEach(key => {
        key.classList.remove("correct", "present", "absent", "active");
    });

    letterSlider.disabled = false;

    try {
        answer = await getRandomWord(letterCount);
        statusMessage.textContent = "";
    } catch (error) {
        statusMessage.textContent = "Could not pick a word. Try refreshing the page.";
    }
}

/**
 * Builds (or rebuilds) the 6×N grid of letter slots and updates the
 * `boardRows` reference used throughout the game.
 *
 * @returns {void}
 */
function buildBoard() {
    gameBoard.innerHTML = "";

    for (let i = 0; i < 6; i++) {
        const row = document.createElement("div");
        row.classList.add("row");

        for (let j = 0; j < letterCount; j++) {
            const slot = document.createElement("div");
            slot.classList.add("slot");
            row.appendChild(slot);
        }

        gameBoard.appendChild(row);
    }

    boardRows = document.querySelectorAll("#game-board .row");
}

// ============================================================
// STATUS MESSAGES
// ============================================================

/** @type {number|undefined} Timeout ID used to auto-clear the status message. */
let statusTimeout;

/**
 * Displays a temporary status message to the player and clears it after a
 * specified duration.
 *
 * @param {string} message  - The text to display.
 * @param {number} [duration=2000] - How long (ms) to show the message.
 * @returns {void}
 */
function showStatus(message, duration = 2000) {
    clearTimeout(statusTimeout);
    statusMessage.textContent = message;

    statusTimeout = setTimeout(() => {
        statusMessage.textContent = "";
    }, duration);
}

// ============================================================
// POST-GAME: DEFINITION PROMPT
// ============================================================

/**
 * Renders a clickable prompt below the board that lets the player look up
 * the definition of the answer word. Clicking the link opens the definition
 * modal and fetches the definition asynchronously.
 *
 * @returns {void}
 */
function showDefinitionPrompt() {
    definitionPrompt.innerHTML =
        `What does <span id="answer-link">${answer}</span> mean?`;

    const answerLink = document.getElementById("answer-link");

    answerLink.addEventListener("click", async () => {
        definitionModal.classList.remove("hidden");
        titleBar.classList.add("inactive");

        // Show placeholder text while the API request is in flight.
        definitionWord.textContent = answer;
        definitionText.textContent = `${answer} means...`;

        const info = await getDefinitionInfo(answer);

        if (info.partOfSpeech === "unknown") {
            definitionWord.textContent = `${answer} (Most common use not found.)`;
        } else {
            const article = getArticle(info.partOfSpeech);
            definitionWord.textContent =
                `${answer} (Most commonly used as ${article} ${info.partOfSpeech}.)`;
        }

        definitionText.textContent = info.definition;
    });
}

// ============================================================
// LETTER SLIDER
// ============================================================

/**
 * Listens for changes to the word-length slider. Only restarts the game if no
 * letters have been typed yet (i.e. the board is completely empty), so that
 * in-progress games are not accidentally reset.
 */
letterSlider.addEventListener("input", async () => {
    if (currentRow > 0 || currentCol > 0) return;

    letterCount = Number(letterSlider.value);
    await startNewGame();
});

// ============================================================
// MODAL MANAGEMENT
// ============================================================

const titleBar = document.getElementById("title-bar");

setupModal("help-btn",  "help-modal");
setupModal("close-btn", "close-modal");
setupModal(null,        "definition-modal");

/**
 * Wires up open/close behaviour and drag-to-move functionality for a modal
 * window. Clicking outside the modal content panel triggers a flash animation
 * (mimicking the Win98 "window not focused" shake).
 *
 * @param {string|null} openButtonId - ID of the button that opens the modal,
 *   or `null` if the modal has no dedicated open button (e.g. opened
 *   programmatically).
 * @param {string} modalId - ID of the modal backdrop element.
 * @returns {void}
 */
function setupModal(openButtonId, modalId) {
    const openBtn        = openButtonId ? document.getElementById(openButtonId) : null;
    const modal          = document.getElementById(modalId);
    const modalContent   = modal.querySelector(".modal-content");
    const modalTitleBar  = modal.querySelector(".modal-title-bar");
    const closeBtn       = modal.querySelector(".modal-close-btn");

    // Open
    if (openBtn) {
        openBtn.addEventListener("click", () => {
            modal.classList.remove("hidden");
            titleBar.classList.add("inactive");
        });
    }

    // Close
    closeBtn.addEventListener("click", () => {
        modal.classList.add("hidden");

        if (allModalsClosed()) {
            titleBar.classList.remove("inactive");
        }
    });

    // Flash when clicking the backdrop (outside the content panel)
    modal.addEventListener("click", () => flashModal(modal));
    modalContent.addEventListener("click", event => event.stopPropagation());

    // Drag-to-move
    let isDragging = false;
    let offsetX    = 0;
    let offsetY    = 0;

    modalTitleBar.addEventListener("mousedown", event => {
        isDragging = true;
        offsetX = event.clientX - modalContent.offsetLeft;
        offsetY = event.clientY - modalContent.offsetTop;
    });

    document.addEventListener("mousemove", event => {
        if (!isDragging) return;
        modalContent.style.left = `${event.clientX - offsetX}px`;
        modalContent.style.top  = `${event.clientY - offsetY}px`;
    });

    document.addEventListener("mouseup", () => {
        isDragging = false;
    });
}

/**
 * Returns `true` when every modal is hidden.
 *
 * @returns {boolean}
 */
function allModalsClosed() {
    return document.querySelectorAll(".modal:not(.hidden)").length === 0;
}

/**
 * Returns the first currently-visible modal element, or `null` if none.
 *
 * @returns {Element|null}
 */
function getOpenModal() {
    return document.querySelector(".modal:not(.hidden)");
}

/**
 * Briefly flashes a modal's outline to signal that it requires attention
 * (Win98-style focus indication). Prevents concurrent flash animations on the
 * same element via a `data-flashing` guard.
 *
 * @param {Element} modal - The modal backdrop element to flash.
 * @returns {void}
 */
function flashModal(modal) {
    if (modal.dataset.flashing === "true") return;

    modal.dataset.flashing = "true";
    let flashes = 0;

    const flashInterval = setInterval(() => {
        modal.classList.toggle("flash");
        flashes++;

        if (flashes >= 6) {
            clearInterval(flashInterval);
            modal.classList.remove("flash");
            modal.dataset.flashing = "false";
        }
    }, 100);
}

// ============================================================
// INPUT HANDLING — ON-SCREEN KEYBOARD
// ============================================================

keys.forEach(key => {
    key.addEventListener("click", () => {
        const value = key.textContent;

        if (value === "Enter") {
            submitGuess();
        } else if (value === "Delete") {
            deleteLetter();
        } else {
            addLetter(value);
        }
    });
});

// ============================================================
// INPUT HANDLING — PHYSICAL KEYBOARD
// ============================================================

/**
 * Handles keydown events. If a modal is open, flashes it instead of
 * processing the keypress. Otherwise routes Enter, Backspace/Delete, and
 * letter keys to the appropriate game functions and adds the `.active` class
 * to the corresponding on-screen key for visual feedback.
 */
document.addEventListener("keydown", event => {
    const openModal = getOpenModal();

    if (openModal) {
        flashModal(openModal);
        return;
    }

    const key = event.key;
    let button;

    if (key === "Enter") {
        button = document.getElementById("enter-key");
        button.classList.add("active");
        submitGuess();
    } else if (key === "Backspace" || key === "Delete") {
        button = document.getElementById("delete-key");
        button.classList.add("active");
        deleteLetter();
    } else if (/^[a-zA-Z]$/.test(key)) {
        button = document.getElementById(key.toUpperCase());
        button.classList.add("active");
        addLetter(key.toUpperCase());
    }
});

/**
 * Removes the `.active` class from on-screen keys when the corresponding
 * physical key is released. If a modal is open, flashes it instead.
 */
document.addEventListener("keyup", event => {
    const openModal = getOpenModal();

    if (openModal) {
        flashModal(openModal);
        return;
    }

    const key = event.key;
    let button;

    if (key === "Enter") {
        button = document.getElementById("enter-key");
    } else if (key === "Backspace" || key === "Delete") {
        button = document.getElementById("delete-key");
    } else if (/^[a-zA-Z]$/.test(key)) {
        button = document.getElementById(key.toUpperCase());
    }

    if (button) {
        button.classList.remove("active");
    }
});

// ============================================================
// GAME ACTIONS
// ============================================================

/**
 * Adds a single letter to the current guess if the row is not yet full and
 * the game is still running.
 *
 * @param {string} letter - The uppercase letter to add.
 * @returns {void}
 */
function addLetter(letter) {
    if (currentCol < letterCount && running) {
        boardRows[currentRow].children[currentCol].textContent = letter;
        currentGuess += letter;
        currentCol++;
    }
}

/**
 * Removes the last letter from the current guess, clearing both the state
 * variable and the corresponding board slot.
 *
 * @returns {void}
 */
function deleteLetter() {
    if (currentCol > 0 && running) {
        currentCol--;
        boardRows[currentRow].children[currentCol].textContent = "";
        currentGuess = currentGuess.slice(0, -1);
    }
}

/**
 * Submits the current guess for evaluation.
 *
 * Validation steps (in order):
 *   1. Bail out if another validation request is already in progress.
 *   2. If the game is over, pressing Enter starts a new game instead.
 *   3. Ensure the guess is the correct length.
 *   4. Check the guess against the dictionary API.
 *
 * Scoring uses a two-pass algorithm to handle duplicate letters correctly:
 *   - Pass 1: Mark exact matches (correct position) and null them out in a
 *     working copy of the answer so they cannot be matched again.
 *   - Pass 2: Mark letters that exist somewhere in the remaining answer
 *     (present) or are not in the answer at all (absent).
 *
 * After scoring, checks for a win (guess === answer) or for the final row
 * having been reached (loss).
 *
 * @async
 * @returns {Promise<void>}
 */
async function submitGuess() {
    if (checkingGuess) return;

    statusMessage.textContent = "";

    // Re-use Enter to restart once the game has ended.
    if (!running) {
        await startNewGame();
        return;
    }

    if (currentGuess.length !== letterCount) {
        showStatus("Not enough letters.");
        return;
    }

    checkingGuess = true;

    const guess = currentGuess;
    const valid = await isValidWord(guess);

    if (!valid) {
        checkingGuess = false;
        showStatus("Word not valid.");
        return;
    }

    letterSlider.disabled = true;

    // Working copy so matched letters can be nulled out during pass 2.
    let answerLetters = answer.split("");

    // --- Pass 1: correct (right letter, right position) ---
    for (let i = 0; i < guess.length; i++) {
        const slot = boardRows[currentRow].children[i];
        const key  = document.querySelector(`#${guess[i]}`);

        if (guess[i] === answer[i]) {
            slot.classList.add("correct");

            key.classList.remove("present", "absent");
            key.classList.add("correct");

            answerLetters[i] = null; // Consume this letter.
        }
    }

    // --- Pass 2: present (right letter, wrong position) or absent ---
    for (let i = 0; i < guess.length; i++) {
        const slot = boardRows[currentRow].children[i];
        const key  = document.querySelector(`#${guess[i]}`);

        if (guess[i] === answer[i]) continue; // Already handled in pass 1.

        if (answerLetters.includes(guess[i])) {
            slot.classList.add("present");

            if (!key.classList.contains("correct")) {
                key.classList.remove("absent");
                key.classList.add("present");
            }

            // Consume this letter so duplicate guesses are handled correctly.
            answerLetters[answerLetters.indexOf(guess[i])] = null;
        } else {
            slot.classList.add("absent");

            if (!key.classList.contains("correct") && !key.classList.contains("present")) {
                key.classList.add("absent");
            }
        }
    }

    // --- Win / loss check ---
    if (guess === answer) {
        statusMessage.textContent =
            `You win! The word was ${answer}. Enter to play again.`;
        showDefinitionPrompt();
        running       = false;
        checkingGuess = false;
        return;
    }

    currentRow++;

    if (currentRow === 6) {
        statusMessage.textContent =
            `You lose! The word was ${answer}. Enter to play again.`;
        showDefinitionPrompt();
        running       = false;
        checkingGuess = false;
        return;
    }

    currentCol   = 0;
    currentGuess = "";
    checkingGuess = false;
}