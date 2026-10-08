// ===== Mobile menu =====
const menuBtn = document.getElementById("menuBtn");
const nav = document.getElementById("nav");
menuBtn.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", open);
});
nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => nav.classList.remove("open")));

// ===== Highlight active section in menu =====
const sections = document.querySelectorAll("main section");
window.addEventListener("scroll", () => {
  let current = "";
  sections.forEach(s => { if (window.scrollY >= s.offsetTop - 120) current = s.id; });
  nav.querySelectorAll("a").forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + current));
});

// ===== Accessibility tools =====
let size = 17;
const setSize = s => { size = Math.min(26, Math.max(13, s)); document.documentElement.style.setProperty("--base", size + "px"); };
document.getElementById("fontUp").onclick = () => setSize(size + 2);
document.getElementById("fontDown").onclick = () => setSize(size - 2);
document.getElementById("contrastBtn").onclick = () => document.body.classList.toggle("contrast");

// ===== Simple notes & download =====
document.getElementById("simpleBtn").onclick = e => {
  const notes = document.getElementById("simpleNotes");
  notes.hidden = !notes.hidden;
  e.target.textContent = notes.hidden ? "Show simple notes" : "Hide simple notes";
};
document.getElementById("downloadBtn").onclick = () => {
  const text = `ACTIVE AND PASSIVE VOICE - Summary Notes (Grades 8-12)

ACTIVE: the subject does the action.   The learner wrote the essay.
PASSIVE: the subject receives the action. The essay was written by the learner.

HOW TO CHANGE ACTIVE TO PASSIVE
1. Make the object the new subject.
2. Use "to be" in the same tense (is/are, was/were, will be, has been, is being).
3. Add the past participle of the main verb.
4. Add "by + doer" (optional).

Present simple:     is cleaned        Past simple:     was cleaned
Present continuous: is being cleaned  Present perfect: has been cleaned
Future:             will be cleaned   Modal:           must be cleaned

USE THE PASSIVE when the doer is unknown, unimportant, or in news/science writing.
Only verbs with an object can be passive.
`;
  const blob = new Blob([text], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "active-passive-notes.txt";
  a.click();
};

// ===== Part A: Drag-and-drop sorting =====
const bank = document.getElementById("bank");
const boxes = document.querySelectorAll(".sortbox");
let dragged = null, selected = null;

function place(chip, zone) {
  zone.appendChild(chip);
  chip.classList.remove("right", "wrong");
  chip.style.background = "";
}
document.querySelectorAll(".chip").forEach(chip => {
  chip.addEventListener("dragstart", () => (dragged = chip));
  chip.addEventListener("click", e => {
    e.stopPropagation();
    if (selected) selected.classList.remove("selected");
    selected = chip; chip.classList.add("selected");
  });
});
[...boxes, bank].forEach(zone => {
  zone.addEventListener("dragover", e => { e.preventDefault(); zone.classList.add("over"); });
  zone.addEventListener("dragleave", () => zone.classList.remove("over"));
  zone.addEventListener("drop", e => { e.preventDefault(); zone.classList.remove("over"); if (dragged) place(dragged, zone); });
  zone.addEventListener("click", () => {
    if (selected) { selected.classList.remove("selected"); place(selected, zone); selected = null; }
  });
});
document.getElementById("checkSort").onclick = () => {
  let correct = 0;
  const total = document.querySelectorAll(".chip").length;
  boxes.forEach(box => box.querySelectorAll(".chip").forEach(chip => {
    const ok = chip.dataset.type === box.dataset.accept;
    if (ok) correct++;
    chip.style.background = ok ? "var(--ok)" : "var(--bad)";
  }));
  document.getElementById("sortFeedback").textContent = correct === total
    ? "🎉 All correct! Well done."
    : `${correct} of ${total} correct. Red sentences are in the wrong box (or still unsorted ones remain).`;
};
document.getElementById("resetSort").onclick = () => {
  document.querySelectorAll(".chip").forEach(c => place(c, bank));
  document.getElementById("sortFeedback").textContent = "";
};

// ===== Part B: Rewrite sentences =====
const rewriteItems = [
  { active: "The learners clean the classroom.", answers: ["the classroom is cleaned by the learners."] },
  { active: "Tom broke the window.", answers: ["the window was broken by tom."] },
  { active: "The principal will announce the results.", answers: ["the results will be announced by the principal."] },
  { active: "Someone has stolen my bag.", answers: ["my bag has been stolen.", "my bag has been stolen by someone."] }
];
const rewriteDiv = document.getElementById("rewrite");
rewriteItems.forEach((item, i) => {
  rewriteDiv.insertAdjacentHTML("beforeend", `
    <fieldset id="rw${i}"><legend>${i + 1}. ${item.active}</legend>
      <label for="rwIn${i}" class="small">Passive voice:</label>
      <input id="rwIn${i}" type="text" style="width:100%;padding:.5rem;font-size:1rem" autocomplete="off">
    </fieldset>`);
});
const norm = s => s.trim().toLowerCase().replace(/\s+/g, " ");
document.getElementById("checkRewrite").onclick = () => {
  let correct = 0;
  rewriteItems.forEach((item, i) => {
    const fs = document.getElementById("rw" + i);
    const val = norm(document.getElementById("rwIn" + i).value);
    const ok = item.answers.includes(val);
    if (ok) correct++;
    fs.className = ok ? "right" : "wrong";
    fs.querySelector(".fb")?.remove();
    fs.insertAdjacentHTML("beforeend", `<p class="fb small">${ok ? "✔ Correct!" : "✘ Model answer: " + item.answers[0].charAt(0).toUpperCase() + item.answers[0].slice(1)}</p>`);
  });
  document.getElementById("rewriteFeedback").textContent = `You got ${correct} of ${rewriteItems.length} correct.`;
};

// ===== Quiz =====
const answers = {
  q1: { correct: "b", marks: 2, explain: "The ball receives the action, so it is passive." },
  q2: { correct: "a", marks: 2, explain: "Present simple: is + spoken." },
  q3: { correct: "c", marks: 2, explain: "Present continuous: is being + cooked." },
  q4: { correct: "b", marks: 2, explain: "The main verb is always the past participle." },
  q5: { correct: "b", marks: 1, explain: "False – 'sleep' has no object, so it cannot be passive." },
  q6: { correct: "a", marks: 1, explain: "Future: will be + repaired. 'Someone' can be left out." }
};
document.getElementById("quizForm").addEventListener("submit", e => {
  e.preventDefault();
  let score = 0, total = 0;
  const fieldsets = e.target.querySelectorAll("fieldset");
  Object.keys(answers).forEach((q, i) => {
    const { correct, marks, explain } = answers[q];
    total += marks;
    const picked = e.target.querySelector(`input[name="${q}"]:checked`);
    const fs = fieldsets[i];
    fs.querySelector(".fb")?.remove();
    const ok = picked && picked.value === correct;
    if (ok) score += marks;
    fs.className = ok ? "right" : "wrong";
    const p = document.createElement("p");
    p.className = "fb small";
    p.textContent = (ok ? "✔ Correct. " : "✘ Not quite. ") + explain;
    fs.appendChild(p);
  });
  const pct = Math.round((score / total) * 100);
  document.getElementById("quizResult").textContent =
    `Your score: ${score}/${total} (${pct}%) ` + (pct >= 80 ? "🌟 Well done!" : pct >= 50 ? "👍 Good effort – review the notes." : "📖 Please revise the content and try again.");
});
