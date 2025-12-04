export interface ErrorScenario {
  id: string;
  category: "syntax" | "memory" | "signals" | "exit" | "redirections" | "pipes" | "builtins" | "quotes";
  title: string;
  description: string;
  command: string;
  expectedBehavior: string;
  errorMessage: string;
  exitCode: number;
  affectedSteps: number[];
  recoveryAction: string;
  v029Fix?: string;
}

export const errorScenarios: ErrorScenario[] = [
  // Syntax Errors
  {
    id: "syntax-unclosed-quote",
    category: "syntax",
    title: "Unclosed Quote",
    description: "Command with an unclosed single or double quote",
    command: 'echo "hello world',
    expectedBehavior: "Shell should detect unclosed quote during lexing and reject the command",
    errorMessage: "minishell: syntax error: unclosed quote",
    exitCode: 2,
    affectedSteps: [10, 11],
    recoveryAction: "Return to prompt without executing, preserve shell state",
  },
  {
    id: "syntax-empty-pipe",
    category: "syntax",
    title: "Empty Pipe",
    description: "Pipe operator without command on one side",
    command: "cat | ",
    expectedBehavior: "Parser should detect missing command after pipe",
    errorMessage: "minishell: syntax error near unexpected token `|'",
    exitCode: 2,
    affectedSteps: [11, 12],
    recoveryAction: "Reject command, return to prompt",
  },
  {
    id: "syntax-double-pipe",
    category: "syntax",
    title: "Double Pipe",
    description: "Two consecutive pipe operators",
    command: "echo hello || cat",
    expectedBehavior: "Parser should detect invalid pipe sequence (|| is not supported)",
    errorMessage: "minishell: syntax error near unexpected token `||'",
    exitCode: 2,
    affectedSteps: [11, 12],
    recoveryAction: "Reject command, return to prompt",
  },
  {
    id: "syntax-invalid-redirection",
    category: "redirections",
    title: "Redirection Without File",
    description: "Redirection operator without target file",
    command: "echo hello >",
    expectedBehavior: "Parser should detect missing filename after redirection",
    errorMessage: "minishell: syntax error near unexpected token `newline'",
    exitCode: 2,
    affectedSteps: [11, 12],
    recoveryAction: "Reject command, return to prompt",
  },
  
  // Exit Command Errors (v0.29 specific)
  {
    id: "exit-overflow",
    category: "exit",
    title: "Exit Numeric Overflow",
    description: "Exit with number exceeding long long range",
    command: "exit 99999999999999999999",
    expectedBehavior: "Detect numeric overflow and show error",
    errorMessage: "minishell: exit: 99999999999999999999: numeric argument required",
    exitCode: 2,
    affectedSteps: [16],
    recoveryAction: "Exit shell with code 2",
    v029Fix: "Added overflow detection in exit builtin",
  },
  {
    id: "exit-too-many-args",
    category: "exit",
    title: "Exit Too Many Arguments",
    description: "Exit command with multiple arguments",
    command: "exit 9 9 8 7",
    expectedBehavior: "Detect multiple arguments and show error",
    errorMessage: "minishell: exit: too many arguments",
    exitCode: 1,
    affectedSteps: [16],
    recoveryAction: "Do not exit, return to prompt with exit code 1",
    v029Fix: "Proper argument count validation",
  },
  {
    id: "exit-non-numeric",
    category: "exit",
    title: "Exit Non-Numeric Argument",
    description: "Exit with non-numeric argument",
    command: "exit hello",
    expectedBehavior: "Detect non-numeric argument",
    errorMessage: "minishell: exit: hello: numeric argument required",
    exitCode: 2,
    affectedSteps: [16],
    recoveryAction: "Exit shell with code 2",
  },
  
  // Signal Handling (v0.29 specific)
  {
    id: "signal-ctrl-c",
    category: "signals",
    title: "Ctrl+C During Command",
    description: "User presses Ctrl+C while command is running",
    command: "sleep 10",
    expectedBehavior: "Interrupt command, no ^C displayed (ECHOCTL disabled)",
    errorMessage: "",
    exitCode: 130,
    affectedSteps: [15, 16, 17],
    recoveryAction: "Kill child process, return to prompt with exit code 130",
    v029Fix: "ECHOCTL disabled to prevent ^C display",
  },
  {
    id: "signal-ctrl-c-heredoc",
    category: "signals",
    title: "Ctrl+C During Heredoc",
    description: "User presses Ctrl+C while entering heredoc input",
    command: "cat << EOF",
    expectedBehavior: "Abort heredoc input, clean up temp file",
    errorMessage: "",
    exitCode: 130,
    affectedSteps: [14],
    recoveryAction: "Delete temporary heredoc file, return to prompt",
    v029Fix: "Proper signal handling in heredoc with cleanup",
  },
  
  // Redirection Errors
  {
    id: "redir-permission-denied",
    category: "redirections",
    title: "Permission Denied",
    description: "Redirect output to file without write permission",
    command: "echo hello > /etc/readonly",
    expectedBehavior: "Detect permission error when opening file",
    errorMessage: "minishell: /etc/readonly: Permission denied",
    exitCode: 1,
    affectedSteps: [15],
    recoveryAction: "Skip command execution, set exit code to 1",
  },
  {
    id: "redir-no-such-file",
    category: "redirections",
    title: "Input File Not Found",
    description: "Redirect input from non-existent file",
    command: "cat < nonexistent.txt",
    expectedBehavior: "Detect missing file when opening for input",
    errorMessage: "minishell: nonexistent.txt: No such file or directory",
    exitCode: 1,
    affectedSteps: [15],
    recoveryAction: "Skip command execution, set exit code to 1",
  },
  {
    id: "redir-ambiguous",
    category: "redirections",
    title: "Ambiguous Redirect",
    description: "Redirect with wildcard expanding to multiple files",
    command: "echo hello > *.txt",
    expectedBehavior: "Detect ambiguous redirect (multiple matches)",
    errorMessage: "minishell: *.txt: ambiguous redirect",
    exitCode: 1,
    affectedSteps: [13, 15],
    recoveryAction: "Skip command execution, set exit code to 1",
  },
  
  // Pipe Errors
  {
    id: "pipe-broken",
    category: "pipes",
    title: "Broken Pipe",
    description: "Write to pipe when reader has closed",
    command: "yes | head -1",
    expectedBehavior: "SIGPIPE signal sent to writer, handled gracefully",
    errorMessage: "",
    exitCode: 141,
    affectedSteps: [14, 15, 16],
    recoveryAction: "Writer process terminates with SIGPIPE (141), reader completes normally",
  },
  
  // Builtin Errors
  {
    id: "cd-no-such-dir",
    category: "builtins",
    title: "CD to Non-Existent Directory",
    description: "Change directory to path that doesn't exist",
    command: "cd /nonexistent/path",
    expectedBehavior: "Detect directory doesn't exist",
    errorMessage: "minishell: cd: /nonexistent/path: No such file or directory",
    exitCode: 1,
    affectedSteps: [16],
    recoveryAction: "Stay in current directory, set exit code to 1",
  },
  {
    id: "cd-not-a-directory",
    category: "builtins",
    title: "CD to File",
    description: "Try to change directory to a regular file",
    command: "cd /etc/passwd",
    expectedBehavior: "Detect target is not a directory",
    errorMessage: "minishell: cd: /etc/passwd: Not a directory",
    exitCode: 1,
    affectedSteps: [16],
    recoveryAction: "Stay in current directory, set exit code to 1",
  },
  {
    id: "export-invalid-identifier",
    category: "builtins",
    title: "Export Invalid Variable Name",
    description: "Export with invalid identifier (starts with number)",
    command: "export 123VAR=value",
    expectedBehavior: "Detect invalid identifier",
    errorMessage: "minishell: export: `123VAR=value': not a valid identifier",
    exitCode: 1,
    affectedSteps: [16],
    recoveryAction: "Skip this export, continue with next arguments if any",
  },
  {
    id: "unset-invalid-identifier",
    category: "builtins",
    title: "Unset Invalid Variable Name",
    description: "Unset with invalid identifier",
    command: "unset 123VAR",
    expectedBehavior: "Detect invalid identifier",
    errorMessage: "minishell: unset: `123VAR': not a valid identifier",
    exitCode: 1,
    affectedSteps: [16],
    recoveryAction: "Skip this unset, continue with next arguments if any",
  },
  
  // Memory Errors
  {
    id: "memory-malloc-fail",
    category: "memory",
    title: "Memory Allocation Failure",
    description: "Simulate malloc failure during token creation",
    command: "echo " + "a".repeat(1000),
    expectedBehavior: "Detect malloc failure and handle gracefully",
    errorMessage: "minishell: memory allocation failed",
    exitCode: 1,
    affectedSteps: [10, 11, 12],
    recoveryAction: "Free any partially allocated memory, return to prompt",
  },
  
  // Quote Handling
  {
    id: "quotes-mixed",
    category: "quotes",
    title: "Mixed Quotes",
    description: "Command with nested and mixed quotes",
    command: 'echo "hello \'world\'"',
    expectedBehavior: "Properly handle mixed quotes (single inside double)",
    errorMessage: "",
    exitCode: 0,
    affectedSteps: [10, 11],
    recoveryAction: "Execute normally: echo hello 'world'",
  },
  {
    id: "quotes-empty",
    category: "quotes",
    title: "Empty Quotes",
    description: "Command with empty quoted strings",
    command: "echo \"\" '' \"\"",
    expectedBehavior: "Treat empty quotes as empty arguments",
    errorMessage: "",
    exitCode: 0,
    affectedSteps: [10, 11],
    recoveryAction: "Execute with empty string arguments",
  },
  
  // Command Not Found
  {
    id: "exec-command-not-found",
    category: "builtins",
    title: "Command Not Found",
    description: "Execute non-existent command",
    command: "nonexistentcommand123",
    expectedBehavior: "Search PATH, fail to find command",
    errorMessage: "minishell: nonexistentcommand123: command not found",
    exitCode: 127,
    affectedSteps: [15, 17],
    recoveryAction: "Return exit code 127, continue shell",
  },
  {
    id: "exec-permission-denied",
    category: "builtins",
    title: "Permission Denied on Executable",
    description: "Try to execute file without execute permission",
    command: "./noexec.sh",
    expectedBehavior: "Detect lack of execute permission",
    errorMessage: "minishell: ./noexec.sh: Permission denied",
    exitCode: 126,
    affectedSteps: [15, 17],
    recoveryAction: "Return exit code 126, continue shell",
  },
  
  // Semicolon Operator
  {
    id: "semicolon-empty",
    category: "syntax",
    title: "Empty Command in Semicolon Sequence",
    description: "Semicolon with empty command",
    command: "echo hello; ; echo world",
    expectedBehavior: "Detect empty command between semicolons",
    errorMessage: "minishell: syntax error near unexpected token `;'",
    exitCode: 2,
    affectedSteps: [11, 12],
    recoveryAction: "Reject entire command line, return to prompt",
  },
  {
    id: "semicolon-sequence",
    category: "syntax",
    title: "Multiple Commands with Semicolon",
    description: "Execute multiple commands sequentially",
    command: "echo first; echo second; echo third",
    expectedBehavior: "Execute each command in sequence, independent exit codes",
    errorMessage: "",
    exitCode: 0,
    affectedSteps: [12, 13, 14, 15, 16, 17],
    recoveryAction: "Execute all commands, final exit code is from last command",
  },
];

export const getCategorizedScenarios = () => {
  const categories = {
    syntax: errorScenarios.filter(s => s.category === "syntax"),
    exit: errorScenarios.filter(s => s.category === "exit"),
    signals: errorScenarios.filter(s => s.category === "signals"),
    redirections: errorScenarios.filter(s => s.category === "redirections"),
    pipes: errorScenarios.filter(s => s.category === "pipes"),
    builtins: errorScenarios.filter(s => s.category === "builtins"),
    memory: errorScenarios.filter(s => s.category === "memory"),
    quotes: errorScenarios.filter(s => s.category === "quotes"),
  };
  return categories;
};

export const getScenarioById = (id: string) => {
  return errorScenarios.find(s => s.id === id);
};
