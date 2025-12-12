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

  let MY_NAME = "Dragos";

  function configure(options = {}) {
    if (options.myName) {
      MY_NAME = options.myName;
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

  function formatMessageText(text) {
    if (!text) return "";
    const trimmed = text.trim().toLowerCase();
    if (trimmed === "image omitted") return "🖼️";
    if (trimmed === "gif omitted") return "🎞️";
    if (trimmed === "sticker omitted") return "🏷️";
    let escaped = escapeHtml(text);
    escaped = applyWhatsAppFormatting(escaped);
    escaped = escaped.replace(/\n/g, "<br>");
    return highlightMentions(escaped);
  }

  function prepareMessage(msg) {
    const { text, edited } = normalizeEditedContent(msg.text || "");
    return {
      sender: msg.sender,
      fromMe: msg.sender === MY_NAME,
      text,
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
    const row = document.createElement("div");
    row.className = "bubble-row " + (msg.fromMe ? "me" : "them");

    const bubble = document.createElement("div");
    bubble.className = "bubble " + (msg.fromMe ? "me" : "them");
    const color = getSenderBubbleColor(rendererState, msg.sender, msg.fromMe);
    if (color) {
      bubble.style.background = color;
      bubble.style.color = "#f8fafc";
      bubble.style.boxShadow = "0 4px 10px rgba(15, 23, 42, 0.45)";
    }

    const sender = document.createElement("div");
    sender.className = "sender";
    sender.textContent = msg.sender;

    const text = document.createElement("div");
    const formatted = formatMessageText(msg.text);
    if (formatted === "🖼️" || formatted === "🎞️" || formatted === "🏷️") {
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

    let rendererState = createRendererState();
    let playbackMessages = [];
    let allMessages = [];
    let index = 0;
    let paused = false;
    let playbackTimer = null;

    const initialUrl = new URL(window.location.href);
    const initialSearchParams = new URLSearchParams(initialUrl.search);
    const initialHashString = initialUrl.hash.startsWith("#") ? initialUrl.hash.slice(1) : "";
    const initialHashParams = new URLSearchParams(initialHashString);
    const keyFromUrl = initialSearchParams.get("K") || initialHashParams.get("K") || "";
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

    function updatePausedStateClass() {
      const root = chatEl.closest(".phone-frame") || chatEl.closest("body") || document.body;
      if (!root) return;
      if (paused) {
        root.classList.add("paused");
      } else {
        root.classList.remove("paused");
      }
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
        fastForwardBtn.disabled = !hasMessages || index >= playbackMessages.length;
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
        return;
      }
      rendererState = createRendererState();
      chatEl.innerHTML = "";
      for (let i = 0; i < index; i++) {
        appendMessage(chatEl, playbackMessages[i], rendererState, { scroll: false });
      }
      chatEl.scrollTo({ top: chatEl.scrollHeight });
    }

    function scheduleNextMessage(delayOverride) {
      cancelPlaybackTimer();
      if (paused || index >= playbackMessages.length || !playbackMessages.length) {
        updateControlStates();
        return;
      }
      const delay = typeof delayOverride === "number" ? delayOverride : getNextMessageDelay();
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
      appendMessage(chatEl, playbackMessages[index], rendererState);
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
        scheduleNextMessage(400);
      }
    }

    function handleTogglePlayPause() {
      if (!playbackMessages.length) return;
      if (index >= playbackMessages.length) {
        index = 0;
        rendererState = createRendererState();
        chatEl.innerHTML = "";
        paused = false;
        updateControlStates();
        scheduleNextMessage(INITIAL_DELAY_MS);
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
        seekTo(index + 1, { pausePlayback: true });
      });
    }
    updateControlStates();

    async function loadMessages() {
      try {
        if (!KEY_PARAM) {
          playbackMessages = [];
          allMessages = [];
          paused = true;
          cancelPlaybackTimer();
          showStatusMessage(chatEl, "Missing decryption key. Scan the QR code again to continue.");
          updateControlStates();
          return;
        }
        const currentUrl = new URL(window.location.href);
        const dateFilterRaw = currentUrl.searchParams.get("D") || "";
        const normalizedDate = normalizeDateInput(dateFilterRaw);
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
        updateControlStates();
      } catch (err) {
        console.warn("Falling back to built-in messages:", err);
        allMessages = getFallbackMessages();
        playbackMessages = allMessages;
        populateDatePicker(dateInputEl, allMessages, null);
        index = 0;
        paused = false;
        rendererState = createRendererState();
        chatEl.innerHTML = "";
        updateControlStates();
      }
    }

    const INITIAL_DELAY_MS = 1200;
    const MESSAGE_INTERVAL_MS_MIN = 1800;
    const MESSAGE_INTERVAL_MS_MAX = 3200;

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
      updateControlStates();
      scheduleNextMessage(INITIAL_DELAY_MS);
    }

    startPlayback();
  }

  function renderSample({ chatSelector, messages }) {
    const chatEl = document.querySelector(chatSelector);
    if (!chatEl) return;
    const rendererState = createRendererState();
    chatEl.innerHTML = "";
    const prepared = prepareMessages(messages);
    prepared.forEach((msg) => appendMessage(chatEl, msg, rendererState, { scroll: false }));
  }

  window.ChatApp = {
    configure,
    startReplay,
    renderSample
  };
})();
