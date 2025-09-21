import { json } from "@sveltejs/kit";
import { spawn } from "child_process";
import type { RequestHandler } from "./$types";

// Sample scripts data - in a real app this would come from a database
type ScriptItem = {
  id: number;
  name: string;
  description: string;
  path: string;
  lastRun: string | null;
  status: "ready" | "running" | "error";
};

const scripts: ScriptItem[] = [
  {
    id: 1,
    name: "data_analysis.py",
    description: "Analyze sales data and generate reports",
    path: "./scripts/data_analysis.py",
    lastRun: null,
    status: "ready",
  },
  {
    id: 2,
    name: "backup_database.py",
    description: "Create backup of the main database",
    path: "./scripts/backup_database.py",
    lastRun: null,
    status: "ready",
  },
  {
    id: 3,
    name: "send_notifications.py",
    description: "Send daily notification emails",
    path: "./scripts/send_notifications.py",
    lastRun: null,
    status: "ready",
  },
];

export const GET: RequestHandler = async () => {
  return json(scripts);
};

export const POST: RequestHandler = async ({ request }) => {
  const { scriptId, action } = await request.json();

  if (action === "run") {
    const script = scripts.find((s) => s.id === scriptId);
    if (!script) {
      return json({ error: "Script not found" }, { status: 404 });
    }

    try {
      // Execute Python script
      const result = await executeScript(script.path);

      // Update last run time
      script.lastRun = new Date().toISOString();

      return json({
        success: true,
        output: result.output,
        error: result.error,
        exitCode: result.exitCode,
        script: script,
      });
    } catch (error) {
      return json(
        {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
          script: script,
        },
        { status: 500 }
      );
    }
  }

  return json({ error: "Invalid action" }, { status: 400 });
};

function executeScript(
  scriptPath: string
): Promise<{ output: string; error: string; exitCode: number }> {
  return new Promise((resolve) => {
    const python = spawn("python", [scriptPath]);
    let output = "";
    let error = "";

    python.stdout.on("data", (data) => {
      output += data.toString();
    });

    python.stderr.on("data", (data) => {
      error += data.toString();
    });

    python.on("close", (code) => {
      resolve({
        output,
        error,
        exitCode: code || 0,
      });
    });

    // Set a timeout for script execution
    setTimeout(() => {
      python.kill();
      resolve({
        output,
        error: error + "\nScript execution timed out after 30 seconds",
        exitCode: -1,
      });
    }, 30000);
  });
}
