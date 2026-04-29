let currentRow = 0;
let currentCol = 0;
let currentGuess = "";
let answer = "PLANT";

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

function addLetter(letter) {
    // Check if currentCol is less than 5 before adding a letter.
    if (currentCol < 5) {
        // Find the correct slot in the current row.
        // Put the letter inside that slot.
        rows[currentRow].children[currentCol].textContent = letter;
        // Add the letter to currentGuess.
        currentGuess += letter;
        // Increase currentCol by 1.
        currentCol++;
    }
}

function deleteLetter() {
    // Check if currentCol is greater than 0 before deleting.
    if (currentCol > 0) {
        // Decrease currentCol by 1.
        currentCol--;
        // Find the correct slot in the current row.
        // Clear the letter inside that slot.
        rows[currentRow].children[currentCol].textContent = "";
        // Remove the last character from currentGuess.
        currentGuess = currentGuess.slice(0, -1);
    }
}

function submitGuess() {
    status.textContent = "";
    // Check if currentGuess has exactly 5 letters.
    if (currentGuess.length == 5) {
        // Compare each letter in currentGuess to the answer.
        // Decide whether each letter is correct, present, or absent.
        // Add the appropriate color class to each slot.
        for (let i = 0; i < currentGuess.length; i++) {
            if (currentGuess[i] === answer[i]) {
                rows[currentRow].children[i].classList.add("correct");
            } else if (answer.includes(currentGuess[i])) {
                rows[currentRow].children[i].classList.add("present");
            } else {
                rows[currentRow].children[i].classList.add("absent");
            }
        }
        // Check if the player guessed the full word correctly.
        if (currentGuess === answer) {
            status.textContent = `You win! The word was ${answer}. "Enter" to play again.`;
            return;
        }
        // Move to the next row by increasing currentRow.
        currentRow++;
        // Reset currentCol to 0.
        currentCol = 0;
        // Reset currentGuess to an empty string.
        currentGuess ="";
    }
    else {
        status.textContent = "Word is too short.";
    }
}