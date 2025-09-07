# MemorEase

MemorEase is your AI-powered study assistant, designed for hackathons and rapid prototyping! Built with Next.js, Firebase, and Gemini API, it helps users memorize content efficiently with AI-generated summaries, quizzes, cheat sheets, mnemonics, and more.

---

## ✨ Features

- **Content Input:** Paste text or a URL to start memorizing. Supports plain text, web articles, and notes.
- **AI Summarization:** Get concise summaries using advanced LLMs. Summaries are context-aware and highlight key points.
- **Highlight Suggestions:** AI suggests key highlights for better retention, based on semantic analysis.
- **Bookmarking:** Save important sections for quick access. Bookmarks are synced to your account.
- **Customizable Display:** Adjust font size, theme (light/dark), and reading mode for comfort.
- **Quiz Generation:** Practice with AI-generated MCQs, flashcards, and fill-in-the-blanks. Quizzes adapt to your learning progress.
- **Cheat Sheet Creation:** Instantly generate a study cheat sheet with formulas, facts, and summaries.
- **Audio & Visuals:** Generate audio narration and visual aids (charts, diagrams) for your content.
- **Session Memory:** Save and revisit your study sessions. Progress is tracked and visualized.
- **User Authentication:** Secure login/signup via Firebase Auth (email, Google, etc.).
- **Mobile Responsive:** Fully responsive UI for desktop, tablet, and mobile.
- **Accessibility:** Keyboard navigation, screen reader support, and high-contrast mode.

---

## 🛠 Tech Stack
- **Frontend:** Next.js 14, React 18, TypeScript, TailwindCSS
- **Backend:** Firebase (Firestore, Auth), Gemini API (Google AI)
- **AI/ML:** Gemini API for NLP tasks (summarization, quiz, mnemonics, highlights)
- **UI Components:** Custom and Shadcn UI components
- **State Management:** React Context, hooks
- **Testing:** Jest, React Testing Library (planned)
- **Deployment:** Vercel, Firebase Hosting

---

## ⚡ Quick Start

### 1. Clone the Repository
```sh
git clone https://github.com/AitijhyaCoded/MemorEase.git
cd MemorEase
```

### 2. Install Dependencies
```sh
npm install
```

### 3. Set Up Environment Variables
Create a `.env.local` file in the root directory:
```
GEMINI_API_KEY=your_gemini_api_key_here
```
Never commit your API key publicly!

### 4. Configure Firebase
- Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
- Enable Firestore and Authentication (email/Google)
- Download your Firebase config and update `firebase.json` and `src/lib/firebase.ts`
- Set Firestore rules in `firestore.rules`

### 5. Run the Development Server
```sh
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) to use the app.

---

## 📁 Project Structure
- `src/app/` — Main Next.js app pages and layouts
- `src/components/` — Reusable UI and feature components
  - `auth/` — Login form, user navigation
  - `chat/` — Chat dialog for AI interaction
  - `notes/` — Notes section for user input and review
  - `quiz/` — Flashcard and quiz views
  - `ui/` — Core UI elements (buttons, dialogs, forms, etc.)
- `src/ai/` — AI logic and flows
  - `flows/` — Individual AI features (summarize, quiz, mnemonics, etc.)
- `src/hooks/` — Custom React hooks (auth, mobile, toast)
- `src/lib/` — Firebase and utility functions
- `docs/` — Project documentation and blueprints

---

## 🎨 Customization & Style
- Colors, fonts, and UI follow the guidelines in `docs/blueprint.md`
- Easily extend or modify AI flows in `src/ai/flows/`
- TailwindCSS for rapid UI prototyping
- All UI components are modular and reusable

---

## 🚢 Deployment
- Deploy to [Vercel](https://vercel.com) (recommended for Next.js)
- Deploy to Firebase Hosting (static export)
- Set up environment variables and Firebase credentials on your deployment platform
- For Vercel: Add `GEMINI_API_KEY` and Firebase config in dashboard
- For Firebase: Use `firebase.json` and set up hosting via CLI

---

## 🏆 Hackathon Checklist
- [x] API keys in `.env.local`
- [x] Firebase configured
- [x] All dependencies installed (`npm install`)
- [x] App runs locally (`npm run dev`)
- [x] README updated
- [x] Screenshots/gif in `docs/`
- [x] Clear instructions for setup and usage
- [x] Accessibility features enabled
- [x] Mobile responsiveness tested
- [x] Authentication working

---

## 🤝 Contributing
- Fork the repo and create your branch (`git checkout -b feature/your-feature`)
- Commit your changes (`git commit -am 'Add new feature'`)
- Push to the branch (`git push origin feature/your-feature`)
- Open a Pull Request
- Please read the code, style, and commit guidelines in `docs/blueprint.md` before contributing
- All contributions, issues, and suggestions are welcome!

---

## 👥 Team & Contact
- **Project Lead:** [AitijhyaCoded](https://github.com/AitijhyaCoded)
- **Contributors:** Add your name here!
- For questions or support, open an issue or contact the maintainer via GitHub

---

## 🔮 Future Planning
- Mobile app version (React Native)
- Integration with more AI models (OpenAI, Claude)
- Collaborative study sessions
- Gamification features (leaderboards, badges)
- Offline mode
- Advanced analytics for learning progress
- More export options (PDF, Anki, etc.)
- Accessibility improvements
- Internationalization (i18n) and localization
- Plugin system for custom AI flows
- Automated testing and CI/CD

---

## 📄 License
MIT

---

> For questions or support, open an issue or contact the maintainer.
