# Hippocampuzzle — Escape the Memory

An educational browser escape room about **hippocampus damage** and memory. You play as a patient with hippocampus damage, solving memory-related puzzles to find the key and escape.

**Theme:** Experience symptoms of memory impairment; learn how the hippocampus is crucial for forming new episodic memories and spatial navigation.

**Audience:** Ages 17–22, basic neuroscience interest.

---

## Play online

1. **GitHub Pages:** Push this folder to a GitHub repo, then enable **Pages** (Settings → Pages → Source: main branch, root). Your game will be at `https://<username>.github.io/<repo>/`.
2. **Local:** Open `index.html` in a browser, or run a local server:
   ```bash
   cd hippocampuzzle
   python3 -m http.server 8000
   ```
   Then open http://localhost:8000

---

## Rules

- **Rooms are sequential** — you must solve each puzzle to advance.
- **Unlimited attempts** — wrong answers are allowed.
- **Hints** — after **2 wrong attempts** in a room, the **Hint** button unlocks for that room.
- **Symptoms** — occasional screen effects (e.g. shake) simulate anxiety/emotional regulation issues linked to hippocampal damage.

---

## The 10 rooms

1. **Neurologist’s office** — Answer 3 MCQs about the brain and hippocampus; use the answers as the drawer keypad code (1–2–2).
2. **Corridor** — Use the floor plan and arrow card to find the next room code (7).
3. **Living room** — Memory sequence test, then recall “your” address from the room (42 Oak St).
4. **Bedroom** — Find four misplaced everyday objects; open the drawer for the next clue.
5. **Memory sort** — Classify items as **episodic** or **procedural** memory.
6. **Physiotherapy** — Order a day’s events into the correct timeline.
7. **Cue association** — Match items (e.g. music, pen, picture) to their environmental cues.
8. **Updated pairings** — Use the **new** object–location pairings (proactive interference) to find where the key is.
9. **Memory fragments** — Build one coherent day: Morning / Afternoon / Evening / Night.
10. **Final lock** — Pattern separation: choose the exact configuration you saw earlier.

---

## Files

- `index.html` — Structure and content for all rooms.
- `styles.css` — Layout and theme (dark, readable, minimal).
- `script.js` — Game state, puzzles, hints, and room flow.

No build step required; works as static files on GitHub Pages or any web server.
