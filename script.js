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
const message = document.querySelector("#message");
const steps = Array.from(document.querySelectorAll("#processSteps li"));

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
    message.textContent = "Waehle mindestens eine Zeichenart aus.";
    generatedCode.textContent = "Kein Zeichensatz gewaehlt";
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
  generatedCode.textContent = finalCode;
  message.textContent = "Code wurde zufaellig generiert.";
  animateSteps();
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

function animateSteps() {
  steps.forEach((step) => step.classList.remove("active"));

  steps.forEach((step, index) => {
    setTimeout(() => {
      step.classList.add("active");
    }, index * 180);
  });
}

async function copyCode() {
  const text = generatedCode.textContent;

  if (!text || text.includes("Klicke") || text.includes("Kein")) {
    message.textContent = "Erstelle zuerst einen Code.";
    return;
  }

  await navigator.clipboard.writeText(text);
  message.textContent = "Code wurde kopiert.";
}
