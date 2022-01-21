const timesOptions = document.querySelectorAll('[data-times-options]');
let choice = undefined;
let DEFAULT_TIME = 30;
let DEFAULT_WPM = 0;
let DEFAULT_ACCURACY = 100 + '%';
let CURRENT_ACCURACY = undefined;
// Modal
var myModal = new bootstrap.Modal(document.getElementById('final-result'));
let modalAccuracy = document.querySelector('[data-modal-accuracy]');
let modalWpm = document.querySelector('[data-modal-wpm]');
let modalTimer = document.querySelector('[data-modal-timer]');

let quoteArr = [
    `the purpose of our lives is to be happy`,
    `get busy living or get busy dying`,
    `you only live once, but if you do it right, once is enough`,
    `if you want to live a happy life, tie it to a goal, not to people or things`,
    `never let the fear of striking out keep you from playing the game`,
    `not how long, but how well you have lived is the main thing`,
    `never let the fear of striking out keep you from playing the game`,
    `not how long, but how well you have lived is the main thing`,
    `in order to write about life first you must live it`,
    `if life were predictable it would cease to be life, and be without flavor`,
    `the big lesson in life, baby, is never be scared of anyone or anything`,
    `turn your wounds into wisdom`,
    `the unexamined life is not worth living`,
    `life is not a problem to be sovled, but a reality to be experienced`,
    `the way I see it, if you want the rainbow, you gotta put up with the rain`,
    `i like criticism. It makes you strong`
]

// TIMER SESSION
let timerDisplay = document.querySelector('[data-timer]')
choice = DEFAULT_TIME;
timerDisplay.innerText = choice + 's';

timesOptions.forEach(option => {
    option.addEventListener('click', () => {
        if (timerDisplay.textContent.length > 0) {
            timerDisplay.textContent = '';
        }
        choice = option.textContent;
        timerDisplay.textContent = choice + 's';
    })
});

let isTimerStart = false;
let timer = undefined;
function getTimer(timeAmount) {
    timeAmount = parseFloat(choice);
    if (isNaN(timeAmount)) {
        timeAmount = DEFAULT_TIME;
    }

    let start = Date.now();
    timer = setInterval(function () {
        let distance = Date.now() - start;
        let seconds = timeAmount - Math.floor(distance / 1000);

        timerDisplay.textContent = seconds + 's';

        // time out behaviour
        if (seconds == 0) {
            finish(timer);
        }

    }, 1000);
    isTimerStart = true;
}

function finish(timer) {
    clearInterval(timer);
    bodyTextField.readOnly = 'false';
    isPlay = false;
    isTimerStart = false; // prevent timer start when user refocus textarea

    // calculate final result
    modalTimer.innerText = "Time: " + choice + 's'
    modalWpm.innerText = 'WPM: ' + wpmDisplay.innerText;
    modalAccuracy.innerText = 'Accuracy: ' + CURRENT_ACCURACY + '%';
    myModal.show();
}

// BODY SESSION
const bodyTextField = document.querySelector('[data-body-text-field]');
const bodyQuotesField = document.querySelector('[data-body-quotes-field]');

// Getting quotes
let isPlay = false;
bodyTextField.addEventListener('focus', () => {
    // prevent user acidentialy get the new quote when re focus to the text field
    if (!isPlay)
        start();
});


let currentQuoteArr = undefined;
function getQuote() {
    let currentQuote = quoteArr[Math.floor(Math.random() * quoteArr.length)];
    bodyQuotesField.innerText = null;
    // get quotes and split it into 'span' element
    currentQuote.split('').forEach(char => {
        let charSpan = document.createElement('span');
        charSpan.innerText = char;
        bodyQuotesField.appendChild(charSpan);
    })
}

bodyTextField.addEventListener('input', () => {
    trackQuote();
    if (!isTimerStart)
        getTimer(choice);
});

