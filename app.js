const $ = (id) => document.getElementById(id);
const tabs = [...document.querySelectorAll(".tab")];
let mode = "ghost";
let generator = null;
let modelLoading = false;
let lastText = "";

const copyButton = $("copy-button");
const status = $("model-status");

const modeCopy = {
  ghost: {
    kicker: "THE HAUNTED ARCHIVE / 001",
    title: "Summon a story",
    description: "Give the unknown a place, a feeling, and a secret.",
    subjectLabel: "Where does the haunting begin?",
    subjectPlaceholder: "An abandoned railway station...",
    moodLabel: "Choose your atmosphere",
    detailsLabel: "Add a detail",
    detailsPlaceholder: "A clock that runs backward, a letter with no name...",
    button: "Create my ghost story",
    outputLabel: "YOUR TRANSMISSION"
  },
  memory: {
    kicker: "THE REMEMBRANCE ROOM / 002",
    title: "Keep a memory",
    description: "Honor a person, a place, or a small moment worth keeping.",
    subjectLabel: "What or whom would you like to remember?",
    subjectPlaceholder: "My grandmother's garden...",
    moodLabel: "Choose the feeling",
    detailsLabel: "Share a detail",
    detailsPlaceholder: "A favorite saying, a song, a meal, a story they told...",
    button: "Create a remembrance",
    outputLabel: "A MEMORY PRESERVED"
  }
};

function setMode(nextMode) {
  mode = nextMode;
  tabs.forEach(tab => {
    const active = tab.dataset.mode === mode;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", String(active));
  });
  const copy = modeCopy[mode];
  $("mode-kicker").textContent = copy.kicker;
  $("form-title").textContent = copy.title;
  $("form-description").textContent = copy.description;
  $("subject-label").textContent = copy.subjectLabel;
  $("subject").placeholder = copy.subjectPlaceholder;
  $("mood-label").textContent = copy.moodLabel;
  $("details-label").innerHTML = `${copy.detailsLabel} <span>(optional)</span>`;
  $("details").placeholder = copy.detailsPlaceholder;
  $("button-label").textContent = copy.button;
  document.querySelector(".output-label").textContent = copy.outputLabel;
}
tabs.forEach(tab => tab.addEventListener("click", () => setMode(tab.dataset.mode)));

function setStatus(message, ready = false) {
  status.querySelector("span:last-child").textContent = message;
  status.classList.toggle("ready", ready);
}

async function loadModel() {
  if (generator || modelLoading) return;
  modelLoading = true;
  $("load-model").disabled = true;
  $("load-model").textContent = "Loading model files…";
  setStatus("Downloading open model files. This can take a while on first use.");
  try {
    // Transformers.js runs inference in-browser. The model is open-weight and hosted on Hugging Face.
    const { pipeline, env } = await import("https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2");
    env.allowLocalModels = false;
    env.useBrowserCache = true;
    generator = await pipeline("text2text-generation", "Xenova/flan-t5-small", {
      progress_callback: (progress) => {
        if (progress.status === "progress" && progress.total) {
          const pct = Math.round((progress.loaded / progress.total) * 100);
          setStatus(`Loading model files… ${pct}%`);
        }
      }
    });
    setStatus("Open model ready in this browser. Prompts are processed locally.", true);
    $("load-model").textContent = "Open model loaded ✓";
  } catch (error) {
    console.error(error);
    setStatus("Model could not load. Check your connection, then try again.");
    $("load-model").disabled = false;
    $("load-model").textContent = "Try loading the open model again ↗";
  } finally {
    modelLoading = false;
  }
}
$("load-model").addEventListener("click", loadModel);

