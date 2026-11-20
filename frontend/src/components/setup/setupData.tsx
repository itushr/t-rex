import { CodeCard } from "./CodeCard";
import type { TimelineEntry } from "../ui/timeline";

export const PROMPT_SETUP_TEXT = `Set up this project:
1. Clone the repository: \`git clone https://github.com/itushr/t-rex.git\`
2. Install Python driver dependencies: \`cd t-rex && pip install -r backend/driver/requirements.txt\`
3. Launch the driver orchestrator: \`python backend/driver/main.py\`
4. (Optional) Run frontend: \`cd frontend && npm install && npm run dev\``;

export const TIMELINE_DATA: TimelineEntry[] = [
  {
    title: "Clone repository",
    content: (
      <div>
        <p className="text-xs sm:text-sm text-muted-foreground mb-2">
          Clone the official repository to your local machine and enter the project folder.
        </p>
        <CodeCard title="Terminal" code="git clone https://github.com/itushr/t-rex.git && cd t-rex" isCommand />
      </div>
    ),
  },
  {
    title: "Install dependencies",
    content: (
      <div>
        <p className="text-xs sm:text-sm text-muted-foreground mb-2">
          Install Python packages for Chrome DevTools Protocol (CDP) automation and training.
        </p>
        <CodeCard title="Terminal" code="pip install -r backend/driver/requirements.txt" isCommand />
      </div>
    ),
  },
  {
    title: "Launch driver",
    content: (
      <div>
        <p className="text-xs sm:text-sm text-muted-foreground mb-2">
          Start the local Python backend orchestrator to record gameplay and run automation.
        </p>
        <CodeCard title="Terminal" code="python backend/driver/main.py" isCommand />
      </div>
    ),
  },
  {
    title: "Run web interface",
    content: (
      <div>
        <p className="text-xs sm:text-sm text-muted-foreground mb-2">
          Optionally start the web app to play games in browser, visualize models, and review playbacks.
        </p>
        <CodeCard title="Terminal" code="cd frontend && npm install && npm run dev" isCommand />
      </div>
    ),
  },
];
