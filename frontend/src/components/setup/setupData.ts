export interface ManualStep {
  title: string;
  desc: string;
  cmd: string;
}

export const PROMPT_SETUP_TEXT = `Set up this project:
1. Clone repository: \`git clone https://github.com/itushr/t-rex.git\`
2. Install Python driver dependencies: \`cd t-rex && pip install -r backend/driver/requirements.txt\`
3. Launch driver orchestrator: \`python backend/driver/main.py\`
4. (Optional) Run web app: \`cd frontend && npm install && npm run dev\``;

export const MANUAL_STEPS: ManualStep[] = [
  {
    title: "Create or clone project",
    desc: "Clone the official repository to your local machine and navigate into the `t-rex` folder.",
    cmd: "git clone https://github.com/itushr/t-rex.git && cd t-rex",
  },
  {
    title: "Install Python dependencies",
    desc: "Install Python packages for Chrome DevTools Protocol (`CDP`) automation and ML model training.",
    cmd: "pip install -r backend/driver/requirements.txt",
  },
  {
    title: "Launch driver orchestrator",
    desc: "Start the local Python backend orchestrator to record gameplay and run autonomous models.",
    cmd: "python backend/driver/main.py",
  },
  {
    title: "Run web interface",
    desc: "Optionally start the web application to play games in browser, visualize models, and review playbacks.",
    cmd: "cd frontend && npm install && npm run dev",
  },
];
