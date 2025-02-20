import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import Base64 from 'base64-js';
import MarkdownIt from 'markdown-it';
import { maybeShowApiKeyBanner } from './gemini-api-banner';
import './style.css';

// 🔥 FILL THIS OUT FIRST! 🔥
// 🔥 GET YOUR GEMINI API KEY AT 🔥
// 🔥 https://g.co/ai/idxGetGeminiKey 🔥
let API_KEY = 'AIzaSyA9d0aRG7RGfY2Q-uervuh9zi-CjtoGKM0';

let form = document.querySelector('form');
let promptInput = document.querySelector('input[name="prompt"]');
let output = document.querySelector('.output');
// Ambil elemen input file dan elemen gambar
const fotoInput = document.getElementById('foto');
const previewImage = document.getElementById('previewImage');
// Tambahkan event listener 'change' ke input file
fotoInput.addEventListener('change', (event) => {
  
const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const fileContent = e.target.result;
      // Tampilkan gambar di elemen <img>
      previewImage.src = fileContent; 
    };
    reader.readAsDataURL(file);
  } else {
    // Reset gambar preview jika tidak ada file yang dipilih
    previewImage.src = ""; // Atau atur ke gambar default jika Anda mau
  }
});
form.onsubmit = async (ev) => {
  ev.preventDefault();
  output.textContent = 'Generating...';
  try {
    // Ambil data gambar base64 dari elemen gambar
    let imageBase64 = previewImage.src.split(',')[1]; 
    if (!imageBase64) {
      console.log("Tidak ada gambar yang dipilih.");
      return; // Hentikan proses jika tidak ada gambar
    }
    // Assemble the prompt by combining the text with the chosen image
    let contents = [
      {
        role: 'user',
        parts: [
          { inline_data: { mime_type: 'image/jpeg', data: imageBase64 } },
          { text: promptInput.value }
          ]
        }
      ];

      // Call the gemini-pro-vision model, and get a stream of results
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({
        model: "gemini-pro-vision",
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
          },
        ],
      });

      const result = await model.generateContentStream({ contents });

      // Read from the stream and interpret the output as markdown
      let buffer = [];
      let md = new MarkdownIt();
      for await (let response of result.stream) {
        buffer.push(response.text());
        output.innerHTML = md.render(buffer.join(''));
      }
    
  } catch (e) {
    output.innerHTML += '<hr>' + e;
  }
};

// You can delete this once you've filled out an API key
maybeShowApiKeyBanner(API_KEY);
