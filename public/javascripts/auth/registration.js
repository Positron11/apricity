// elements
const captchaField = document.getElementById("CaptchaField");
const captchaQuestion = document.getElementById("CaptchaQuestion");

// generate captcha string
const operators = ["+", "-", "*"];
const operations = ["plus", "minus", "times"];

const x = Math.floor(Math.random() * 10);
const y = Math.floor(Math.random() * 10);

const rand = Math.floor(Math.random() * operators.length);
const mathString = `${x} ${operators[rand]} ${y}`;
const wordString = `${x} ${operations[rand]} ${y}`;

// set captcha field attribute
captchaQuestion.setAttribute("value", mathString);
captchaField.setAttribute("placeholder", `Solve: ${wordString}`);