function fallbackStory(subject, mood, details, memoryMode) {
  // A deterministic offline fallback, not a language model. The UI labels this honestly.
  if (memoryMode) {
    return `A small remembrance of ${subject}\n\nSome memories arrive quietly: in a familiar sound, a favorite meal, or the way light rests in a room. ${details ? details + " " : ""}These details are more than pieces of the past; they are little lanterns we can carry forward.\n\nToday, let this memory have a place to rest. Write down another detail when it returns, and keep the story in your own words. The people and moments we cherish continue to shape the lives we live.`;
  }
  const endings = {
    "Quietly unsettling": "At midnight, the lights blinked once. In the glass, a second reflection remained after the room was empty.",
    "Full of dread": "Then the door clicked shut behind them. From the other side, their own voice whispered, 'You came back.'",
    "Melancholy and beautiful": "By dawn, the footsteps had faded. Only a warm cup remained, waiting beside the window.",
    "Folklore and mystery": "The oldest villagers crossed themselves. They knew the place had finally remembered its name."
  };
  return `The Last Light at ${subject}\n\nThe night settled over ${subject} with the strange stillness that comes before a storm. ${details ? details + " " : ""}The air felt ${mood.toLowerCase()}, as if the walls were holding their breath.\n\nA faint sound drifted from the darkness—not quite a voice, not quite the wind. Somewhere beyond the reach of the light, something old had woken and was waiting to be noticed.\n\n${endings[mood] || endings["Quietly unsettling"]}`;
}

async function generateText(subject, mood, details) {
  const memoryMode = mode === "memory";
  if (!generator) {
    const text = fallbackStory(subject, mood, details, memoryMode);
    $("output-note").textContent = "Offline fallback template used — load the open model for AI generation.";
    return { title: memoryMode ? "A MEMORY TO KEEP" : "A TALE FROM THE DARK", text };
  }
  const prompt = memoryMode
    ? `Write a gentle, respectful remembrance note about ${subject}. Mood: ${mood}. Personal details: ${details || "none provided"}. Do not invent factual biography. Use 2 short paragraphs and honor the person's memory.`
    : `Write an original short ghost story. Setting: ${subject}. Atmosphere: ${mood}. Extra detail: ${details || "none"}. Write 3 atmospheric paragraphs, with a subtle eerie ending.`;
  $("output-note").textContent = "Generating with the open-weight model in your browser…";
  const result = await generator(prompt, { max_new_tokens: 180, do_sample: true, temperature: 0.85 });
  return { title: memoryMode ? "A MEMORY TO KEEP" : "A TALE FROM THE DARK", text: result?.[0]?.generated_text?.trim() || "The archive is silent. Try another prompt." };
}

function renderResult(title, text) {
  lastText = `${title}\n\n${text}`;
  $("output").innerHTML = "";
  const heading = document.createElement("div");
  heading.className = "result-title";
  heading.textContent = title;
  const body = document.createElement("div");
  body.className = "result-text";
  body.textContent = text;
  $("output").append(heading, body);
  copyButton.disabled = false;
}

$("create-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const subject = $("subject").value.trim();
  if (!subject) return;
  const button = $("create-button");
  button.disabled = true;
  $("button-label").textContent = "Listening to the silence…";
  try {
    const result = await generateText(subject, $("mood").value, $("details").value.trim());
    renderResult(result.title, result.text);
  } catch (error) {
    console.error(error);
    renderResult("THE ARCHIVE ANSWERS", fallbackStory(subject, $("mood").value, $("details").value.trim(), mode === "memory"));
    $("output-note").textContent = "Model generation failed; offline fallback template used.";
  } finally {
    button.disabled = false;
    $("button-label").textContent = modeCopy[mode].button;
  }
});

copyButton.addEventListener("click", async () => {
  if (!lastText) return;
  try {
    await navigator.clipboard.writeText(lastText);
    copyButton.textContent = "Copied ✓";
    setTimeout(() => copyButton.textContent = "Copy text ⧉", 1500);
  } catch {
    const area = document.createElement("textarea");
    area.value = lastText;
    document.body.append(area);
    area.select();
    document.execCommand("copy");
    area.remove();
    copyButton.textContent = "Copied ✓";
    setTimeout(() => copyButton.textContent = "Copy text ⧉", 1500);
  }
});
