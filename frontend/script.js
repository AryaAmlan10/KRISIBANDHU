
const API_URL = "http://127.0.0.1:8000/api/chat";

const questionInput = document.getElementById("questionInput");
const sendButton = document.getElementById("sendButton");
const chatMessages = document.getElementById("chatMessages");

const generalMode = document.getElementById("generalMode");
const ragMode = document.getElementById("ragMode");

let useRag = false;


// Mode selection
generalMode.addEventListener("click", () => {
    useRag = false;

    generalMode.classList.add("active");
    ragMode.classList.remove("active");
});

ragMode.addEventListener("click", () => {
    useRag = true;

    ragMode.classList.add("active");
    generalMode.classList.remove("active");
});


// Display messages
function displayMessage(message, sender) {
    const messageWrapper = document.createElement("div");

    messageWrapper.className =
        sender === "user" ? "user-message" : "bot-message";

    const messageContent = document.createElement("div");
    messageContent.className = "message-content";

    const messageText = document.createElement("p");
    messageText.textContent = message;

    const messageTime = document.createElement("small");
    messageTime.textContent = new Date().toLocaleString();

    messageContent.appendChild(messageText);
    messageContent.appendChild(messageTime);

    if (sender === "bot") {
        const icon = document.createElement("span");
        icon.className = "message-icon";
        icon.textContent = "🤖";

        messageWrapper.appendChild(icon);
    }

    messageWrapper.appendChild(messageContent);
    chatMessages.appendChild(messageWrapper);

    chatMessages.scrollTop = chatMessages.scrollHeight;
}


// Send question to FastAPI
async function sendMessage() {
    const question = questionInput.value.trim();

    if (!question) {
        alert("Please enter your farming question.");
        return;
    }

    displayMessage(question, "user");

    questionInput.value = "";
    sendButton.disabled = true;
    sendButton.textContent = "...";

    const loadingMessage = document.createElement("div");
    loadingMessage.className = "bot-message";
    loadingMessage.textContent = "KRISIBANDHU is thinking...";
    chatMessages.appendChild(loadingMessage);

    try {
        const response = await fetch(API_URL, {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                question: question,
                use_rag: useRag
            })
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();

        loadingMessage.remove();

        displayMessage(data.answer, "bot");

    } catch (error) {
        loadingMessage.remove();

        displayMessage(
            "Sorry, I could not connect to KRISIBANDHU. Please check whether the backend server is running.",
            "bot"
        );

        console.error("Chat error:", error);

    } finally {
        sendButton.disabled = false;
        sendButton.textContent = "➤";
        questionInput.focus();
    }
}


// Send button
sendButton.addEventListener("click", sendMessage);


// Press Enter to send
questionInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        sendMessage();
    }
});
