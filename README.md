# MemorEase

MemorEase is your AI-powered study assistant, designed for hackathons and rapid prototyping! Built with Next.js, Firebase, and Gemini API, it helps users memorize content efficiently with AI-generated summaries, quizzes, cheat sheets, mnemonics, and more.

---

## ✨ Features

- **Content Input:** Paste text or a URL to start memorizing
- **AI Summarization:** Get concise summaries
- **Highlight Suggestions:** AI suggests key highlights
- **Bookmarking:** Save important sections
- **Customizable Display:** Font size & theme options
- **Quiz Generation:** MCQs, flashcards, fill-in-the-blanks
- **Cheat Sheet Creation:** Instant study sheets
- **Audio & Visuals:** Generate audio/visual aids
- **Session Memory:** Save & revisit sessions

---

## 🛠 Tech Stack
- Next.js 14
- TypeScript
- Firebase (Firestore, Auth)
- TailwindCSS
- Gemini API (Google AI)

---

## ⚡ Quick Start

1. **Clone the Repository**
   ```sh
   git clone https://github.com/AitijhyaCoded/MemorEase.git
   cd MemorEase
   ```
2. **Install Dependencies**
   ```sh
   npm install
   ```
3. **Set Up Environment Variables**
   - Create a `.env.local` file in the root directory:
     ```
     GEMINI_API_KEY=your_gemini_api_key_here
     ```
   - Never commit your API key publicly!
4. **Configure Firebase**
   - Update `firebase.json` and `src/lib/firebase.ts` with your Firebase project credentials.
   - Set up Firestore and Authentication in your Firebase console.
5. **Run the Development Server**
   ```sh
   npm run dev
   ```
   Visit [http://localhost:3000](http://localhost:3000) to use the app.

---

## 📁 Project Structure
- `src/app/` — Main Next.js app pages and layouts
- `src/components/` — Reusable UI and feature components
- `src/ai/flows/` — AI logic for summarization, quiz, mnemonics, etc.
- `src/hooks/` — Custom React hooks
- `src/lib/` — Firebase and utility functions
- `docs/` — Project documentation and blueprints

---

## 🎨 Customization & Style
- Colors, fonts, and UI follow the guidelines in `docs/blueprint.md`
- Easily extend or modify AI flows in `src/ai/flows/`

## 🚢 Deployment
- Deploy to [Vercel](https://vercel.com), Firebase Hosting, or any Next.js-compatible platform
- Set up environment variables and Firebase credentials on your deployment platform

## 🏆 Hackathon Checklist
- [x] API keys in `.env.local`
- [x] Firebase configured
- [x] All dependencies installed (`npm install`)
- [x] App runs locally (`npm run dev`)
- [x] Demo deployed
- [x] README updated
- [x] Screenshots/gif in `docs/`
- [x] Clear instructions for setup and usage

## 🤝 Contributing
Pull requests and issues are welcome! Please read the code, style, and commit guidelines in `docs/blueprint.md` before contributing.

## 👥 Team & Contact
- Project Lead: [AitijhyaCoded](https://github.com/AitijhyaCoded)
- Contributors: Add your name here!
- For questions or support, open an issue or contact the maintainer.

## 🔮 Future Planning
- Mobile app version (React Native)
- Integration with more AI models (OpenAI, Claude)
- Collaborative study sessions
- Gamification features (leaderboards, badges)
- Offline mode
- Advanced analytics for learning progress
- More export options (PDF, Anki, etc.)
- Accessibility improvements

## 📄 License
MIT

---

> For questions or support, open an issue or contact the maintainer.
