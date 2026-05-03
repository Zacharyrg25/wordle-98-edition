let currentRow = 0;
let currentCol = 0;
let currentGuess = "";
let letterCount = 5;
let answer = "";
let running = true;

const slots = document.getElementById("slots");
const keys = document.querySelectorAll(".key");
const status = document.getElementById("status");
const letterSlider = document.getElementById("Letters");

const definitionQuestion = document.getElementById("definition-question");
const modal3 = document.getElementById("modal3");
const targetWord = document.getElementById("target-word");
const definition = document.getElementById("definition");

let rows;

startNewGame();

// NEW

async function getDefinition(word) {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);

    if (!response.ok) {
        return "Definition not found.";
    }

    const data = await response.json();

    return data[0].meanings[0].definitions[0].definition;
}

function showDefinitionQuestion() {
    definitionQuestion.innerHTML = `What does <span id="answer-link">${answer}</span> mean?`;

    const answerLink = document.getElementById("answer-link");

    answerLink.addEventListener("click", async () => {
        modal3.classList.remove("hidden");
        mainBar.classList.add("inactive");

        targetWord.textContent = answer;
        definition.textContent = `${answer} means...`;

        const wordDefinition = await getDefinition(answer);
        definition.textContent = wordDefinition;
    });
}

let statusTimeout;

function showStatus(message, duration = 2000) {
    clearTimeout(statusTimeout);

    status.textContent = message;

    statusTimeout = setTimeout(() => {
        status.textContent = "";
    }, duration);
}

async function getRandomWord(length) {
    while (true) {
        const response = await fetch(`https://random-word-api.herokuapp.com/word?length=${length}`);
        const data = await response.json();

        const word = data[0].toUpperCase();

        if (word.length === length) {
            return word;
        }
    }
}

async function isValidWord(word) {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
    return response.ok;
}

async function startNewGame() {
    currentRow = 0;
    currentCol = 0;
    currentGuess = "";
    running = true;

    definitionQuestion.textContent = "";
    targetWord.textContent = "";
    definition.textContent = "";

    status.textContent = `Picking a ${letterSlider.value}-letter word for you to guess...`;

    buildBoard();

    keys.forEach(key => {
        key.classList.remove("correct", "present", "absent", "active");
    });

    letterSlider.disabled = false;

    try {
        answer = await getRandomWord(letterCount);
        status.textContent = "";
    } catch (error) {
        status.textContent = "Could not pick a word. Try refreshing the page.";
    }
}

function buildBoard() {
    slots.innerHTML = "";

    for (let i = 0; i < 6; i++) {
        const row = document.createElement("div");
        row.classList.add("row");

        for (let j = 0; j < letterCount; j++) {
            const slot = document.createElement("div");
            slot.classList.add("slot");
            row.appendChild(slot);
        }

        slots.appendChild(row);
    }

    rows = document.querySelectorAll("#slots .row");
}

// -

letterSlider.addEventListener("input", async () => {
    if (currentRow > 0 || currentCol > 0) return;

    letterCount = Number(letterSlider.value);
    await startNewGame();
});

//

// MODAL CODE ---

const mainBar = document.getElementById("bar");

setupModal("tr1", "modal1");
setupModal("tr2", "modal2");
setupModal(null, "modal3");

function setupModal(openButtonId, modalId) {
    const openBtn = openButtonId ? document.getElementById(openButtonId) : null;
    const modal = document.getElementById(modalId);
    const modalWindow = modal.querySelector(".modal-content");
    const modalTitleBar = modal.querySelector(".modal-title-bar");
    const closeBtn = modal.querySelector(".close-btn");

    if (openBtn) {
        openBtn.addEventListener("click", () => {
            modal.classList.remove("hidden");
            mainBar.classList.add("inactive");
        });
    }

    closeBtn.addEventListener("click", () => {
        modal.classList.add("hidden");

        if (allModalsClosed()) {
            mainBar.classList.remove("inactive");
        }
    });

    modal.addEventListener("click", () => {
        flashModal(modal);
    });

    modalWindow.addEventListener("click", event => {
        event.stopPropagation();
    });

    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    modalTitleBar.addEventListener("mousedown", event => {
        isDragging = true;

        offsetX = event.clientX - modalWindow.offsetLeft;
        offsetY = event.clientY - modalWindow.offsetTop;
    });

    document.addEventListener("mousemove", event => {
        if (!isDragging) return;

        modalWindow.style.left = `${event.clientX - offsetX}px`;
        modalWindow.style.top = `${event.clientY - offsetY}px`;
    });

    document.addEventListener("mouseup", () => {
        isDragging = false;
    });
}

function allModalsClosed() {
    return document.querySelectorAll(".modal:not(.hidden)").length === 0;
}

function getOpenModal() {
    return document.querySelector(".modal:not(.hidden)");
}

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

// ---

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

function addLetter(letter) {
    if (currentCol < letterCount && running) {
        rows[currentRow].children[currentCol].textContent = letter;
        currentGuess += letter;
        currentCol++;
    }
}

function deleteLetter() {
    if (currentCol > 0 && running) {
        currentCol--;
        rows[currentRow].children[currentCol].textContent = "";
        currentGuess = currentGuess.slice(0, -1);
    }
}

async function submitGuess() {
    status.textContent = "";
    if (!running) {
        await startNewGame();
        return;
    } else if (currentGuess.length === letterCount) {
        let answerLetters = answer.split("");

        const valid = await isValidWord(currentGuess);

        if (!valid) {
            showStatus("Word not valid.");
            return;
        }

        status.textContent = "";
        letterSlider.disabled = true;

        for (let i = 0; i < currentGuess.length; i++) {
            let element = document.querySelector(`#${currentGuess[i]}`);

            if (currentGuess[i] === answer[i]) {
                rows[currentRow].children[i].classList.add("correct");
                element.classList.remove("present", "absent");
                element.classList.add("correct");
                answerLetters[i] = null;
            }
        }

        for (let i = 0; i < currentGuess.length; i++) {
            let element = document.querySelector(`#${currentGuess[i]}`);

            if (currentGuess[i] === answer[i]) {
                continue;
            }

            if (answerLetters.includes(currentGuess[i])) {
                rows[currentRow].children[i].classList.add("present");
                
                if (!element.classList.contains("correct")) {
                    element.classList.remove("absent");
                    element.classList.add("present");
                }

                let index = answerLetters.indexOf(currentGuess[i]);
                answerLetters[index] = null;
            } else {
                rows[currentRow].children[i].classList.add("absent");
                
                if (!element.classList.contains("correct") && !element.classList.contains("present")) {
                    element.classList.add("absent");
                }
            }
        }

        if (currentGuess === answer) {
            status.textContent = `You win! The word was ${answer}. Enter to play again.`;
            showDefinitionQuestion();
            running = false;
            return;
        }
        currentRow++;
        if (currentRow == 6) {
            status.textContent = `You lose! The word was ${answer}. Enter to play again.`;
            showDefinitionQuestion();
            running = false;
            return;
        }
        currentCol = 0;
        currentGuess = "";
    } else {
        showStatus("Not enough letters.");
    }
}