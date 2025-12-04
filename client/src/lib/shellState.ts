import { ParsedCommand } from "./commandParser";

export interface ShellState {
  environmentVars: Record<string, string>;
  currentWorkingDirectory: string;
  exitStatus: number;
  fileDescriptors: FileDescriptor[];
  processes: Process[];
  heredocFiles: string[];
}

export interface FileDescriptor {
  fd: number;
  type: "stdin" | "stdout" | "stderr" | "pipe_read" | "pipe_write" | "file_read" | "file_write";
  target?: string;
  status: "open" | "closed";
}

export interface Process {
  pid: number;
  type: "parent" | "child";
  command?: string;
  status: "running" | "waiting" | "completed";
}

export function getInitialState(): ShellState {
  return {
    environmentVars: {
      USER: "mansoor",
      HOME: "/home/mansoor",
      PATH: "/usr/local/bin:/usr/bin:/bin",
      PWD: "/home/mansoor/minishell",
      SHELL: "/home/mansoor/minishell/minishell",
    },
    currentWorkingDirectory: "/home/mansoor/minishell",
    exitStatus: 0,
    fileDescriptors: [
      { fd: 0, type: "stdin", target: "terminal", status: "open" },
      { fd: 1, type: "stdout", target: "terminal", status: "open" },
      { fd: 2, type: "stderr", target: "terminal", status: "open" },
    ],
    processes: [
      { pid: 1234, type: "parent", command: "minishell", status: "running" },
    ],
    heredocFiles: [],
  };
}

export function getStateAtStep(
  step: number,
  userCommand: ParsedCommand | null,
  initialState: ShellState
): ShellState {
  const state = JSON.parse(JSON.stringify(initialState)) as ShellState;

  if (!userCommand || !userCommand.isValid) {
    return state;
  }

  // Step 0-1: Initial state, no changes
  if (step <= 1) {
    return state;
  }

  // Step 2: Validation complete
  if (step === 2) {
    return state;
  }

  // Step 3: Variable expansion
  if (step >= 3) {
    // If command has export, add variables
    const exportCmd = userCommand.commands.find(
      (c) => c.name.toLowerCase() === "export"
    );
    if (exportCmd && exportCmd.args.length > 0) {
      exportCmd.args.forEach((arg) => {
        const [key, value] = arg.split("=");
        if (key && value) {
          state.environmentVars[key] = value.replace(/['"]/g, "");
        }
      });
    }

    // If command has unset, remove variables
    const unsetCmd = userCommand.commands.find(
      (c) => c.name.toLowerCase() === "unset"
    );
    if (unsetCmd && unsetCmd.args.length > 0) {
      unsetCmd.args.forEach((arg) => {
        delete state.environmentVars[arg];
      });
    }
  }

  // Step 4-5: Pipe setup
  if (step >= 4 && userCommand.hasPipes) {
    const pipeCount = userCommand.commands.length - 1;
    for (let i = 0; i < pipeCount; i++) {
      state.fileDescriptors.push({
        fd: 3 + i * 2,
        type: "pipe_read",
        target: `pipe_${i}`,
        status: "open",
      });
      state.fileDescriptors.push({
        fd: 4 + i * 2,
        type: "pipe_write",
        target: `pipe_${i}`,
        status: "open",
      });
    }
  }

  // Step 5: Heredoc setup
  if (step >= 5 && userCommand.hasHeredoc) {
    const heredocCmds = userCommand.commands.filter((c) =>
      c.redirections.some((r) => r.type === "<<")
    );
    heredocCmds.forEach((_, idx) => {
      state.heredocFiles.push(`/tmp/tmp_shell_${idx}`);
      state.fileDescriptors.push({
        fd: 10 + idx,
        type: "file_read",
        target: `/tmp/tmp_shell_${idx}`,
        status: "open",
      });
    });
  }

  // Step 6: File redirections
  if (step >= 6 && userCommand.hasRedirection) {
    let fdCounter = 20;
    userCommand.commands.forEach((cmd) => {
      cmd.redirections.forEach((redir) => {
        if (redir.type === "<") {
          state.fileDescriptors.push({
            fd: fdCounter++,
            type: "file_read",
            target: redir.target,
            status: "open",
          });
        } else if (redir.type === ">" || redir.type === ">>") {
          state.fileDescriptors.push({
            fd: fdCounter++,
            type: "file_write",
            target: redir.target,
            status: "open",
          });
        }
      });
    });
  }

  // Step 8-11: Process creation
  if (step >= 8 && step <= 11) {
    userCommand.commands.forEach((cmd, idx) => {
      if (!cmd.isBuiltIn || step >= 10) {
        state.processes.push({
          pid: 2000 + idx,
          type: "child",
          command: cmd.name,
          status: step === 11 ? "running" : "waiting",
        });
      }
    });
  }

  // Step 12: Waiting for children
  if (step >= 12) {
    state.processes.forEach((proc) => {
      if (proc.type === "child") {
        proc.status = "completed";
      }
    });
    state.exitStatus = 0; // Assume success
  }

  // Step 13: Cleanup heredoc
  if (step >= 13) {
    state.heredocFiles = [];
    state.fileDescriptors = state.fileDescriptors.filter(
      (fd) => !fd.target?.startsWith("/tmp/tmp_shell_")
    );
  }

  // Step 14: Close pipes and file redirections
  if (step >= 14) {
    state.fileDescriptors = state.fileDescriptors.filter(
      (fd) => fd.type === "stdin" || fd.type === "stdout" || fd.type === "stderr"
    );
  }

  // Handle cd command
  const cdCmd = userCommand.commands.find((c) => c.name.toLowerCase() === "cd");
  if (cdCmd && step >= 8) {
    const targetDir = cdCmd.args[0] || state.environmentVars.HOME;
    if (targetDir === "..") {
      const parts = state.currentWorkingDirectory.split("/");
      parts.pop();
      state.currentWorkingDirectory = parts.join("/") || "/";
    } else if (targetDir.startsWith("/")) {
      state.currentWorkingDirectory = targetDir;
    } else if (targetDir === "~") {
      state.currentWorkingDirectory = state.environmentVars.HOME;
    } else {
      state.currentWorkingDirectory = `${state.currentWorkingDirectory}/${targetDir}`;
    }
    state.environmentVars.PWD = state.currentWorkingDirectory;
  }

  return state;
}
