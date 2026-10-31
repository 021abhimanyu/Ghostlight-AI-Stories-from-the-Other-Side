# Ghostlight AI 👻

**Some stories never leave the dark.** Ghostlight is a small browser-based creative tool for generating short ghost stories or writing a remembrance of a person, place, or moment.

Built for the Hacktoberfest Open-Source AI Challenge — **Ghost in the Machine**.

## What it does

- **Ghost Story mode:** create atmospheric short fiction from a setting, mood, and optional detail.
- **Memory Keeper mode:** shape personal details into a gentle remembrance note.
- **Browser-based inference:** uses the open-weight `Xenova/flan-t5-small` model through Transformers.js.
- **Privacy-minded by design:** prompts are passed to the model running in the browser, not to a custom application server.
- **Fallback mode:** if the model cannot load, a simple template-based generator still demonstrates the interface. This fallback is not AI.

## Run it

Because JavaScript modules and browser model loading can behave differently from `file://`, serve the project locally.

### Option A: Python

```bash
python -m http.server 8000
```

Open `http://localhost:8000`.

### Option B: VS Code

Use the **Live Server** extension and open `index.html`.

## How the open-source AI works

Ghostlight imports [Transformers.js](https://github.com/xenova/transformers.js) from jsDelivr and loads `Xenova/flan-t5-small` from the Hugging Face model repository. The model runs inference in the browser. Model files need to be downloaded on first use and are cached by the browser where supported.

**Important reality check:** the first model load requires internet access. This is not guaranteed to work fully offline on a fresh browser profile. After the required assets are cached, the browser may be able to reuse them offline, depending on browser cache behavior. For reliable offline deployments, download and self-host the model assets and library files.

## Why open innovation matters

- **Control:** developers can inspect and modify the application and replace the model with another compatible open model.
- **Privacy:** the app has no account system or application backend. Prompts are sent to the in-browser model rather than a hosted generation API. The initial download contacts the CDN and model host.
- **Access:** no paid inference API key is required. Running the model uses the visitor's own device resources.
- **Durability:** the project can be forked, adapted, and self-hosted instead of depending on a single closed AI service.

## Tech stack

- HTML
- CSS
- Vanilla JavaScript
- [Transformers.js](https://github.com/xenova/transformers.js)
- [Xenova/flan-t5-small](https://huggingface.co/Xenova/flan-t5-small)

## Limitations and responsible use

- The model may produce awkward, generic, or inaccurate text.
- The remembrance mode is a writing aid, not a source of facts. Review and correct every detail; it should not invent a person's biography.
- Avoid entering highly sensitive information if you are not comfortable with the browser, device, or hosting environment handling it.
- This is a creative storytelling project, not a supernatural or grief-counselling service.
- For a truly offline build, vendor the JavaScript library and model assets locally and test with networking disabled.

## Project structure

```text
ghostlight-ai/
├── index.html
├── style.css
├── app.js
└── README.md
```

## Ideas for contributions

- Add local model selection.
- Add export-to-Markdown for a story or remembrance.
- Add a local gallery using IndexedDB, with a clear delete-all control.
- Add a candlelit ofrenda-inspired theme that users can customize respectfully.
- Add tests for prompt construction and fallback behavior.

## License

MIT — see `LICENSE`.
