export interface ManualStep {
  title: string;
  desc: string;
  cmd: string;
}

export const PROMPT_SETUP_TEXT = `Set up this project:
1. Clone the repository: \`git clone https://github.com/itushr/t-rex.git\`
2. Install Python driver dependencies: \`cd t-rex && pip install -r backend/driver/requirements.txt\`
3. Launch the driver orchestrator: \`python backend/driver/main.py\`
4. (Optional) Run frontend: \`cd frontend && npm install && npm run dev\``;

export const MANUAL_STEPS: ManualStep[] = [
  {
    title: "Clone repository",
    desc: "Clone the official repository to your local machine and enter the project folder.",
    cmd: "git clone https://github.com/itushr/t-rex.git && cd t-rex",
  },
  {
    title: "Install dependencies",
    desc: "Install Python packages for Chrome DevTools Protocol (CDP) automation and training.",
    cmd: "pip install -r backend/driver/requirements.txt",
  },
  {
    title: "Launch driver",
    desc: "Start the local Python backend orchestrator to record gameplay and run automation.",
    cmd: "python backend/driver/main.py",
  },
  {
    title: "Run web interface",
    desc: "Optionally start the web app to play games in browser, visualize models, and review playbacks.",
    cmd: "cd frontend && npm install && npm run dev",
  },
];
