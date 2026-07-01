const groups = {
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  symbols: "!@#$%&*?+-_=<>"
};

const lengthInput = document.querySelector("#lengthInput");
const lengthValue = document.querySelector("#lengthValue");
const generateButton = document.querySelector("#generateButton");
const copyButton = document.querySelector("#copyButton");
const generatedCode = document.querySelector("#generatedCode");
const slotDisplay = document.querySelector("#slotDisplay");
const message = document.querySelector("#message");
const steps = Array.from(document.querySelectorAll("#processSteps li"));

let spinTimers = [];
let stepTimer = null;
let currentCode = "";

lengthInput.addEventListener("input", () => {
  lengthValue.textContent = lengthInput.value;
});

generateButton.addEventListener("click", generateCode);
copyButton.addEventListener("click", copyCode);

function generateCode() {
  const selectedGroups = Object.entries(groups)
    .filter(([id]) => document.querySelector(`#${id}`).checked)
    .map(([, chars]) => chars);

  if (selectedGroups.length === 0) {
    stopAllSpinners();
    stopStepAnimation();
    message.textContent = "Wähle mindestens eine Zeichenart aus.";
    generatedCode.textContent = "Kein Zeichensatz gewählt";
    slotDisplay.innerHTML = '<span class="placeholder">Kein Zeichensatz gewählt</span>';
    currentCode = "";
    return;
  }

  const targetLength = Number(lengthInput.value);
  const allCharacters = selectedGroups.join("");
  const characters = [];

  selectedGroups.forEach((chars) => {
    characters.push(randomCharacter(chars));
  });

  while (characters.length < targetLength) {
    characters.push(randomCharacter(allCharacters));
  }

  const finalCode = shuffle(characters).join("");
  currentCode = finalCode;
  generatedCode.textContent = finalCode;
  message.textContent = "Code wird generiert ...";
  generateButton.disabled = true;
  copyButton.disabled = true;
  startStepAnimation();
  spinCode(finalCode, allCharacters);
}

function spinCode(finalCode, allCharacters) {
  stopAllSpinners();
  slotDisplay.innerHTML = "";

  const slots = finalCode.split("").map(() => {
    const slot = document.createElement("span");
    const char = document.createElement("span");

    slot.className = "slot";
    char.className = "slot-char";
    char.textContent = randomCharacter(allCharacters);

    slot.append(char);
    slotDisplay.append(slot);
    return { slot, char };
  });

  slots.forEach(({ char }, index) => {
    const timer = setInterval(() => {
      char.textContent = randomCharacter(allCharacters);
    }, 48 + index * 3);

    spinTimers.push(timer);
  });

  slots.forEach(({ slot, char }, index) => {
    setTimeout(() => {
      clearInterval(spinTimers[index]);
      char.textContent = finalCode[index];
      slot.classList.add("stopped");

      if (index === slots.length - 1) {
        spinTimers = [];
        stopStepAnimation(true);
        message.textContent = "Code wurde zufällig generiert.";
        generateButton.disabled = false;
        copyButton.disabled = false;
      }
    }, 520 + index * 135);
  });
}

function stopAllSpinners() {
  spinTimers.forEach((timer) => clearInterval(timer));
  spinTimers = [];
  generateButton.disabled = false;
  copyButton.disabled = false;
}

function startStepAnimation() {
  stopStepAnimation();

  let activeIndex = 0;
  highlightStep(activeIndex);

  stepTimer = setInterval(() => {
    activeIndex = (activeIndex + 1) % steps.length;
    highlightStep(activeIndex);
  }, 360);
}

function stopStepAnimation(showAllDone = false) {
  if (stepTimer) {
    clearInterval(stepTimer);
    stepTimer = null;
  }

  steps.forEach((step) => {
    step.classList.toggle("active", showAllDone);
  });
}

function highlightStep(activeIndex) {
  steps.forEach((step, index) => {
    step.classList.toggle("active", index === activeIndex);
  });
}

function randomCharacter(characters) {
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  return characters[values[0] % characters.length];
}

function shuffle(items) {
  const result = [...items];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const values = new Uint32Array(1);
    crypto.getRandomValues(values);
    const randomIndex = values[0] % (index + 1);
    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }

  return result;
}

async function copyCode() {
  if (!currentCode) {
    message.textContent = "Erstelle zuerst einen Code.";
    return;
  }

  await navigator.clipboard.writeText(currentCode);
  message.textContent = "Code wurde kopiert.";
}
