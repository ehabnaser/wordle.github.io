let correctWord = "";
let attempts = 0;
const maxAttempts = 5;

async function getRandomWord() {
    try {
        let response = await fetch("https://random-word-api.herokuapp.com/word?number=10");
        let words = await response.json();
        
        let filteredWords = words.filter(word => word.length >= 3 && word.length <= 6);
        
        if (filteredWords.length === 0) {
            return getRandomWord();
        }

        correctWord = filteredWords[Math.floor(Math.random() * filteredWords.length)];
        console.log("Word to Guess:", correctWord);
        generateInputSquares(correctWord.length);
        updateChances();
    } catch (error) {
        console.error("Error fetching word:", error);
    }
}

function generateInputSquares(length) {
    if (attempts >= maxAttempts) return;
    
    const wordContainer = document.getElementById("wordContainer");
    let newRow = document.createElement("div");
    newRow.classList.add("word-row");
    
    for (let i = 0; i < length; i++) {
        let inputBox = document.createElement("input");
        inputBox.type = "text";
        inputBox.maxLength = 1;
        inputBox.classList.add("letter-box");
        
        // Automatically move to the next box on input
        inputBox.addEventListener("input", function() {
            if (this.value.length === 1 && this.nextElementSibling) {
                this.nextElementSibling.focus();
            }
        });

        // Handle backspace to move focus to previous box
        inputBox.addEventListener("keydown", function(event) {
            if (event.key === "Backspace" && this.value === "" && this.previousElementSibling) {
                this.previousElementSibling.focus();
            }
        });

        newRow.appendChild(inputBox);
    }
    
    wordContainer.appendChild(newRow); // Append new row at the bottom
    newRow.querySelector("input").focus(); // Focus on first input of new row
}

function checkWord() {
    if (attempts >= maxAttempts) return;
    
    let rows = document.querySelectorAll(".word-row");
    let currentRow = rows[rows.length - 1]; // Always check the latest row
    let inputBoxes = currentRow.querySelectorAll(".letter-box");
    let userWord = Array.from(inputBoxes).map(input => input.value).join("" ).toLowerCase();
    let correctWordArray = correctWord.split("");
    let letterCount = {};
    
    // Count occurrences of each letter in correctWord
    correctWordArray.forEach(letter => {
        letterCount[letter] = (letterCount[letter] || 0) + 1;
    });

    if (userWord.length === correctWord.length) {
        let checkedIndexes = new Set();
        
        // First pass: check for correct positions (green)
        for (let i = 0; i < correctWord.length; i++) {
            if (userWord[i] === correctWord[i]) {
                inputBoxes[i].style.backgroundColor = "#228B22"; // Green for correct position
                checkedIndexes.add(i);
                letterCount[userWord[i]]--; // Reduce available count
            }
        }
        
        // Second pass: check misplaced letters (orange/red)
        for (let i = 0; i < correctWord.length; i++) {
            if (!checkedIndexes.has(i)) {
                if (correctWord.includes(userWord[i]) && letterCount[userWord[i]] > 0) {
                    inputBoxes[i].style.backgroundColor = "#FFA500"; // Orange for wrong position
                    letterCount[userWord[i]]--; // Reduce available count
                } else {
                    inputBoxes[i].style.backgroundColor = "#8B0000"; // Red for incorrect letter
                }
            }
        }
        
        // Make the row uneditable
        inputBoxes.forEach(input => input.setAttribute("disabled", "true"));
        attempts++;
        updateChances();
        
        if (userWord === correctWord) {
            document.body.style.backgroundColor = "#228B22"; // Dark green background
            document.getElementById("celebration").classList.remove("hidden");
        } else {
            if (attempts < maxAttempts) {
                generateInputSquares(correctWord.length);
            } else {
                document.getElementById("message").textContent = `Game Over! The word was: ${correctWord}`;
            }
        }
    } else {
        document.getElementById("message").textContent = "Please fill all letters.";
    }
}

function updateChances() {
    document.getElementById("chancesLeft").textContent = `Chances left: ${maxAttempts - attempts}`;
}

function restartGame() {
    location.reload();
}

// Event listeners for submit button and enter key
document.getElementById("submitButton").addEventListener("click", checkWord);
document.getElementById("restartButton").addEventListener("click", restartGame);
document.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        checkWord();
    }
});

// Initialize the game
// document.body.insertAdjacentHTML("beforeend", '<p id="chancesLeft">Chances left: 5</p><button id="restartButton">Restart Game</button>');
getRandomWord();
