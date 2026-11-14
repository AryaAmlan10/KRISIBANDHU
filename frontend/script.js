
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatMessages = document.getElementById("chatMessages");

const generalMode = document.getElementById("generalMode");
const domainMode = document.getElementById("domainMode");
const modeHelp = document.getElementById("modeHelp");

const pictureUpload = document.getElementById("pictureUpload");
const picturePreview = document.getElementById("picturePreview");

let answerMode = "general";

/* CHANGE CHAT MODE */
function setMode(mode) {
    answerMode = mode;

    generalMode.classList.toggle("selected", mode === "general");
    domainMode.classList.toggle("selected", mode === "domain");

    modeHelp.textContent = mode === "general"
        ? "General mode: Ask any farming-related question."
        : "Domain mode: Get answers using your farming documents.";
}

generalMode.addEventListener("click", () => setMode("general"));
domainMode.addEventListener("click", () => setMode("domain"));

/* FORMAT INLINE BOLD TEXT SAFELY */
function addFormattedText(element, text) {
    const parts = text.split(/(\*\*.*?\*\*)/g);

    parts.forEach(part => {
        if (part.startsWith("**") && part.endsWith("**")) {
            const strong = document.createElement("strong");
            strong.textContent = part.slice(2, -2);
            element.appendChild(strong);
        } else {
            element.appendChild(document.createTextNode(part));
        }
    });
}

/* FORMAT GEMINI ANSWER */
function renderAnswer(bubble, answer) {
    bubble.innerHTML = "";

    // Handle actual newlines and literal \n sequences.
    const lines = String(answer)
        .replace(/\\n/g, "\n")
        .replace(/\r\n/g, "\n")
        .split("\n");

    lines.forEach(line => {
        const cleanLine = line.trim();

        if (!cleanLine) {
            const space = document.createElement("div");
            space.className = "answer-space";
            bubble.appendChild(space);
            return;
        }

        // WARNING heading
        const warning = cleanLine.match(
            /^(?:#{1,3}\s*)?(?:\*\*)?WARNING(?:\*\*)?\s*:?\s*(.*)$/i
        );

        if (warning) {
            const box = document.createElement("div");
            box.className = "answer-alert warning-alert";

            const heading = document.createElement("h3");
            heading.textContent = "⚠ WARNING";
            box.appendChild(heading);

            if (warning[1]) {
                const content = document.createElement("p");
                addFormattedText(content, warning[1]);
                box.appendChild(content);
            }

            bubble.appendChild(box);
            return;
        }

        // GOOD heading
        const good = cleanLine.match(
            /^(?:#{1,3}\s*)?(?:\*\*)?GOOD(?:\*\*)?\s*:?\s*(.*)$/i
        );

        if (good) {
            const box = document.createElement("div");
            box.className = "answer-alert good-alert";

            const heading = document.createElement("h3");
            heading.textContent = "✓ GOOD";
            box.appendChild(heading);

            if (good[1]) {
                const content = document.createElement("p");
                addFormattedText(content, good[1]);
                box.appendChild(content);
            }

            bubble.appendChild(box);
            return;
        }

        // Markdown headings
        const headingMatch = cleanLine.match(/^(#{1,3})\s+(.+)$/);

        if (headingMatch) {
            const heading = document.createElement(
                headingMatch[1].length === 1 ? "h3" : "h4"
            );

            addFormattedText(heading, headingMatch[2]);
            heading.className = "answer-heading";
            bubble.appendChild(heading);
            return;
        }

        // Bullet points
        if (/^[-*]\s+/.test(cleanLine)) {
            const item = document.createElement("div");
            item.className = "answer-list-item";

            const bullet = document.createElement("span");
            bullet.textContent = "•";

            const content = document.createElement("span");
            addFormattedText(content, cleanLine.replace(/^[-*]\s+/, ""));

            item.append(bullet, content);
            bubble.appendChild(item);
            return;
        }

        // Numbered points
        const numberMatch = cleanLine.match(/^(\d+)\.\s+(.+)$/);

        if (numberMatch) {
            const item = document.createElement("div");
            item.className = "answer-list-item";

            const number = document.createElement("span");
            number.className = "answer-number";
            number.textContent = numberMatch[1] + ".";

            const content = document.createElement("span");
            addFormattedText(content, numberMatch[2]);

            item.append(number, content);
            bubble.appendChild(item);
            return;
        }

        // Normal paragraph
        const paragraph = document.createElement("p");
        paragraph.className = "answer-paragraph";
        addFormattedText(paragraph, cleanLine);
        bubble.appendChild(paragraph);
    });
}

/* DISPLAY CHAT MESSAGE */
function addMessage(text, sender) {
    const message = document.createElement("div");
    message.classList.add("message", `${sender}-message`);

    if (sender === "bot") {
        const avatar = document.createElement("span");
        avatar.className = "message-avatar";
        avatar.textContent = "🤖";
        message.appendChild(avatar);
    }

    const bubble = document.createElement("div");
    bubble.className = "bubble";

    if (sender === "bot") {
        renderAnswer(bubble, text);
    } else {
        bubble.textContent = text;
    }

    message.appendChild(bubble);
    chatMessages.appendChild(message);

    chatMessages.scrollTop = chatMessages.scrollHeight;

    return bubble;
}

/* PICTURE PREVIEW */
pictureUpload.addEventListener("change", function () {
    const file = this.files[0];

    picturePreview.innerHTML = "";

    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        alert("Please select a JPG, PNG or WEBP image.");
        this.value = "";
        return;
    }

    const reader = new FileReader();

    reader.onload = function (event) {
        const img = document.createElement("img");
        img.src = event.target.result;
        img.alt = "Uploaded farming picture";
        picturePreview.appendChild(img);
    };

    reader.readAsDataURL(file);
});

/* SEND MESSAGE OR IMAGE */
chatForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const question = userInput.value.trim();
    const file = pictureUpload.files[0];

    if (!question && !file) return;

    if (file) {
        addMessage(
            question
                ? `📷 Image: ${file.name}\n${question}`
                : `📷 Image: ${file.name}`,
            "user"
        );
    } else {
        addMessage(question, "user");
    }

    userInput.value = "";

    const thinkingBubble = addMessage("Thinking...", "bot");

    const sendButton = chatForm.querySelector(".send-button");
    sendButton.disabled = true;

    try {
        let response;

        if (file) {
            const formData = new FormData();

            formData.append("file", file);
            formData.append(
                "question",
                question || "Please analyze this farming image."
            );

            response = await fetch(
                "http://127.0.0.1:8001/api/analyze-image",
                {
                    method: "POST",
                    body: formData
                }
            );
        } else {
            response = await fetch(
                "http://127.0.0.1:8001/api/chat",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        question: question,
                        use_rag: answerMode === "domain"
                    })
                }
            );
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Unable to get an answer.");
        }

        renderAnswer(thinkingBubble, data.answer);

        pictureUpload.value = "";
        picturePreview.innerHTML = "";

    } catch (error) {
        console.error("Chat error:", error);

        renderAnswer(
            thinkingBubble,
            "Sorry, something went wrong. Please check your backend and try again."
        );

    } finally {
        sendButton.disabled = false;
        userInput.focus();
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
});

/* FEATURE CARDS */
document.querySelectorAll(".feature").forEach(button => {
    button.addEventListener("click", () => {
        userInput.value = button.dataset.prompt;
        userInput.focus();
    });
});
