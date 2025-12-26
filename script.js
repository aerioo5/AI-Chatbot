let prompt = document.querySelector("#prompt")
let submitbtn = document.querySelector("#submit")
let chatContainer = document.querySelector(".chat-container")
let imagebtn = document.querySelector("#image")
let image = document.querySelector("#image img")
let imageinput = document.querySelector("#image input")

// 🔑 PUT YOUR REAL API KEY HERE
const API_KEY = "Put_your_APIkey";

// ✅ CORRECT ENDPOINT (v1, not v1beta)

const Api_Url =
`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

let user = {
  message: null,
  file: {
    mime_type: null,
    data: null
  }
}

async function generateResponse(aiChatBox) {
  let text = aiChatBox.querySelector(".ai-chat-area")

  let RequestOption = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: user.message },
            ...(user.file.data ? [{ inline_data: user.file }] : [])
          ]
        }
      ]
    })
  }

  try {
    console.log("API URL:", Api_Url)

    let response = await fetch(Api_Url, RequestOption)

    if (!response.ok) {
      const err = await response.text()
      throw new Error(err)
    }

    let data = await response.json()
    console.log("API Response:", data)

    let apiResponse =
      data.candidates[0].content.parts[0].text
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .trim()

    text.innerHTML = apiResponse

  } catch (error) {
    console.error(error)
    text.innerHTML = `
      <b>Error:</b> ${error.message}<br><br>
      Open DevTools (F12) → Console for details
    `
  } finally {
    chatContainer.scrollTo({
      top: chatContainer.scrollHeight,
      behavior: "smooth"
    })
    image.src = `img.svg`
    image.classList.remove("choose")
    user.file = {}
  }
}

function createChatBox(html, classes) {
  let div = document.createElement("div")
  div.innerHTML = html
  div.classList.add(classes)
  return div
}

function handlechatResponse(userMessage) {
  if (!userMessage) return

  user.message = userMessage

  let html = `
  <div style="display: flex; justify-content: flex-end;">
    <img src="cat.png" width="10%">
  </div>

  <div class="user-chat-area">
    ${user.message}
    ${
      user.file.data
        ? `<img src="data:${user.file.mime_type};base64,${user.file.data}" class="chooseimg" />`
        : ""
    }
  </div>
`;


  prompt.value = ""
  let userChatBox = createChatBox(html, "user-chat-box")
  chatContainer.appendChild(userChatBox)

  chatContainer.scrollTo({ top: chatContainer.scrollHeight })

  setTimeout(() => {
    let html = `
      <img src="bot.png" width="10%">
      <div class="ai-chat-area">
        <img src="dot.gif" class="load" width="50px">
      </div>
    `
    let aiChatBox = createChatBox(html, "ai-chat-box")
    chatContainer.appendChild(aiChatBox)
    generateResponse(aiChatBox)
  }, 600)
}

prompt.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    handlechatResponse(prompt.value)
  }
})

submitbtn.addEventListener("click", () => {
  handlechatResponse(prompt.value)
})

imageinput.addEventListener("change", () => {
  const file = imageinput.files[0]
  if (!file) return

  let reader = new FileReader()
  reader.onload = (e) => {
    let base64string = e.target.result.split(",")[1]
    user.file = {
      mime_type: file.type,
      data: base64string
    }
    image.src = `data:${user.file.mime_type};base64,${user.file.data}`
    image.classList.add("choose")
  }
  reader.readAsDataURL(file)
})

imagebtn.addEventListener("click", () => {
  imagebtn.querySelector("input").click()
})

