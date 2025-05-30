// public/script.js

document.addEventListener("DOMContentLoaded", () => {
  const isQuizPage = window.location.pathname.includes("quiz.html");

  if (!isQuizPage) {
    // ===== IMPORT SCREEN =====
    const addBtn = document.getElementById("addQuestionBtn");
    const startBtn = document.getElementById("startBtn");
    const list = document.getElementById("questionList");

    let questions = [];

    addBtn.addEventListener("click", () => {
      const word = document.getElementById("questionText").value.trim();
      const img1 = document.getElementById("img1").files[0];
      const img2 = document.getElementById("img2").files[0];
      const correct = document.querySelector('input[name="correct"]:checked').value;

      if (!word || !img1 || !img2) {
        alert("Please fill in all fields.");
        return;
      }

      const reader1 = new FileReader();
      const reader2 = new FileReader();

      reader1.onload = () => {
        const img1Data = reader1.result;

        reader2.onload = () => {
          const img2Data = reader2.result;

          questions.push({ word, img1: img1Data, img2: img2Data, correct });

          const li = document.createElement("li");
          li.textContent = `Q${questions.length}: ${word}`;
          list.appendChild(li);

          // Reset form
          document.getElementById("questionText").value = "";
          document.getElementById("img1").value = "";
          document.getElementById("img2").value = "";
          document.querySelector('input[name="correct"][value="1"]').checked = true;

          startBtn.disabled = false;
        };

        reader2.readAsDataURL(img2);
      };

      reader1.readAsDataURL(img1);
    });

    startBtn.addEventListener("click", () => {
      const seconds = 8;

      const quizData = {
        questions,
        currentIndex: 0,
        score: 0,
        timePerQuestion: seconds,
      };

      localStorage.setItem("quizData", JSON.stringify(quizData));
      window.location.href = "quiz.html";
    });

  } else {
    // ===== QUIZ SCREEN =====
    const wordPrompt = document.getElementById("wordPrompt");
    const left = document.getElementById("leftImage");
    const right = document.getElementById("rightImage");
    const resultText = document.getElementById("resultText");
    const restartBtn = document.getElementById("restartBtn");

    const stored = localStorage.getItem("quizData");
    if (!stored) {
      document.body.innerHTML = "<h2>No quiz data found. Please restart.</h2>";
      return;
    }

    const quizData = JSON.parse(stored);
    let timer;
    let timeLeft = quizData.timePerQuestion || 8;

    // Create or show the timer element
    const createTimerDisplay = () => {
      let t = document.getElementById("timerText");
      if (!t) {
        t = document.createElement("h3");
        t.id = "timerText";
        t.style.textAlign = "center";
        t.style.fontSize = "24px";
        t.style.color = "darkred";
        t.style.marginBottom = "10px";
        const container = document.getElementById("imageContainer");
        container.parentNode.insertBefore(t, container);
      } else {
        t.style.display = "block";
      }
      return t;
    };

    const startTimer = () => {
      timeLeft = quizData.timePerQuestion || 8;
      const timerText = createTimerDisplay();
      timerText.textContent = `Time left: ${timeLeft}s`;

      timer = setInterval(() => {
        timeLeft--;
        timerText.textContent = `Time left: ${timeLeft}s`;
        if (timeLeft <= 0) {
          clearInterval(timer);
          recordAnswer(null); // No answer selected
        }
      }, 1000);
    };

    const showQuestion = () => {
      if (quizData.currentIndex >= quizData.questions.length) {
        showFinalScore();
        return;
      }

      const q = quizData.questions[quizData.currentIndex];
      wordPrompt.textContent = q.word;
      left.src = q.img1;
      right.src = q.img2;
      resultText.textContent = "";
      left.style.display = "inline";
      right.style.display = "inline";

      startTimer();
    };

    const recordAnswer = (choice) => {
      clearInterval(timer);
      const q = quizData.questions[quizData.currentIndex];
      const wasCorrect = choice === q.correct;
      if (wasCorrect) quizData.score++;

      if (!quizData.answers) quizData.answers = [];

      quizData.answers.push({
        word: q.word,
        picked: choice,
        correct: q.correct,
        wasCorrect,
      });

      quizData.currentIndex++;
      setTimeout(showQuestion, 500);
    };

    left.addEventListener("click", () => recordAnswer("1"));
    right.addEventListener("click", () => recordAnswer("2"));

    const showFinalScore = () => {
      wordPrompt.textContent = "Quiz Complete!";
      left.style.display = "none";
      right.style.display = "none";

      const timerEl = document.getElementById("timerText");
      if (timerEl) timerEl.style.display = "none";

      resultText.textContent = `Your score: ${quizData.score}/${quizData.questions.length}`;
      resultText.style.color = "blue";

      const summary = document.createElement("div");
      summary.style.textAlign = "left";
      summary.style.marginTop = "20px";
      summary.innerHTML = "<h3>Your Answers:</h3><ul>" +
        quizData.answers.map((a, i) => {
          const choiceLabel = a.picked ? `Image ${a.picked}` : "No answer";
          const result = a.wasCorrect ? "✅" : "❌";
          return `<li><strong>Q${i + 1}</strong> - ${a.word}: You chose <em>${choiceLabel}</em> ${result}</li>`;
        }).join("") + "</ul>";

      document.body.appendChild(summary);
      restartBtn.style.display = "inline-block";
      localStorage.removeItem("quizData");
    };

    restartBtn.addEventListener("click", () => {
      window.location.href = "index.html";
    });

    showQuestion();
  }
});
