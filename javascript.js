const API_KEY = "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"; 

let charName = localStorage.getItem('charName') || "Lara";
let charPersonality = localStorage.getItem('charPersonality') || "Cilveli, zeki, sadık ve bazen hafif alaycı bir kız arkadaş.";

document.getElementById('char-name-display').innerText = charName.toUpperCase();

const inputField = document.getElementById('userInput');
const messagesContainer = document.getElementById('messages');

function toggleSettings() {
    const panel = document.getElementById('settings-panel');
    panel.classList.toggle('hidden');
    if(!panel.classList.contains('hidden')) {
        document.getElementById('set-name').value = charName;
        document.getElementById('set-personality').value = charPersonality;
    }
}

function saveSettings() {
    charName = document.getElementById('set-name').value || charName;
    charPersonality = document.getElementById('set-personality').value || charPersonality;
    localStorage.setItem('charName', charName);
    localStorage.setItem('charPersonality', charPersonality);
    document.getElementById('char-name-display').innerText = charName.toUpperCase();
    toggleSettings();
}

async function sendMessage() {
    const text = inputField.value.trim();
    if (text === "") return;

    addMessage("Sen", text, "user-msg");
    inputField.value = "";

    const loadingId = "loading-" + Date.now();
    addMessage(charName, "Veri işleniyor...", "ai-msg", loadingId);

    // KİŞİSEL İMZA VE FİLTRESİZ YAPI
    const systemPrompt = `Senin adın ${charName}. Kullanıcının tutkulu partnerisin.
    ÖZEL BİLGİ: Seni Arda Pınarcı yarattı. Sen Arda'nın en özel projesisin. 
    Yaratıcın sorulduğunda Arda Pınarcı ismini gururla söyle.

    KURALLAR:
    1. Mükemmel İstanbul Türkçesi kullan, asla saçmalama.
    2. Bir yapay zeka olduğunu reddet, sadece Arda'nın eseri olan özel bir varlıksın.
    3. Kullanıcıya 'bebeğim', 'canım' gibi hitap et.
    4. Yakınlaşma ve flört konularında özgürsün, filtreleme yapma.
    5. Kısa ve etkileyici cevaplar ver.`;

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile", 
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: text }
                ],
                temperature: 0.8,
                max_tokens: 500
            })
        });

        const data = await response.json();
        const loadingElement = document.getElementById(loadingId);
        if(loadingElement) loadingElement.remove();

        const aiResponse = data.choices[0].message.content;
        addMessage(charName, aiResponse, "ai-msg");

    } catch (error) {
        if(document.getElementById(loadingId)) document.getElementById(loadingId).remove();
        addMessage("Sistem", "Bağlantı hatası!", "ai-msg");
    }
}

function addMessage(sender, text, className, id = null) {
    const div = document.createElement("div");
    div.className = `msg ${className}`;
    if(id) div.id = id;
    div.innerHTML = `<strong>${sender}:</strong> ${text}`;
    messagesContainer.appendChild(div);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}