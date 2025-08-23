# MemorEase

MemorEase is an AI-powered study assistant built with Next.js and Firebase. It helps users memorize content efficiently by providing AI-generated summaries, quizzes, cheat sheets, mnemonics, and more, leveraging the Gemini API.

## Features

- **Content Input:** Paste text or a URL to start memorizing.
- **AI Summarization:** Get concise summaries of your content.
- **Highlight Suggestions:** AI suggests key highlights for better retention.
- **Bookmarking:** Bookmark important sections for quick access.
- **Customizable Display:** Adjust font size and theme for comfortable reading.
- **Quiz Generation:** Practice with AI-generated MCQs, flashcards, and fill-in-the-blanks.
- **Cheat Sheet Creation:** Instantly generate a study cheat sheet.
- **Audio & Visuals:** Generate audio and visual aids for your content.
- **Session Memory:** Save and revisit your study sessions.

## Getting Started

### 1. Clone the Repository
```sh
git clone https://github.com/AitijhyaCoded/studio.git
cd studio
```

### 2. Install Dependencies
```sh
npm install
```

### 3. Set Up Environment Variables
Create a `.env.local` file in the root directory and add your Gemini API key:
```
GEMINI_API_KEY=your_gemini_api_key_here
```

> **Note:** Never share or commit your API key publicly.

### 4. Configure Firebase
- Update `firebase.json` and `src/lib/firebase.ts` with your Firebase project credentials.
- Set up Firestore and Authentication in your Firebase console.

### 5. Run the Development Server
```sh
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) to use the app.

## Project Structure

- `src/app/` — Main Next.js app pages and layouts
- `src/components/` — Reusable UI and feature components
- `src/ai/flows/` — AI logic for summarization, quiz, mnemonics, etc.
- `src/hooks/` — Custom React hooks
- `src/lib/` — Firebase and utility functions
- `docs/` — Project documentation and blueprints

## Customization & Style
- Colors, fonts, and UI follow the guidelines in `docs/blueprint.md`.
- Easily extend or modify AI flows in `src/ai/flows/`.

## Deployment
You can deploy to Vercel, Firebase Hosting, or any platform supporting Next.js.

## Contributing
Pull requests and issues are welcome! Please read the code, style, and commit guidelines in `docs/blueprint.md` before contributing.

## License
MIT

---

> For questions or support, open an issue or contact the maintainer.