let characterTyped = 0;
let correctChar = 0;
let errors = 0;
let scrollCounter = 0;
let totalCorrectChar = 0;
let accuracyDisplay = document.querySelector('[data-accuracy]');
let wpmDisplay = document.querySelector('[data-wpm]');

accuracyDisplay.innerText = DEFAULT_ACCURACY;
wpmDisplay.innerText = DEFAULT_WPM;

function trackQuote() {
    // checking the correctness of user input
    characterTyped++;
    let currentQuoteArr = bodyQuotesField.querySelectorAll('span');
    let currentInput = bodyTextField.value;
    let currentInputArr = currentInput.split('');
    // overflow tracking and auto scroll
    bodyTextField.onkeydown = function (event) {
        if (event.which == 8) {
            if (scrollCounter == 0)
                return;
            scrollCounter--;
        } else {
            scrollCounter++;
        }
    };
    if (scrollCounter == 50) {
        bodyQuotesField.scrollBy(0, 30);
        scrollCounter = 0;
    }

    // Strict mode
    // bodyTextField.onkeydown = function (event) {

    //     if (event.which == 8) {

    //         event.preventDefault();   // turn off browser transition to the previous page 
    //     }
    // };

    // correcness checker
    currentQuoteArr.forEach((char, index) => {
        let typedChar = currentInputArr[index];
        if (typedChar == null) { // if user have not type yet
            char.classList.remove('body__correct-char');
            char.classList.remove('body__incorrect-char');
        }
        else if (typedChar == char.innerText) { // correct case
            char.classList.add('body__correct-char');
            char.classList.remove('body__incorrect-char');
        }
        else { // incorrect case
            char.classList.add('body__incorrect-char');
            char.classList.remove('body__correct-char');
        }
    })

    // calculate accuracy session
    errors = bodyQuotesField.querySelectorAll('.body__incorrect-char').length;
    correctChar = bodyQuotesField.querySelectorAll('.body__correct-char').length;

    CURRENT_ACCURACY = ((correctChar + totalCorrectChar) / (characterTyped) * 100).toFixed(0);
    accuracyDisplay.innerText = CURRENT_ACCURACY + '%';

    // wpm session
    wpmDisplay.innerText = getWpm();

    // get new quote
    if (currentInput.length == bodyQuotesField.innerText.length) {
        totalCorrectChar += correctChar;
        getQuote();
        bodyTextField.value = '';
    }

}

function getWpm() {
    return ((characterTyped / 5) / (choice / 60)).toFixed(0);
}

function reset() {
    bodyTextField.value = '';
    bodyQuotesField.innerText = '';
    timerDisplay.innerText = choice + 's';
    accuracyDisplay.innerText = DEFAULT_ACCURACY;
    wpmDisplay.innerText = DEFAULT_WPM;
    characterTyped = 0;
    errors = 0;
    isPlay = false;
    isTimerStart = false;
    characterTyped = 0;
    totalCorrectChar = 0
}

let announce = document.querySelector('[data-announce]');
function start() {
    isPlay = true;
    bodyTextField.removeAttribute('readonly');
    resetBtn.classList.remove('reset-btn-hidden');
    resetBtn.classList.add('reset-btn-show');
    announce.classList.add('visually-hidden');
    disabledOptions();
    getQuote();
}

function disabledOptions() {   
    timesOptions.forEach(option => {
        option.classList.add('disabled');
    })
}

function enabledOptions() {
    timesOptions.forEach(option => {
        option.classList.remove("disabled");
    })
}


const resetBtn = document.querySelector('[data-reset-btn]');
resetBtn.addEventListener('click', () => {
    clearInterval(timer);
    reset();
    resetBtn.classList.add('reset-btn-hidden');
    resetBtn.classList.remove('reset-btn-show');
    enabledOptions();
})

let replayBtn = document.querySelector('[data-again-btn]');
replayBtn.addEventListener('click', () => {
    reset();
    resetBtn.classList.add('reset-btn-hidden');
    resetBtn.classList.remove('reset-btn-show');
    enabledOptions();

})