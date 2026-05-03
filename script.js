let currentRow = 0;
let currentCol = 0;
let currentGuess = "";
let answer = WORDS[Math.floor(Math.random() * WORDS.length)].toUpperCase();
let running = true;

const rows = document.querySelectorAll("#slots .row");
const keys = document.querySelectorAll(".key");
const status = document.getElementById("status");

// MODAL CODE ---

const mainBar = document.getElementById("bar");

setupModal("tr1", "modal1");
setupModal("tr2", "modal2");

function setupModal(openButtonId, modalId) {
    const openBtn = document.getElementById(openButtonId);
    const modal = document.getElementById(modalId);
    const modalWindow = modal.querySelector(".modal-content");
    const modalTitleBar = modal.querySelector(".modal-title-bar");
    const closeBtn = modal.querySelector(".close-btn");

    openBtn.addEventListener("click", () => {
        modal.classList.remove("hidden");
        mainBar.classList.add("inactive");
    });

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

        for (let i = 0; i < keys.length; i ++) {
            keys[i].classList.remove("correct", "present", "absent");
        }

        currentRow = 0;
        currentCol = 0;
        currentGuess ="";
        answer = WORDS[Math.floor(Math.random() * WORDS.length)].toUpperCase();
        running = true;
        return;
    } else if (currentGuess.length == 5) {
        let answerLetters = answer.split("");

        if (!WORDS.includes(currentGuess.toLowerCase())) {
            status.textContent = "Word not in list.";
            return;
        }

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
    } else {
        status.textContent = "Not enough letters.";
    }
}