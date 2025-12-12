(() => {
  const COLOR_PALETTE = [
    "#1d4ed8",
    "#7c3aed",
    "#db2777",
    "#f97316",
    "#0ea5e9",
    "#eab308",
    "#10b981",
    "#ec4899"
  ];
  const EDIT_MARKER_REGEX = /\s*<This message was edited>\s*$/i;
  const FALLBACK_MESSAGES_RAW = [
    {
      sender: "You",
      text: "Hey, I finally exported the WhatsApp chat.",
      time: "09:12",
      date: "01/01/2020"
    },
    {
      sender: "Them",
      text: "No way 😂 how far back does it go?",
      time: "09:13",
      date: "01/01/2020"
    },
    {
      sender: "You",
      text: "All the way to the very first awkward message.",
      time: "09:13",
      date: "01/01/2020"
    },
    {
      sender: "Them",
      text: "We definitely don't talk about those.",
      time: "09:14",
      date: "01/01/2020"
    }
  ];
  const KEY_STORAGE_KEY = "chatReplayKey";
  const MEDIA_PLACEHOLDERS = new Set([
    "image omitted",
    "gif omitted",
    "sticker omitted",
    "video omitted",
    "audio omitted",
    "voice message omitted",
    "document omitted",
    "contact card omitted",
    "<media omitted>",
    "media omitted"
  ]);
  const SYSTEM_MESSAGE_SENDERS = new Set(["sex"]);
  const STOP_WORDS = new Set([
    "a",
    "an",
    "and",
    "are",
    "as",
    "at",
    "be",
    "been",
    "being",
    "but",
    "by",
    "can",
    "can't",
    "cannot",
    "could",
    "did",
    "do",
    "does",
    "doing",
    "don't",
    "for",
    "from",
    "had",
    "has",
    "have",
    "having",
    "he",
    "her",
    "here",
    "hers",
    "herself",
    "him",
    "himself",
    "his",
    "how",
    "i",
    "i'd",
    "i'll",
    "i'm",
    "i've",
    "if",
    "in",
    "into",
    "is",
    "it",
    "it's",
    "its",
    "me",
    "more",
    "most",
    "my",
    "myself",
    "no",
    "nor",
    "not",
    "of",
    "off",
    "on",
    "once",
    "only",
    "or",
    "other",
    "our",
    "ours",
    "ourselves",
    "out",
    "over",
    "own",
    "she",
    "she's",
    "should",
    "so",
    "some",
    "such",
    "than",
    "that",
    "that's",
    "the",
    "their",
    "theirs",
    "them",
    "themselves",
    "then",
    "there",
    "these",
    "they",
    "they're",
    "this",
    "those",
    "through",
    "to",
    "too",
    "under",
    "until",
    "up",
    "very",
    "was",
    "we",
    "we're",
    "were",
    "what",
    "when",
    "where",
    "which",
    "while",
    "who",
    "whom",
    "why",
    "will",
    "with",
    "you",
    "you'd",
    "you'll",
    "you're",
    "you've",
    "your",
    "yours",
    "yourself",
    "yourselves"
  ]);
  const COMMON_DICTIONARY_WORDS = new Set([
    "about",
    "above",
    "across",
    "act",
    "after",
    "again",
    "against",
    "age",
    "ago",
    "air",
    "all",
    "almost",
    "along",
    "already",
    "also",
    "always",
    "am",
    "among",
    "another",
    "any",
    "anyone",
    "anything",
    "around",
    "ask",
    "away",
    "back",
    "because",
    "become",
    "before",
    "begin",
    "behind",
    "believe",
    "best",
    "better",
    "between",
    "big",
    "both",
    "call",
    "came",
    "change",
    "child",
    "children",
    "city",
    "come",
    "company",
    "country",
    "course",
    "day",
    "different",
    "during",
    "early",
    "earth",
    "each",
    "end",
    "enough",
    "even",
    "ever",
    "every",
    "everyone",
    "everything",
    "fact",
    "family",
    "far",
    "feel",
    "few",
    "find",
    "first",
    "food",
    "form",
    "friend",
    "friends",
    "game",
    "give",
    "good",
    "great",
    "group",
    "hand",
    "hard",
    "head",
    "hear",
    "help",
    "high",
    "history",
    "home",
    "house",
    "important",
    "keep",
    "kind",
    "know",
    "large",
    "last",
    "late",
    "learn",
    "leave",
    "left",
    "less",
    "life",
    "light",
    "like",
    "line",
    "little",
    "long",
    "look",
    "lot",
    "love",
    "made",
    "make",
    "man",
    "many",
    "maybe",
    "mean",
    "might",
    "money",
    "month",
    "more",
    "morning",
    "most",
    "mother",
    "move",
    "much",
    "music",
    "must",
    "name",
    "need",
    "never",
    "new",
    "next",
    "night",
    "nothing",
    "number",
    "often",
    "old",
    "once",
    "open",
    "other",
    "others",
    "outside",
    "paper",
    "part",
    "people",
    "place",
    "plan",
    "play",
    "point",
    "power",
    "present",
    "problem",
    "public",
    "question",
    "quite",
    "rather",
    "real",
    "reason",
    "right",
    "room",
    "run",
    "same",
    "school",
    "second",
    "see",
    "seem",
    "sense",
    "service",
    "set",
    "she",
    "show",
    "side",
    "small",
    "something",
    "sometimes",
    "start",
    "state",
    "story",
    "study",
    "such",
    "sure",
    "system",
    "take",
    "talk",
    "tell",
    "than",
    "thing",
    "think",
    "thought",
    "through",
    "time",
    "today",
    "together",
    "told",
    "too",
    "try",
    "turn",
    "use",
    "used",
    "very",
    "want",
    "water",
    "way",
    "week",
    "while",
    "white",
    "whole",
    "why",
    "word",
    "work",
    "world",
    "year",
    "yes",
    "yet"
  ]);
  const WORD_EXTRACT_REGEX = /[a-zA-Z]+(?:'[a-z]+)?/g;
  STOP_WORDS.forEach((word) => COMMON_DICTIONARY_WORDS.add(word));
  let dictionaryLoaded = false;
  let dictionaryLoadPromise = null;
  const DICTIONARY_CANDIDATES = ["dictionary.txt", "dictionary_en.txt"];

  function addWordToDictionary(word) {
    const clean = word.trim().toLowerCase();
    if (clean) {
      COMMON_DICTIONARY_WORDS.add(clean);
    }
  }

  async function ensureDictionaryLoaded() {
    if (dictionaryLoaded) return;
    if (!dictionaryLoadPromise) {
      dictionaryLoadPromise = (async () => {
        for (const url of DICTIONARY_CANDIDATES) {
          try {
            const resp = await fetch(url, { cache: "no-store" });
            if (!resp.ok) continue;
            const text = await resp.text();
            text
              .split(/\r?\n/)
              .map((line) => line.trim().toLowerCase())
              .filter(Boolean)
              .forEach(addWordToDictionary);
            break;
          } catch (_) {
            // ignore fetch errors
          }
        }
        dictionaryLoaded = true;
      })();
    }
    return dictionaryLoadPromise;
  }

  let MY_NAME = "Dragos";
  let SYSTEM_YOU_NAME = "Dragos";

  let DEFAULT_DATE = null;

  function configure(options = {}) {
    if (options.myName) {
      MY_NAME = options.myName;
    }
    if (options.defaultDate) {
      DEFAULT_DATE = options.defaultDate;
    }
    if (options.systemYouName) {
      SYSTEM_YOU_NAME = options.systemYouName;
    }
  }

  function createRendererState() {
    return {
      senderColors: {},
      colorPointer: 0
    };
  }

  function normalizeEditedContent(rawText) {
    if (!rawText) {
      return { text: "", edited: false };
    }
    const edited = EDIT_MARKER_REGEX.test(rawText);
    const text = edited ? rawText.replace(EDIT_MARKER_REGEX, "").trimEnd() : rawText;
    return { text, edited };
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function isFormattingBoundary(char) {
    if (!char) return true;
    return /\s/.test(char) || /[.,!?;:()\[\]{}"'“”‘’/\\-]/.test(char);
  }

  function applyMarkerFormatting(str, marker, tag) {
    const escapedMarker = escapeRegExp(marker);
    const pattern = new RegExp(`${escapedMarker}([\\s\\S]+?)${escapedMarker}`, "g");
    return str.replace(pattern, (match, content, offset, full) => {
      if (!content.trim()) return match;
      if (/^\s/.test(content) || /\s$/.test(content)) return match;
      const before = full[offset - 1];
      const after = full[offset + match.length];
      if (!isFormattingBoundary(before) || !isFormattingBoundary(after)) {
        return match;
      }
      return `<${tag}>${content}</${tag}>`;
    });
  }

  function applyWhatsAppFormatting(str) {
    let formatted = str;
    formatted = applyMarkerFormatting(formatted, "*", "strong");
    formatted = applyMarkerFormatting(formatted, "_", "em");
    formatted = applyMarkerFormatting(formatted, "~", "del");
    return formatted;
  }

  function highlightMentions(str) {
    return str.replace(/(@[^\s<]+)/g, '<span class="mention">$1</span>');
  }

  function isMediaPlaceholderText(text) {
    if (!text) return false;
    const normalized = text.trim().toLowerCase();
    return MEDIA_PLACEHOLDERS.has(normalized);
  }

  function extractMeaningfulWords(text) {
    if (!text || isMediaPlaceholderText(text)) return [];
    const matches = text.toLowerCase().match(WORD_EXTRACT_REGEX);
    if (!matches) return [];
    return matches
      .map((word) => word.replace(/^'+|'+$/g, ""))
      .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
  }

  function formatMessageText(text) {
    if (!text) return "";
    const trimmed = text.trim().toLowerCase();
    if (trimmed === "image omitted") return "🖼️";
    if (trimmed === "gif omitted") return "🎞️";
    if (trimmed === "sticker omitted") return "🏷️";
    if (trimmed === "document omitted") return "📄";
    let escaped = escapeHtml(text);
    escaped = applyWhatsAppFormatting(escaped);
    escaped = escaped.replace(/\n/g, "<br>");
    return highlightMentions(escaped);
  }

  function replaceSystemPronouns(text) {
    if (!text) return text;
    return text.replace(/\byou\b/gi, SYSTEM_YOU_NAME);
  }

  function personalizeDeletionNotice(text, senderName) {
    if (!text) return text;
    const trimmed = text.trim();
    if (/^you deleted this message\.?$/i.test(trimmed)) {
      const suffix = trimmed.endsWith(".") ? "." : "";
      const name = senderName || "Someone";
      return `${name} deleted this message${suffix}`;
    }
    return text;
  }

  function prepareMessage(msg) {
    const senderName = msg.sender || "";
    const normalizedSender = senderName.trim().toLowerCase();
    const isSystemAdmin = SYSTEM_MESSAGE_SENDERS.has(normalizedSender);
    const { text, edited } = normalizeEditedContent(msg.text || "");
    let processedText = text;
    if (isSystemAdmin) {
      processedText = replaceSystemPronouns(processedText);
    }
    processedText = personalizeDeletionNotice(processedText, senderName);
    return {
      sender: senderName,
      fromMe: !isSystemAdmin && senderName === MY_NAME,
      isSystemAdmin,
      text: processedText,
      time: msg.time || "",
      date: msg.date || "",
      edited
    };
  }

  function prepareMessages(messages) {
    return messages.map((msg) => prepareMessage(msg));
  }

  function getFallbackMessages() {
    return prepareMessages(FALLBACK_MESSAGES_RAW);
  }

  function getSenderBubbleColor(state, sender, fromMe) {
    if (fromMe) return null;
    if (!state.senderColors[sender]) {
      state.senderColors[sender] = COLOR_PALETTE[state.colorPointer % COLOR_PALETTE.length];
      state.colorPointer++;
    }
    return state.senderColors[sender];
  }

  function appendMessage(chatEl, msg, rendererState, options = {}) {
    const roleClass = msg.isSystemAdmin ? "system" : msg.fromMe ? "me" : "them";
    const row = document.createElement("div");
    row.className = `bubble-row ${roleClass}`;

    const bubble = document.createElement("div");
    bubble.className = `bubble ${roleClass}`;
    if (!msg.isSystemAdmin) {
      const color = getSenderBubbleColor(rendererState, msg.sender, msg.fromMe);
      if (color) {
        bubble.style.background = color;
        bubble.style.color = "#f8fafc";
        bubble.style.boxShadow = "0 4px 10px rgba(15, 23, 42, 0.45)";
      }
    }

    const sender = document.createElement("div");
    sender.className = "sender";
    if (msg.isSystemAdmin) {
      const badge = document.createElement("span");
      badge.className = "system-badge";
      badge.textContent = "System notice";
      sender.appendChild(badge);
      if (msg.sender) {
        const origin = document.createElement("span");
        origin.className = "system-origin";
        origin.textContent = msg.sender;
        sender.appendChild(origin);
      }
    } else {
      sender.textContent = msg.sender;
    }

    const text = document.createElement("div");
    const formatted = formatMessageText(msg.text);
    if (formatted === "🖼️" || formatted === "🎞️" || formatted === "🏷️" || formatted === "📄") {
      text.textContent = formatted;
      text.style.fontSize = formatted === "🖼️" ? "20px" : "18px";
    } else {
      text.innerHTML = formatted;
    }

    const time = document.createElement("div");
    time.className = "time";
    if (msg.time) time.textContent = msg.time;
    if (msg.edited) {
      const editedTag = document.createElement("span");
      editedTag.className = "edited-tag";
      editedTag.textContent = "edited";
      time.appendChild(editedTag);
    }

    bubble.appendChild(sender);
    bubble.appendChild(text);
    bubble.appendChild(time);

    row.appendChild(bubble);
    chatEl.appendChild(row);

    if (options.scroll !== false) {
      chatEl.scrollTo({
        top: chatEl.scrollHeight,
        behavior: "smooth"
      });
    }
  }

  function showStatusMessage(chatEl, message) {
    if (!chatEl) return;
    chatEl.innerHTML = "";
    const status = document.createElement("div");
    status.className = "status-message";
    status.textContent = message;
    chatEl.appendChild(status);
  }

  function base64ToBytes(b64) {
    const binary = atob(b64);
    const out = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      out[i] = binary.charCodeAt(i);
    }
    return out;
  }

  function base32ToBytes(str) {
    if (!str) throw new Error("Missing Base32 key");
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    const clean = str.replace(/=+$/g, "").toUpperCase();
    let buffer = 0;
    let bitsLeft = 0;
    const out = [];

    for (const ch of clean) {
      const val = alphabet.indexOf(ch);
      if (val === -1) throw new Error("Invalid Base32 character");
      buffer = (buffer << 5) | val;
      bitsLeft += 5;
      if (bitsLeft >= 8) {
        bitsLeft -= 8;
        out.push((buffer >> bitsLeft) & 0xff);
      }
    }

    return new Uint8Array(out);
  }

  function parseMessageTimestamp(msg) {
    if (!msg || !msg.date) return null;
    const [dayStr, monthStr, yearStr] = msg.date.split("/");
    const day = Number.parseInt(dayStr, 10);
    const month = Number.parseInt(monthStr, 10);
    const year = Number.parseInt(yearStr, 10);
    if (!day || !month || !year) return null;
    let hours = 0;
    let minutes = 0;
    if (msg.time) {
      const [hourStr, minuteStr] = msg.time.split(":");
      hours = Number.parseInt(hourStr, 10);
      minutes = Number.parseInt(minuteStr, 10);
      if (Number.isNaN(hours)) hours = 0;
      if (Number.isNaN(minutes)) minutes = 0;
    }
    const date = new Date(year, month - 1, day, hours, minutes);
    const timestamp = date.getTime();
    return Number.isNaN(timestamp) ? null : timestamp;
  }

  function formatDuration(ms) {
    if (!ms || ms < 0) return "—";
    const totalMinutes = Math.floor(ms / 60000);
    if (totalMinutes < 1) return "<1m";
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;
    const parts = [];
    if (days) parts.push(`${days}d`);
    if (hours && parts.length < 2) parts.push(`${hours}h`);
    if (minutes && parts.length < 2) parts.push(`${minutes}m`);
    return parts.join(" ");
  }

  function createEmptyStatsState() {
    return {
      people: new Map(),
      wordCounts: new Map(),
      unusualWordCounts: new Map()
    };
  }

  function getPersonStatsEntry(state, sender) {
    const key = sender || "Unknown";
    if (!state.people.has(key)) {
      state.people.set(key, {
        messages: 0,
        media: 0,
        longestQuietMs: 0,
        lastTimestamp: null
      });
    }
    return state.people.get(key);
  }

  function updateStatsState(state, msg) {
    if (!msg) return;
    const person = getPersonStatsEntry(state, msg.sender);
    person.messages += 1;

    const normalized = (msg.text || "").trim().toLowerCase();
    if (MEDIA_PLACEHOLDERS.has(normalized)) {
      person.media += 1;
    }

    const timestamp = parseMessageTimestamp(msg);
    if (timestamp && person.lastTimestamp) {
      const gap = timestamp - person.lastTimestamp;
      if (gap > person.longestQuietMs) {
        person.longestQuietMs = gap;
      }
    }
    if (timestamp) {
      person.lastTimestamp = timestamp;
    }

    if (!MEDIA_PLACEHOLDERS.has(normalized)) {
      const words = extractMeaningfulWords(msg.text || "");
      for (const word of words) {
        const count = (state.wordCounts.get(word) || 0) + 1;
        state.wordCounts.set(word, count);
        if (!COMMON_DICTIONARY_WORDS.has(word)) {
          const unusualCount = (state.unusualWordCounts.get(word) || 0) + 1;
          state.unusualWordCounts.set(word, unusualCount);
        }
      }
    }
  }

  function createPlaceholderElement(text) {
    const placeholder = document.createElement("div");
    placeholder.className = "stat-placeholder";
    placeholder.textContent = text;
    return placeholder;
  }

  function renderPeopleMetric(container, entries, options = {}) {
    if (!container) return;
    container.innerHTML = "";
    if (!entries.length) {
      container.appendChild(createPlaceholderElement(options.emptyText || "Waiting for playback…"));
      return;
    }
    const limit = options.limit || 4;
    const topEntries = entries.slice(0, limit);
    const maxValue = topEntries[0]?.value || 1;
    topEntries.forEach(({ name, value, data }) => {
      const row = document.createElement("div");
      row.className = "stat-row";
      const main = document.createElement("div");
      main.className = "stat-main";
      const label = document.createElement("div");
      label.className = "stat-label";
      label.textContent = name;
      const sub = document.createElement("div");
      sub.className = "stat-subtext";
      sub.textContent = options.subtext ? options.subtext(data, value) : `${value} total`;
      main.appendChild(label);
      main.appendChild(sub);
      const valueEl = document.createElement("div");
      valueEl.className = "stat-value";
      valueEl.textContent = options.valueFormatter ? options.valueFormatter(value) : value;
      row.appendChild(main);
      row.appendChild(valueEl);
      container.appendChild(row);
      const progress = document.createElement("div");
      progress.className = "stat-progress";
      const bar = document.createElement("span");
      const width = Math.max(8, (value / maxValue) * 100);
      bar.style.width = `${width}%`;
      progress.appendChild(bar);
      container.appendChild(progress);
    });
  }

  function renderWordList(container, entries, options = {}) {
    if (!container) return;
    container.innerHTML = "";
    if (!entries.length) {
      container.appendChild(createPlaceholderElement(options.emptyText || "Waiting for playback…"));
      return;
    }
    entries.forEach(([word, count]) => {
      const chip = document.createElement("div");
      chip.className = "word-chip";
      const wordSpan = document.createElement("span");
      wordSpan.textContent = word;
      const countSpan = document.createElement("span");
      countSpan.className = "word-count";
      countSpan.textContent = `×${count}`;
      chip.appendChild(wordSpan);
      chip.appendChild(countSpan);
      container.appendChild(chip);
    });
  }

  function renderQuietMetric(container, entries) {
    if (!container) return;
    container.innerHTML = "";
    if (!entries.length) {
      container.appendChild(createPlaceholderElement("Waiting for playback…"));
      return;
    }
    entries.forEach(({ name, value }) => {
      const row = document.createElement("div");
      row.className = "stat-row";
      const main = document.createElement("div");
      main.className = "stat-main";
      const label = document.createElement("div");
      label.className = "stat-label";
      label.textContent = name;
      const sub = document.createElement("div");
      sub.className = "stat-subtext";
      sub.textContent = "Longest quiet streak";
      main.appendChild(label);
      main.appendChild(sub);
      const valueEl = document.createElement("div");
      valueEl.className = "stat-value";
      valueEl.textContent = formatDuration(value);
      row.appendChild(main);
      row.appendChild(valueEl);
      container.appendChild(row);
    });
  }

  function createStatsManager(panelSelectorOrEl) {
    const panelEl =
      typeof panelSelectorOrEl === "string" ? document.querySelector(panelSelectorOrEl) : panelSelectorOrEl;
    if (!panelEl) return null;
    const dom = {
      messages: panelEl.querySelector('[data-stat="messages"]'),
      media: panelEl.querySelector('[data-stat="media"]'),
      quiet: panelEl.querySelector('[data-stat="quiet"]'),
      words: panelEl.querySelector('[data-stat="popular-words"]'),
      unusual: panelEl.querySelector('[data-stat="unusual-words"]')
    };
    const state = createEmptyStatsState();

    function resetStateOnly() {
      state.people = new Map();
      state.wordCounts = new Map();
      state.unusualWordCounts = new Map();
    }

    function render() {
      const peopleEntries = Array.from(state.people.entries());
      const messageEntries = peopleEntries
        .map(([name, data]) => ({ name, value: data.messages, data }))
        .filter((entry) => entry.value > 0)
        .sort((a, b) => b.value - a.value);
      const mediaEntries = peopleEntries
        .map(([name, data]) => ({ name, value: data.media, data }))
        .filter((entry) => entry.value > 0)
        .sort((a, b) => b.value - a.value);
      const quietEntries = peopleEntries
        .map(([name, data]) => ({ name, value: data.longestQuietMs }))
        .filter((entry) => entry.value > 0)
        .sort((a, b) => b.value - a.value)
        .slice(0, 4);

      renderPeopleMetric(dom.messages, messageEntries, {
        subtext: (data) => `${data.media} media shared`,
        limit: 4
      });
      renderPeopleMetric(dom.media, mediaEntries, {
        subtext: (data) => `${data.messages} msgs`,
        valueFormatter: (value) => `${value}`,
        limit: 4,
        emptyText: "No media yet"
      });
      renderQuietMetric(dom.quiet, quietEntries);

      const popularWords = Array.from(state.wordCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6);
      const unusualWords = Array.from(state.unusualWordCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6);
      renderWordList(dom.words, popularWords, { emptyText: "No words yet" });
      renderWordList(dom.unusual, unusualWords, { emptyText: "No words yet" });
    }

    function resetStats() {
      resetStateOnly();
      render();
    }

    return {
      reset: resetStats,
      recordMessage(msg, options = {}) {
        updateStatsState(state, msg);
        if (!options.silent) {
          render();
        }
      },
      applyRange(messages, count) {
        if (!messages || !messages.length || !count) {
          resetStats();
          return;
        }
        resetStateOnly();
        const limit = Math.min(count, messages.length);
        for (let i = 0; i < limit; i++) {
          updateStatsState(state, messages[i]);
        }
        render();
      }
    };
  }

  function initStatsToggle(buttonEl, frameEl) {
    if (!buttonEl || !frameEl) return;
    if (!frameEl.classList.contains("stats-collapsed")) {
      frameEl.classList.add("stats-collapsed");
    }
    const update = () => {
      const collapsed = frameEl.classList.contains("stats-collapsed");
      buttonEl.textContent = collapsed ? "Show stats" : "Hide stats";
      buttonEl.setAttribute("aria-expanded", String(!collapsed));
    };
    update();
    buttonEl.addEventListener("click", () => {
      frameEl.classList.toggle("stats-collapsed");
      update();
    });
  }

  function normalizeDateInput(value) {
    if (!value) return null;
    const trimmed = value.trim();
    if (/^(\d{2})\/(\d{2})\/(\d{4})$/.test(trimmed)) {
      return trimmed;
    }
    const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoMatch) {
      const [, year, month, day] = isoMatch;
      return `${day}/${month}/${year}`;
    }
    return null;
  }

  function applyDateFilter(messages, normalizedDate) {
    if (!normalizedDate) {
      return messages;
    }
    const startIndex = messages.findIndex((msg) => msg.date === normalizedDate);
    if (startIndex === -1) {
      console.warn(`No messages found for date ${normalizedDate}`);
      return messages;
    }
    return messages.slice(startIndex);
  }

  function normalizedToISO(dateStr) {
    if (!dateStr) return "";
    const [day, month, year] = dateStr.split("/");
    if (!day || !month || !year) return "";
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  function populateDatePicker(dateInputEl, messages, selectedDate) {
    if (!dateInputEl) return;
    const dates = Array.from(
      new Set(
        messages
          .map((msg) => msg.date)
          .filter(Boolean)
      )
    );
    dates.sort((a, b) => {
      const [dayA, monthA, yearA] = a.split("/").map(Number);
      const [dayB, monthB, yearB] = b.split("/").map(Number);
      return new Date(yearA, monthA - 1, dayA) - new Date(yearB, monthB - 1, dayB);
    });

    if (dates.length) {
      const min = normalizedToISO(dates[0]);
      const max = normalizedToISO(dates[dates.length - 1]);
      dateInputEl.min = min;
      dateInputEl.max = max;
    }

    dateInputEl.value = selectedDate ? normalizedToISO(selectedDate) : "";
  }

  function shouldDelayDatePickerNavigation() {
    if (typeof window === "undefined") return false;
    try {
      if (window.matchMedia("(pointer: coarse)").matches) {
        return true;
      }
    } catch (_) {
      // ignore matchMedia issues
    }
    const ua = navigator.userAgent || "";
    return /iPad|iPhone|iPod|Android/i.test(ua);
  }

  async function gunzip(buffer) {
    if ("DecompressionStream" in window) {
      const ds = new DecompressionStream("gzip");
      const decompressedStream = new Blob([buffer]).stream().pipeThrough(ds);
      const decompressedBuffer = await new Response(decompressedStream).arrayBuffer();
      return decompressedBuffer;
    }
    console.warn("DecompressionStream unavailable; assuming plaintext payload");
    return buffer;
  }

  function startReplay({ chatSelector, dateInputSelector, controls = {} }) {
    const chatEl = document.querySelector(chatSelector);
    const dateInputEl = document.querySelector(dateInputSelector);
    if (!chatEl) return;

    const playPauseBtn = controls.playPause ? document.querySelector(controls.playPause) : null;
    const rewindBtn = controls.rewind ? document.querySelector(controls.rewind) : null;
    const fastForwardBtn = controls.fastForward ? document.querySelector(controls.fastForward) : null;
    const statsPanelEl = document.querySelector("#statsPanel");
    const statsToggleBtn = document.querySelector("#statsToggleBtn");
    const phoneFrameEl = chatEl.closest(".phone-frame");
    const statsManager = createStatsManager(statsPanelEl);
    if (statsManager) {
      statsManager.reset();
    }

    let rendererState = createRendererState();
    let playbackMessages = [];
    let allMessages = [];
    let index = 0;
    let paused = false;
    let fastForward = false;
    let playbackTimer = null;

    const initialUrl = new URL(window.location.href);
    const initialSearchParams = new URLSearchParams(initialUrl.search);
    const initialHashString = initialUrl.hash.startsWith("#") ? initialUrl.hash.slice(1) : "";
    const initialHashParams = new URLSearchParams(initialHashString);
    const keyFromUrl = initialSearchParams.get("K") || initialHashParams.get("K") || "";
    const meFromUrl = initialSearchParams.get("me") || initialHashParams.get("me");
    if (meFromUrl) {
      MY_NAME = meFromUrl;
    }
    let storedKey = "";
    try {
      storedKey = sessionStorage.getItem(KEY_STORAGE_KEY) || "";
    } catch (_) {
      storedKey = "";
    }
    const KEY_PARAM = keyFromUrl || storedKey || "";
    if (keyFromUrl) {
      try {
        sessionStorage.setItem(KEY_STORAGE_KEY, keyFromUrl);
      } catch (_) {
        // ignore storage issues
      }
    }

    if (initialSearchParams.has("K")) {
      initialSearchParams.delete("K");
    }
    const hashDate = initialHashParams.get("D");
    if (hashDate && !initialSearchParams.get("D")) {
      initialSearchParams.set("D", hashDate);
    }
    const sanitizedQuery = initialSearchParams.toString();
    if (initialUrl.search !== (sanitizedQuery ? `?${sanitizedQuery}` : "") || initialUrl.hash) {
      history.replaceState(null, "", initialUrl.pathname + (sanitizedQuery ? `?${sanitizedQuery}` : ""));
    }

    function cancelPlaybackTimer() {
      if (playbackTimer) {
        clearTimeout(playbackTimer);
        playbackTimer = null;
      }
    }

    function updatePausedStateClass(fast = fastForward) {
      const root = chatEl.closest(".phone-frame") || chatEl.closest("body") || document.body;
      if (!root) return;
      root.classList.toggle("paused", paused);
      root.classList.toggle("fast-forward", fast && !paused);
    }

    function updateControlStates() {
      const hasMessages = playbackMessages.length > 0;
      if (playPauseBtn) {
        playPauseBtn.disabled = !hasMessages;
        if (!hasMessages) {
          playPauseBtn.textContent = "⏯";
          playPauseBtn.setAttribute("aria-label", "Pause playback");
        } else if (index >= playbackMessages.length) {
          playPauseBtn.textContent = "↻";
          playPauseBtn.setAttribute("aria-label", "Replay messages");
        } else if (paused) {
          playPauseBtn.textContent = "▶";
          playPauseBtn.setAttribute("aria-label", "Resume playback");
        } else {
          playPauseBtn.textContent = "⏸";
          playPauseBtn.setAttribute("aria-label", "Pause playback");
        }
      }
      if (rewindBtn) {
        rewindBtn.disabled = !hasMessages || index <= 0;
      }
      if (fastForwardBtn) {
        fastForwardBtn.disabled = !hasMessages;
        fastForwardBtn.textContent = fastForward ? "⚡" : "⏭";
        fastForwardBtn.setAttribute(
          "aria-label",
          fastForward ? "Disable fast forward" : "Enable fast forward"
        );
      }
      updatePausedStateClass();
    }

    function applyDateSelection(isoValue) {
      const url = new URL(window.location.href);
      url.searchParams.delete("K");
      if (isoValue) {
        url.searchParams.set("D", isoValue);
      } else {
        url.searchParams.delete("D");
      }
      window.location.href = url.pathname + (url.searchParams.toString() ? `?${url.searchParams}` : "");
    }

    const datePickerNeedsBlurCommit = shouldDelayDatePickerNavigation();

    function handleDateInputChange() {
      if (!dateInputEl) return;
      if (datePickerNeedsBlurCommit) {
        return;
      }
      applyDateSelection(dateInputEl.value);
    }

    function handleDateInputBlur() {
      if (!dateInputEl || !datePickerNeedsBlurCommit) return;
      applyDateSelection(dateInputEl.value);
    }

    if (dateInputEl) {
      dateInputEl.addEventListener("change", handleDateInputChange);
      if (datePickerNeedsBlurCommit) {
        dateInputEl.addEventListener("blur", handleDateInputBlur);
      }
    }

    function rebuildRenderedMessages() {
      if (!playbackMessages.length) {
        chatEl.innerHTML = "";
        if (statsManager) {
          statsManager.reset();
        }
        return;
      }
      rendererState = createRendererState();
      chatEl.innerHTML = "";
      for (let i = 0; i < index; i++) {
        appendMessage(chatEl, playbackMessages[i], rendererState, { scroll: false });
      }
      chatEl.scrollTo({ top: chatEl.scrollHeight });
      if (statsManager) {
        statsManager.applyRange(playbackMessages, index);
      }
    }

    function scheduleNextMessage() {
      cancelPlaybackTimer();
      if (paused || index >= playbackMessages.length || !playbackMessages.length) {
        updateControlStates();
        return;
      }
      const delay = fastForward ? FAST_FORWARD_DELAY_MS : getNextMessageDelay();
      playbackTimer = setTimeout(() => {
        playbackTimer = null;
        if (paused) return;
        showNextMessage();
        if (index < playbackMessages.length) {
          scheduleNextMessage();
        } else {
          updateControlStates();
        }
      }, delay);
    }

    function showNextMessage() {
      if (index >= playbackMessages.length) return;
      const currentMessage = playbackMessages[index];
      appendMessage(chatEl, currentMessage, rendererState);
      if (statsManager) {
        statsManager.recordMessage(currentMessage);
      }
      index++;
      updateControlStates();
    }

    function seekTo(targetIndex, { pausePlayback = false } = {}) {
      if (!playbackMessages.length) return;
      const clamped = Math.max(0, Math.min(targetIndex, playbackMessages.length));
      if (clamped === index) return;
      cancelPlaybackTimer();
      if (pausePlayback) paused = true;
      index = clamped;
      rebuildRenderedMessages();
      updateControlStates();
      if (!paused && index < playbackMessages.length) {
        scheduleNextMessage();
      }
    }

    function handleTogglePlayPause() {
      if (!playbackMessages.length) return;
      if (index >= playbackMessages.length) {
        index = 0;
        rendererState = createRendererState();
        chatEl.innerHTML = "";
        if (statsManager) {
          statsManager.reset();
        }
        paused = false;
        updateControlStates();
        scheduleNextMessage();
        return;
      }
      if (paused) {
        paused = false;
        updateControlStates();
        scheduleNextMessage();
      } else {
        paused = true;
        cancelPlaybackTimer();
        updateControlStates();
      }
    }

    if (playPauseBtn) {
      playPauseBtn.addEventListener("click", handleTogglePlayPause);
    }
    if (rewindBtn) {
      rewindBtn.addEventListener("click", () => {
        seekTo(index - 1, { pausePlayback: true });
      });
    }
    if (fastForwardBtn) {
      fastForwardBtn.addEventListener("click", () => {
        fastForward = !fastForward;
        if (fastForward) {
          paused = false;
          cancelPlaybackTimer();
          scheduleNextMessage();
        }
        updateControlStates();
      });
    }
    initStatsToggle(statsToggleBtn, phoneFrameEl);
    updateControlStates();

    async function loadMessages() {
      let normalizedDate = null;
      try {
        await ensureDictionaryLoaded();
        if (!KEY_PARAM) {
          playbackMessages = [];
          allMessages = [];
          paused = true;
          cancelPlaybackTimer();
          showStatusMessage(chatEl, "Missing decryption key. Scan the QR code again to continue.");
          updateControlStates();
          if (statsManager) {
            statsManager.reset();
          }
          return;
        }
        const currentUrl = new URL(window.location.href);
        const dateFilterRaw = currentUrl.searchParams.get("D") || "";
        normalizedDate = normalizeDateInput(dateFilterRaw);
        if (!dateFilterRaw && !normalizedDate && DEFAULT_DATE) {
          normalizedDate = normalizeDateInput(DEFAULT_DATE) || null;
        }
        if (dateFilterRaw && !normalizedDate) {
          console.warn("Invalid date filter. Use DD/MM/YYYY or YYYY-MM-DD.");
        }
        const keyBytes = base32ToBytes(KEY_PARAM);

        const response = await fetch("chat_data.enc");
        if (!response.ok) {
          throw new Error(`Failed to fetch chat_data.enc (${response.status})`);
        }
        const enc = await response.json();
        if (enc.expires) {
          const expiresAt = new Date(enc.expires);
          if (Number.isNaN(expiresAt.getTime())) {
            console.warn("Invalid expiry metadata:", enc.expires);
          } else {
            const now = new Date();
            if (now > expiresAt) {
              playbackMessages = [];
              allMessages = [];
              paused = true;
              cancelPlaybackTimer();
              showStatusMessage(
                chatEl,
                `This key expired on ${expiresAt.toDateString()}. Request a new QR code to unlock the chat.`
              );
              updateControlStates();
              if (statsManager) {
                statsManager.reset();
              }
              return;
            }
          }
        }
        const nonce = base64ToBytes(enc.nonce);
        const ciphertext = base64ToBytes(enc.ciphertext);

        const cryptoKey = await crypto.subtle.importKey("raw", keyBytes, "AES-GCM", false, ["decrypt"]);
        const plainBuffer = await crypto.subtle.decrypt({ name: "AES-GCM", iv: nonce }, cryptoKey, ciphertext);

        const decompressed = await gunzip(plainBuffer);
        const decoder = new TextDecoder();
        const decrypted = JSON.parse(decoder.decode(decompressed));
        const prepared = prepareMessages(decrypted);
        allMessages = prepared;
        playbackMessages = applyDateFilter(prepared, normalizedDate);
        populateDatePicker(dateInputEl, allMessages, normalizedDate);
        index = 0;
        paused = false;
        rendererState = createRendererState();
        chatEl.innerHTML = "";
        if (statsManager) {
          statsManager.reset();
        }
        updateControlStates();
      } catch (err) {
        console.warn("Falling back to built-in messages:", err);
        allMessages = getFallbackMessages();
        playbackMessages = applyDateFilter(allMessages, normalizedDate);
        populateDatePicker(dateInputEl, allMessages, normalizedDate);
        index = 0;
        paused = false;
        rendererState = createRendererState();
        chatEl.innerHTML = "";
        if (statsManager) {
          statsManager.reset();
        }
        updateControlStates();
      }
    }

    const INITIAL_DELAY_MS = 900;
    const MESSAGE_INTERVAL_MS_MIN = 1400;
    const MESSAGE_INTERVAL_MS_MAX = 2600;
    const FAST_FORWARD_DELAY_MS = 120;

    function getNextMessageDelay() {
      const span = MESSAGE_INTERVAL_MS_MAX - MESSAGE_INTERVAL_MS_MIN;
      return MESSAGE_INTERVAL_MS_MIN + Math.random() * span;
    }

    async function startPlayback() {
      await loadMessages();
      if (!playbackMessages.length) {
        updateControlStates();
        return;
      }
      paused = false;
      fastForward = false;
      updateControlStates();
      scheduleNextMessage();
    }

    startPlayback();
  }

  async function renderSample({ chatSelector, messages }) {
    const chatEl = document.querySelector(chatSelector);
    if (!chatEl) return;
    await ensureDictionaryLoaded();
    const rendererState = createRendererState();
    chatEl.innerHTML = "";
    const prepared = prepareMessages(messages);
    prepared.forEach((msg) => appendMessage(chatEl, msg, rendererState, { scroll: false }));
    const statsManager = createStatsManager(document.querySelector("#statsPanel"));
    if (statsManager) {
      statsManager.applyRange(prepared, prepared.length);
    }
    const phoneFrameEl = chatEl.closest(".phone-frame");
    const statsToggleBtn = document.getElementById("statsToggleBtn");
    initStatsToggle(statsToggleBtn, phoneFrameEl);
  }

  window.ChatApp = {
    configure,
    startReplay,
    renderSample
  };
})();
