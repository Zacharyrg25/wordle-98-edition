let currentRow = 0;
let currentCol = 0;
let currentGuess = "";
let answer = "PLANT";
let running = true;

const rows = document.querySelectorAll("#slots .row");
const keys = document.querySelectorAll(".key");
const status = document.getElementById("status");

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
    if (currentCol < 5 && running) {
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

function submitGuess() {
    status.textContent = "";
    if (!running) {
        for (let i = 0; i < rows.length; i++) {
            for (let j = 0; j < rows[i].children.length; j++) {
                rows[i].children[j].classList.remove("correct", "present", "absent");
                rows[i].children[j].textContent = "";
            }
        }

        currentRow = 0;
        currentCol = 0;
        currentGuess ="";
        running = true;
        return;
    } else if (currentGuess.length == 5) {
        let answerLetters = answer.split("");

        for (let i = 0; i < currentGuess.length; i++) {
            if (currentGuess[i] === answer[i]) {
                rows[currentRow].children[i].classList.add("correct");
                answerLetters[i] = null;
            }
        }

        for (let i = 0; i < currentGuess.length; i++) {
            if (currentGuess[i] === answer[i]) {
                continue;
            }

            if (answerLetters.includes(currentGuess[i])) {
                rows[currentRow].children[i].classList.add("present");

                let index = answerLetters.indexOf(currentGuess[i]);
                answerLetters[index] = null;
            } else {
                rows[currentRow].children[i].classList.add("absent");
            }
        }

        if (currentGuess === answer) {
            status.textContent = `You win! The word was ${answer}. "Enter" to play again.`;
            running = false;
            return;
        }
        currentRow++;
        if (currentRow == 6) {
            status.textContent = `You lose! The word was ${answer}. "Enter" to play again.`;
            running = false;
            return;
        }
        currentCol = 0;
        currentGuess = "";
    } else if (currentGuess.length > 0 && currentGuess.length < 5) {
        status.textContent = "Word is too short.";
    } else {
        status.textContent = "Enter a word."
    }
}