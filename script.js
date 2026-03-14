(function () {
  'use strict';

  // --- State
  const state = {
    currentRoom: 1,
    wrongAttempts: {},
    hintUnlocked: {},
    sequenceAnswer: '',
    addressAnswer: '42 Oak St',
    room8Code: '5',
    patternCorrectIndex: 0
  };

  const ROOM_HINTS = {
    1: 'Answers: 1. Hippocampus (A), 2. Episodic memories formed and indexed (B), 3. Struggling to form new memories, lost, misplacing (B). Code: 1-2-2.',
    2: 'Assemble the map. The arrow card points to the room with number 7. Code: 7.',
    3: 'Sequence: remember the numbers shown. Address is on the "license" in the room: 42 Oak St.',
    4: 'All four items are misplaced: toothbrush in closet, remote by trash, shoes on bedside table, glasses under pillow. Check all four boxes.',
    5: 'Episodic: Piano and flowers (specific time). Procedural: Playing piano (skill), didn\'t remember who/which music.',
    6: 'Correct order: Waking up → Getting dressed → Breakfast → Drive to work → Work → Lunch → Drive home → Dinner → Ready for bed.',
    7: 'Match: Music–Record player, Pen–Journal, Picture–Book, Flower/Perfume–Odor.',
    8: 'New pairing for Key: Inside drawer. Click "Inside drawer" for the code digit.',
    9: 'Morning: bus stop, afternoon: cafe + library, evening: bedroom desk, night: notebook. One coherent day.',
    10: 'The correct pattern is the first one you were shown. Select the matching configuration.'
  };

  function getRoomEl(n) {
    return document.getElementById('room' + n);
  }

  function showRoom(n) {
    document.querySelectorAll('.room').forEach(function (r) {
      r.classList.add('hidden');
    });
    const room = n === 'Win' ? document.getElementById('roomWin') : getRoomEl(n);
    if (room) {
      room.classList.remove('hidden');
    }
    state.currentRoom = n;
    document.getElementById('currentRoomNum').textContent = n === 'Win' ? '—' : n;
    document.getElementById('progressFill').style.width = (n === 'Win' ? 100 : n * 10) + '%';
    document.getElementById('hintBtn').disabled = !(n !== 'Win' && state.hintUnlocked[n]);
  }

  function showFeedback(id, message, isError) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = message;
    el.classList.remove('hidden', 'success', 'error');
    el.classList.add(isError ? 'error' : 'success');
  }

  function hideFeedback(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  }

  function wrongAttempt(roomNum) {
    state.wrongAttempts[roomNum] = (state.wrongAttempts[roomNum] || 0) + 1;
    if (state.wrongAttempts[roomNum] >= 2) {
      state.hintUnlocked[roomNum] = true;
      document.getElementById('hintBtn').disabled = false;
    }
    if (Math.random() > 0.6) {
      document.body.classList.add('shake');
      setTimeout(function () {
        document.body.classList.remove('shake');
      }, 500);
    }
  }

  function openHint() {
    const r = state.currentRoom;
    if (r === 'Win' || !state.hintUnlocked[r]) return;
    document.getElementById('hintText').textContent = ROOM_HINTS[r] || 'No hint for this room.';
    document.getElementById('hint-panel').classList.remove('hidden');
  }

  function closeHint() {
    document.getElementById('hint-panel').classList.add('hidden');
  }

  document.getElementById('hintClose').addEventListener('click', closeHint);
  document.getElementById('hintBtn').addEventListener('click', openHint);
  document.getElementById('hintBtn').disabled = true;

  // --- Room 1: MCQs → keypad 122
  (function () {
    const expected = '122';
    const submit = document.getElementById('room1Submit');
    const codeInput = document.getElementById('room1Code');

    function getCode() {
      const q1 = document.querySelector('input[name="q1"]:checked');
      const q2 = document.querySelector('input[name="q2"]:checked');
      const q3 = document.querySelector('input[name="q3"]:checked');
      if (!q1 || !q2 || !q3) return null;
      const map = { A: '1', B: '2', C: '3', D: '4' };
      return (map[q1.value] || '') + (map[q2.value] || '') + (map[q3.value] || '');
    }

    submit.addEventListener('click', function () {
      const code = codeInput.value.replace(/\D/g, '').slice(0, 3) || getCode();
      if (!code) {
        showFeedback('room1Feedback', 'Answer the three questions or enter a 3-digit code (1–4).', true);
        return;
      }
      if (code === expected) {
        showFeedback('room1Feedback', 'Drawer opens. You find a transparent arrow card. You can leave the office.', false);
        setTimeout(function () {
          showRoom(2);
          initRoom2();
        }, 1800);
      } else {
        wrongAttempt(1);
        showFeedback('room1Feedback', 'Wrong combination. Try again.', true);
      }
    });
  })();

  // --- Room 2: Floor plan → code 7
  function initRoom2() {
    const container = document.getElementById('floorPlanPuzzle');
    container.innerHTML = '';
    const labels = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
    labels.forEach(function (l) {
      const tile = document.createElement('div');
      tile.className = 'tile';
      tile.textContent = l;
      container.appendChild(tile);
    });

    const submit = document.getElementById('room2Submit');
    const codeInput = document.getElementById('room2Code');
    const expected = '7';

    submit.addEventListener('click', function () {
      const code = (codeInput.value || '').trim();
      if (code === expected) {
        showFeedback('room2Feedback', 'Correct. You head to the next area.', false);
        setTimeout(function () {
          showRoom(3);
          initRoom3();
        }, 1500);
      } else {
        wrongAttempt(2);
        showFeedback('room2Feedback', 'Wrong room code.', true);
      }
    });
  }

  // --- Room 3: Sequence then address
  function initRoom3() {
    const sequenceDisplay = document.getElementById('sequenceDisplay');
    const sequenceInputWrap = document.getElementById('sequenceInputWrap');
    const sequenceInput = document.getElementById('sequenceInput');
    const startBtn = document.getElementById('startSequence');
    const sequenceSubmit = document.getElementById('sequenceSubmit');
    const addressPhase = document.getElementById('addressPhase');
    const addressInput = document.getElementById('addressInput');
    const addressSubmit = document.getElementById('addressSubmit');

    sequenceInputWrap.classList.add('hidden');
    addressPhase.classList.add('hidden');
    document.getElementById('sequencePhase').classList.remove('hidden');
    hideFeedback('room3Feedback');

    state.sequenceAnswer = [7, 2, 9].join('-');

    startBtn.addEventListener('click', function () {
      startBtn.classList.add('hidden');
      sequenceDisplay.textContent = '7 – 2 – 9';
      setTimeout(function () {
        sequenceDisplay.textContent = '?';
        sequenceInputWrap.classList.remove('hidden');
        sequenceInput.value = '';
        sequenceInput.focus();
      }, 3000);
    });

    sequenceSubmit.addEventListener('click', function () {
      const ans = (sequenceInput.value || '').trim().replace(/\s/g, '');
      const normalized = state.sequenceAnswer.replace(/\s/g, '');
      if (ans === normalized || ans === '729') {
        showFeedback('room3Feedback', 'Correct. Staff asks: "Do you remember where you lived?" Search the room for your address.', false);
        sequenceInputWrap.classList.add('hidden');
        document.getElementById('sequencePhase').classList.add('hidden');
        addressPhase.classList.remove('hidden');
      } else {
        wrongAttempt(3);
        showFeedback('room3Feedback', 'Wrong sequence. Try again.', true);
      }
    });

    addressSubmit.addEventListener('click', function () {
      const ans = (addressInput.value || '').trim();
      if (ans.toLowerCase().replace(/\s/g, '') === state.addressAnswer.toLowerCase().replace(/\s/g, '')) {
        showFeedback('room3Feedback', 'Staff nods. You may enter the bedroom.', false);
        setTimeout(function () {
          showRoom(4);
        }, 1500);
      } else {
        wrongAttempt(3);
        showFeedback('room3Feedback', 'That\'s not the address on your license.', true);
      }
    });
  }

  // --- Room 4: Misplaced items
  (function () {
    document.getElementById('room4Submit').addEventListener('click', function () {
      const checks = document.querySelectorAll('input[name="misplaced"]:checked');
      if (checks.length === 4) {
        showFeedback('room4Feedback', 'Drawer opens. You find a box with photos and a note about the hippocampus. You can proceed.', false);
        setTimeout(function () {
          showRoom(5);
          initRoom5();
        }, 1800);
      } else {
        wrongAttempt(4);
        showFeedback('room4Feedback', 'Select all four misplaced items.', true);
      }
    });
  })();

  // --- Room 5: Episodic vs Procedural
  const SORT_ITEMS = [
    { id: 'piano-flowers', text: 'Piano and flowers, yesterday afternoon', type: 'episodic' },
    { id: 'playing-piano', text: 'Playing piano in the bedroom (don\'t remember with who or which music)', type: 'procedural' }
  ];

  function initRoom5() {
    const episodicDrop = document.getElementById('episodicDrop');
    const proceduralDrop = document.getElementById('proceduralDrop');
    const sortCards = document.getElementById('sortCards');
    const submit = document.getElementById('room5Submit');

    episodicDrop.innerHTML = '';
    proceduralDrop.innerHTML = '';
    sortCards.innerHTML = '';
    submit.classList.add('hidden');
    hideFeedback('room5Feedback');

    const assignments = {};

    SORT_ITEMS.forEach(function (item) {
      const card = document.createElement('div');
      card.className = 'sort-card';
      card.textContent = item.text;
      card.dataset.id = item.id;
      card.dataset.type = item.type;
      sortCards.appendChild(card);

      card.addEventListener('click', function () {
        if (card.parentElement === sortCards) {
          assignments[item.id] = 'episodic';
          episodicDrop.appendChild(card);
          card.classList.add('in-episodic');
        } else if (card.parentElement === episodicDrop) {
          delete assignments[item.id];
          sortCards.appendChild(card);
          card.classList.remove('in-episodic', 'in-procedural');
        } else if (card.parentElement === proceduralDrop) {
          delete assignments[item.id];
          sortCards.appendChild(card);
          card.classList.remove('in-episodic', 'in-procedural');
        }
        if (Object.keys(assignments).length === 2) submit.classList.remove('hidden');
      });
    });

    submit.addEventListener('click', function () {
      const correct = assignments['piano-flowers'] === 'episodic' && assignments['playing-piano'] === 'procedural';
      if (!episodicDrop.querySelector('[data-id="piano-flowers"]') || !proceduralDrop.querySelector('[data-id="playing-piano"]')) {
        wrongAttempt(5);
        showFeedback('room5Feedback', 'Sort both items into the correct category.', true);
        return;
      }
      if (correct) {
        showFeedback('room5Feedback', 'Correct. Timeline clue: you\'re taken to the physiotherapy space.', false);
        setTimeout(function () {
          showRoom(6);
          initRoom6();
        }, 1800);
      } else {
        wrongAttempt(5);
        showFeedback('room5Feedback', 'Check which is episodic (specific event) vs procedural (skill).', true);
      }
    });
  }

  // --- Room 6: Timeline
  const TIMELINE_EVENTS = [
    'Waking up',
    'Getting dressed',
    'Eating breakfast',
    'Driving to work',
    'Working at work',
    'Eating lunch',
    'Driving home',
    'Eating dinner',
    'Getting ready for bed'
  ];

  function initRoom6() {
    const slots = document.getElementById('timelineSlots');
    const pool = document.getElementById('timelinePool');
    slots.innerHTML = '';
    pool.innerHTML = '';
    hideFeedback('room6Feedback');

    const order = [];
    for (let i = 0; i < 9; i++) {
      const slot = document.createElement('div');
      slot.className = 'timeline-slot';
      slot.dataset.index = i;
      slot.textContent = (i + 1) + '. ';
      slots.appendChild(slot);
    }

    const shuffled = TIMELINE_EVENTS.slice().sort(function () { return Math.random() - 0.5; });
    shuffled.forEach(function (ev) {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'timeline-chip';
      chip.textContent = ev;
      pool.appendChild(chip);
      chip.addEventListener('click', function () {
        if (chip.classList.contains('used')) return;
        const firstEmpty = Array.from(slots.querySelectorAll('.timeline-slot')).find(function (s) {
          return !s.querySelector('.timeline-chip');
        });
        if (firstEmpty) {
          chip.classList.add('used');
          firstEmpty.appendChild(chip);
          order[parseInt(firstEmpty.dataset.index, 10)] = ev;
        }
      });
    });

    document.getElementById('room6Submit').addEventListener('click', function () {
      const correct = order.join(',') === TIMELINE_EVENTS.join(',');
      if (order.some(function (x) { return !x; })) {
        wrongAttempt(6);
        showFeedback('room6Feedback', 'Fill all slots first.', true);
        return;
      }
      if (correct) {
        showFeedback('room6Feedback', 'Correct order. A hidden compartment is revealed.', false);
        setTimeout(function () {
          showRoom(7);
          initRoom7();
        }, 1800);
      } else {
        wrongAttempt(6);
        showFeedback('room6Feedback', 'Wrong order. Correct: Waking up → ... → Getting ready for bed.', true);
      }
    });
  }

  // --- Room 7: Match cues
  const MATCH_PAIRS = [
    ['Music', 'Record player'],
    ['Pen', 'Journal'],
    ['Picture', 'Book'],
    ['Flower / Perfume', 'Odor']
  ];

  function initRoom7() {
    const game = document.getElementById('matchGame');
    game.innerHTML = '';
    hideFeedback('room7Feedback');

    const left = MATCH_PAIRS.map(function (p) { return p[0]; }).sort(function () { return Math.random() - 0.5; });
    const right = MATCH_PAIRS.map(function (p) { return p[1]; }).sort(function () { return Math.random() - 0.5; });

    const leftDiv = document.createElement('div');
    left.forEach(function (text) {
      const el = document.createElement('div');
      el.className = 'match-item';
      el.textContent = text;
      el.dataset.left = text;
      leftDiv.appendChild(el);
    });
    game.appendChild(leftDiv);
    game.appendChild(document.createElement('div'));
    const rightDiv = document.createElement('div');
    right.forEach(function (text) {
      const el = document.createElement('div');
      el.className = 'match-item';
      el.textContent = text;
      el.dataset.right = text;
      rightDiv.appendChild(el);
    });
    game.appendChild(rightDiv);

    let selectedLeft = null;
    let selectedRight = null;
    let matched = 0;

    const pairMap = {};
    MATCH_PAIRS.forEach(function (p) { pairMap[p[0]] = p[1]; });

    function clearSelection() {
      selectedLeft = null;
      selectedRight = null;
      game.querySelectorAll('.match-item').forEach(function (el) {
        el.classList.remove('selected');
      });
    }

    leftDiv.querySelectorAll('.match-item').forEach(function (el) {
      el.addEventListener('click', function () {
        if (el.classList.contains('matched')) return;
        clearSelection();
        el.classList.add('selected');
        selectedLeft = el.dataset.left;
      });
    });
    rightDiv.querySelectorAll('.match-item').forEach(function (el) {
      el.addEventListener('click', function () {
        if (el.classList.contains('matched')) return;
        if (!selectedLeft) return;
        selectedRight = el.dataset.right;
        if (pairMap[selectedLeft] === selectedRight) {
          game.querySelectorAll('.match-item').forEach(function (e) {
            if (e.dataset.left === selectedLeft || e.dataset.right === selectedRight) {
              e.classList.add('matched');
            }
          });
          matched++;
          if (matched === 4) {
            document.getElementById('room7Submit').classList.remove('hidden');
          }
        }
        clearSelection();
      });
    });

    document.getElementById('room7Submit').addEventListener('click', function () {
      showFeedback('room7Feedback', 'Compartment open. You find a note about object–location pairings.', false);
      setTimeout(function () {
        showRoom(8);
        initRoom8();
      }, 1500);
    });
  }

  // --- Room 8: Key location (new pairing = Inside drawer)
  function initRoom8() {
    const container = document.getElementById('room8Locations');
    container.innerHTML = '';
    const locations = ['Under red book', 'In bedside drawer', 'On blue tray', 'Inside drawer', 'Inside cabinet', 'Inside notebook'];
    const correct = 'Inside drawer';

    locations.forEach(function (loc) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'location-btn';
      btn.textContent = loc;
      container.appendChild(btn);
      btn.addEventListener('click', function () {
        if (loc === correct) {
          showFeedback('room8Feedback', 'Correct. Code digit: 5. You find the key and a note on proactive interference.', false);
          setTimeout(function () {
            showRoom(9);
            initRoom9();
          }, 1800);
        } else {
          wrongAttempt(8);
          showFeedback('room8Feedback', 'Wrong location. Use the new pairings, not the old ones.', true);
        }
      });
    });
    hideFeedback('room8Feedback');
  }

  // --- Room 9: Memory fragments (Morning/Afternoon/Evening/Night)
  function initRoom9() {
    const board = document.getElementById('fragmentsBoard');
    board.innerHTML = '';
    const periods = ['Morning', 'Afternoon', 'Evening', 'Night'];
    const correct = {
      Morning: ['Bus stop'],
      Afternoon: ['Cafe', 'Library'],
      Evening: ['Bedroom desk'],
      Night: ['Notebook']
    };

    const assigned = { Morning: [], Afternoon: [], Evening: [], Night: [] };
    const poolChips = ['Bus stop', 'Cafe', 'Library', 'Bedroom desk', 'Notebook'];
    let selectedChip = null;

    periods.forEach(function (p) {
      const slot = document.createElement('div');
      slot.className = 'fragment-slot';
      slot.innerHTML = '<h4>' + p + '</h4>';
      slot.dataset.period = p;
      board.appendChild(slot);
      slot.addEventListener('click', function (e) {
        if (e.target.classList.contains('fragment-chip') && e.target.parentElement === slot) {
          const text = e.target.textContent;
          e.target.remove();
          assigned[p] = assigned[p].filter(function (x) { return x !== text; });
          const back = document.createElement('span');
          back.className = 'fragment-chip';
          back.textContent = text;
          back.dataset.text = text;
          poolDiv.appendChild(back);
          back.addEventListener('click', selectChip);
        } else if (selectedChip && slot.dataset.period) {
          const max = slot.dataset.period === 'Afternoon' ? 2 : 1;
          if (assigned[slot.dataset.period].length < max) {
            const text = selectedChip.textContent;
            assigned[slot.dataset.period].push(text);
            selectedChip.remove();
            const c = document.createElement('span');
            c.className = 'fragment-chip';
            c.textContent = text;
            slot.appendChild(c);
            selectedChip = null;
            board.querySelectorAll('.fragment-chip.selected').forEach(function (el) { el.classList.remove('selected'); });
          }
        }
      });
    });

    function selectChip() {
      if (this.parentElement !== poolDiv) return;
      board.querySelectorAll('.fragment-chip.selected').forEach(function (el) { el.classList.remove('selected'); });
      this.classList.add('selected');
      selectedChip = this;
    }

    const poolDiv = document.createElement('div');
    poolDiv.className = 'fragment-slot';
    poolDiv.innerHTML = '<h4>Click a fragment, then click a time period</h4>';
    const game = board;
    poolChips.forEach(function (text) {
      const chip = document.createElement('span');
      chip.className = 'fragment-chip';
      chip.textContent = text;
      chip.dataset.text = text;
      poolDiv.appendChild(chip);
      chip.addEventListener('click', selectChip);
    });
    board.appendChild(poolDiv);

    document.getElementById('room9Submit').addEventListener('click', function () {
      const ok = periods.every(function (p) {
        const a = assigned[p].slice().sort();
        const c = (correct[p] || []).slice().sort();
        return a.length === c.length && a.every(function (x, i) { return x === c[i]; });
      });
      if (ok) {
        showFeedback('room9Feedback', 'Correct. The exit door clicks open — one final lock remains.', false);
        setTimeout(function () {
          showRoom(10);
          initRoom10();
        }, 1800);
      } else {
        wrongAttempt(9);
        showFeedback('room9Feedback', 'Arrange the fragments into one coherent day (Morning: bus stop, etc.).', true);
      }
    });
    hideFeedback('room9Feedback');
  }

  // --- Room 10: Pattern separation
  const PATTERNS = [
    ['★', '◆', '●', '▲'],
    ['◆', '●', '▲', '★'],
    ['●', '▲', '★', '◆'],
    ['▲', '★', '◆', '●']
  ];

  function initRoom10() {
    const game = document.getElementById('patternGame');
    game.innerHTML = '';
    state.patternCorrectIndex = Math.floor(Math.random() * 4);
    const target = PATTERNS[state.patternCorrectIndex];

    const shown = document.createElement('p');
    shown.textContent = 'Remember this configuration: ' + target.join(' — ');
    shown.style.marginBottom = '1rem';
    game.appendChild(shown);

    setTimeout(function () {
      shown.textContent = 'Which configuration did you see? Select the correct one.';
      const options = document.createElement('div');
      options.className = 'pattern-options';
      PATTERNS.forEach(function (p, i) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'pattern-option';
        btn.textContent = p.join(' — ');
        btn.dataset.index = i;
        options.appendChild(btn);
        btn.addEventListener('click', function () {
          if (parseInt(btn.dataset.index, 10) === state.patternCorrectIndex) {
            btn.classList.add('correct');
            showFeedback('room10Feedback', 'The final lock opens. You are free.', false);
            setTimeout(function () {
              showRoom('Win');
            }, 2000);
          } else {
            wrongAttempt(10);
            showFeedback('room10Feedback', 'Wrong configuration. Try again.', true);
          }
        });
      });
      game.appendChild(options);
    }, 4000);

    hideFeedback('room10Feedback');
  }

  // Start
  showRoom(1);
})();
