# Writing Buddy ✍️

**Writing Buddy** is an interactive, AI-powered literacy tutor designed to help students (Grades 3-5) improve their reading and writing skills. It features a friendly AI companion that provides real-time feedback, generates engaging stories, and guides students through structured writing exercises.

## 🚀 Features

### 1. **Free Write Mode** 📝
- Creative writing area with AI-generated prompts.
- **"Publish Story"** button to celebrate completion with confetti!
- **AI Feedback**: Get instant, encouraging feedback on grammar, creativity, and clarity.
- **Score Gating**: Submission is gated until the student achieves a quality score of 8/10.

### 2. **Reading Comprehension** 📖
- Generates unique reading passages tailored to the student's grade level.
- AI creates comprehension questions that require inferential thinking.
- **Context-Aware**: The AI tutor knows exactly what story you're reading and can check your answers.

### 3. **RACE Practice** 🏃‍♂️
- Structured practice for constructed responses using the **R**estate, **A**nswer, **C**ite, **E**xplain strategy.
- AI generates short texts and questions to practice specific skills.

### 4. **Dashboard & Progress Tracking** 📊
- **Activity Grid**: Visualize "Last 30 Days" of activity (GitHub-style).
- **Stats**: Track words written, stories read, and daily streaks.
- **Badges**: Earn achievements for consistent practice.
- **Persistence**: All progress is saved locally, so you never lose your streak!

### 5. **Smart Chat Companion** 🤖
- A dedicated AI buddy for each mode (Free Write, Reading, RACE).
- **Persistent Sessions**: Switch tabs without losing your conversation context.
- **Session Reset**: Automatically starts a fresh chat when you generate a new topic or story.

---

## 🛠️ Tech Stack

- **Frontend**: React (v18), TypeScript, Vite
- **Styling**: Tailwind CSS (v4), Lucide React (Icons), Framer Motion (Animations)
- **State Management**: Zustand
- **AI Integration**: Anthropic Claude API (Claude 3.5 Haiku)
- **Persistence**: LocalStorage

---

## 🚦 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- An Anthropic API Key

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/writing-buddy.git
    cd writing-buddy
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**
    Create a `.env` file in the root directory:
    ```bash
    cp .env.example .env
    ```
    Add your Anthropic API Key:
    ```env
    VITE_ANTHROPIC_API_KEY=your_api_key_here
    ```

4.  **Run the Development Server**
    ```bash
    npm run dev
    ```
    Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

---

## 🤝 Contributing

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 🛡️ License

Distributed under the MIT License.
