// Minishell v0.29 Execution Flow Steps with Enhanced Details
// Based on the latest version with Ctrl+C fixes, exit overflow handling, and full Norminette compliance

export interface FlowStepV029 {
  id: number;
  title: string;
  description: string;
  type: "start" | "process" | "decision" | "end";
  category: "control" | "parsing" | "execution" | "cleanup";
  module: string;
  file: string;
  
  // Enhanced detail fields
  inputData: string;
  outputData: string;
  dataStructures: {
    name: string;
    description: string;
    fields?: string[];
  }[];
  memoryOperations: {
    type: "malloc" | "free" | "realloc";
    description: string;
  }[];
  errorHandling: {
    condition: string;
    action: string;
  }[];
  edgeCases: string[];
  relatedFunctions: string[];
}

export const flowStepsV029: FlowStepV029[] = [
  {
    id: 0,
    title: "START: main()",
    description: "Entry point: Clear screen, print logo, initialize shell",
    type: "start",
    category: "control",
    module: "src/main/",
    file: "main.c",
    inputData: "argc, argv, envp (environment variables array)",
    outputData: "Exit status code (0-255)",
    dataStructures: [
      {
        name: "t_shell g_shell",
        description: "Global shell state structure",
        fields: ["env (char**)", "exit_status (int)", "should_exit (int)", "history_path (char*)"]
      }
    ],
    memoryOperations: [
      {
        type: "malloc",
        description: "Allocate environment variables copy"
      }
    ],
    errorHandling: [],
    edgeCases: [
      "Empty environment (envp == NULL)",
      "Memory allocation failure during init"
    ],
    relatedFunctions: ["init_shell", "setup_signals", "history_init", "shell_loop"]
  },
  {
    id: 1,
    title: "init_shell()",
    description: "Initialize shell structure with environment variables",
    type: "process",
    category: "control",
    module: "src/core/",
    file: "shell_utils.c",
    inputData: "t_shell *shell, char **envp",
    outputData: "Initialized shell structure",
    dataStructures: [
      {
        name: "t_shell",
        description: "Main shell state",
        fields: ["env", "exit_status", "should_exit", "history_path"]
      }
    ],
    memoryOperations: [
      {
        type: "malloc",
        description: "Deep copy of environment variables array"
      },
      {
        type: "malloc",
        description: "Allocate each environment string"
      }
    ],
    errorHandling: [
      {
        condition: "malloc fails",
        action: "Exit with error code"
      }
    ],
    edgeCases: [
      "Empty environment",
      "Very large environment (1000+ variables)"
    ],
    relatedFunctions: ["copy_env", "ft_strdup", "ft_split"]
  },
  {
    id: 2,
    title: "setup_signals()",
    description: "Configure signal handlers for SIGINT (Ctrl+C) and SIGQUIT (Ctrl+\\)",
    type: "process",
    category: "control",
    module: "src/signals/",
    file: "signals.c",
    inputData: "None",
    outputData: "Signal handlers configured",
    dataStructures: [
      {
        name: "struct sigaction",
        description: "Signal action structure for custom handlers"
      },
      {
        name: "struct termios",
        description: "Terminal settings (ECHOCTL disabled to hide ^C)"
      }
    ],
    memoryOperations: [],
    errorHandling: [
      {
        condition: "signal() fails",
        action: "Continue with default signal handling"
      }
    ],
    edgeCases: [
      "Ctrl+C during heredoc input",
      "Ctrl+C during command execution",
      "Ctrl+\\ should be ignored"
    ],
    relatedFunctions: ["handle_sigint", "tcgetattr", "tcsetattr"]
  },
  {
    id: 3,
    title: "history_init()",
    description: "Initialize command history from ~/.minishell_history file",
    type: "process",
    category: "control",
    module: "src/history/",
    file: "history.c",
    inputData: "t_shell *shell",
    outputData: "History loaded into readline",
    dataStructures: [
      {
        name: "HIST_ENTRY",
        description: "Readline history entry structure"
      }
    ],
    memoryOperations: [
      {
        type: "malloc",
        description: "Allocate history_path string"
      }
    ],
    errorHandling: [
      {
        condition: "History file doesn't exist",
        action: "Create new empty history file"
      },
      {
        condition: "Cannot read history file",
        action: "Continue without history"
      }
    ],
    edgeCases: [
      "History file corrupted",
      "No HOME environment variable",
      "History file too large (10000+ entries)"
    ],
    relatedFunctions: ["read_history", "using_history", "getenv"]
  },
  {
    id: 4,
    title: "shell_loop()",
    description: "Main REPL loop: Read, Evaluate, Print, Loop",
    type: "process",
    category: "control",
    module: "src/core/",
    file: "shell_loop.c",
    inputData: "t_shell *shell",
    outputData: "Continuous command processing until exit",
    dataStructures: [
      {
        name: "char *line",
        description: "Current input line from readline"
      }
    ],
    memoryOperations: [
      {
        type: "malloc",
        description: "readline allocates line buffer"
      },
      {
        type: "free",
        description: "Free line after processing"
      }
    ],
    errorHandling: [
      {
        condition: "readline returns NULL (EOF/Ctrl+D)",
        action: "Print 'exit' and break loop"
      },
      {
        condition: "SIGINT received (exit_status == 130)",
        action: "Continue to next prompt"
      }
    ],
    edgeCases: [
      "Empty line (just Enter)",
      "Line with only whitespace",
      "EOF (Ctrl+D) on empty line",
      "Very long line (10000+ characters)"
    ],
    relatedFunctions: ["read_logical_line", "handle_empty_line", "process_line", "is_all_space"]
  },
  {
    id: 5,
    title: "read_logical_line()",
    description: "Read user input using readline library with prompt",
    type: "process",
    category: "parsing",
    module: "src/core/",
    file: "read_logical_line.c",
    inputData: "None",
    outputData: "char *line (user input string)",
    dataStructures: [
      {
        name: "char *line",
        description: "Dynamically allocated string from readline"
      }
    ],
    memoryOperations: [
      {
        type: "malloc",
        description: "readline internally allocates buffer"
      }
    ],
    errorHandling: [
      {
        condition: "readline returns NULL",
        action: "Return NULL to signal EOF"
      }
    ],
    edgeCases: [
      "Ctrl+D (EOF)",
      "Ctrl+C during input",
      "Very long input (buffer overflow protection)",
      "Unicode characters in input"
    ],
    relatedFunctions: ["readline", "rl_on_new_line", "rl_replace_line"]
  },
  {
    id: 6,
    title: "Empty line check",
    description: "Check if line is NULL (EOF) or empty/whitespace only",
    type: "decision",
    category: "parsing",
    module: "src/core/",
    file: "shell_loop.c",
    inputData: "char *line",
    outputData: "0 (exit), 1 (continue), 2 (process)",
    dataStructures: [],
    memoryOperations: [],
    errorHandling: [
      {
        condition: "line == NULL && exit_status == 130",
        action: "Continue (Ctrl+C case)"
      },
      {
        condition: "line == NULL",
        action: "Print 'exit' and return 0"
      }
    ],
    edgeCases: [
      "Line with only spaces/tabs",
      "Line with only newlines",
      "NULL after Ctrl+C"
    ],
    relatedFunctions: ["is_all_space", "ft_isspace"]
  },
  {
    id: 7,
    title: "history_add_line()",
    description: "Add non-empty line to command history",
    type: "process",
    category: "parsing",
    module: "src/history/",
    file: "history.c",
    inputData: "char *line",
    outputData: "Line added to history",
    dataStructures: [
      {
        name: "HIST_ENTRY",
        description: "New history entry in readline"
      }
    ],
    memoryOperations: [
      {
        type: "malloc",
        description: "readline duplicates line for history"
      }
    ],
    errorHandling: [],
    edgeCases: [
      "Duplicate of previous command",
      "Very long command (truncation)",
      "Commands with special characters"
    ],
    relatedFunctions: ["add_history"]
  },
  {
    id: 8,
    title: "process_line()",
    description: "Main processing: tokenize → parse → expand → execute",
    type: "process",
    category: "parsing",
    module: "src/core/",
    file: "shell_utils.c",
    inputData: "char *line, t_shell *shell",
    outputData: "Command executed, exit_status updated",
    dataStructures: [
      {
        name: "t_pipeline",
        description: "Pipeline structure containing commands"
      }
    ],
    memoryOperations: [
      {
        type: "malloc",
        description: "Allocate pipeline structure"
      },
      {
        type: "free",
        description: "Free pipeline after execution"
      }
    ],
    errorHandling: [
      {
        condition: "Tokenization fails",
        action: "Return without execution"
      },
      {
        condition: "Syntax error",
        action: "Set exit_status = 258"
      }
    ],
    edgeCases: [
      "Multiple semicolons (cmd1; cmd2; cmd3)",
      "Mixed pipes and semicolons",
      "Empty command between semicolons"
    ],
    relatedFunctions: ["process_tokens", "expander", "executor", "free_pipeline"]
  },
  {
    id: 9,
    title: "check_unclosed_quotes()",
    description: "Validate quote pairing before tokenization",
    type: "decision",
    category: "parsing",
    module: "src/lexer/",
    file: "lexer_quotes.c",
    inputData: "char *line",
    outputData: "1 (valid), 0 (unclosed quotes)",
    dataStructures: [],
    memoryOperations: [],
    errorHandling: [
      {
        condition: "Unclosed single quote",
        action: "Print error, return 0"
      },
      {
        condition: "Unclosed double quote",
        action: "Print error, return 0"
      }
    ],
    edgeCases: [
      "Escaped quotes (\\\")",
      "Quotes inside quotes ('\"')",
      "Empty quotes ('' or \"\")"
    ],
    relatedFunctions: ["has_unclosed_quotes", "ft_putendl_fd"]
  },
  {
    id: 10,
    title: "lexer()",
    description: "Tokenize input into tokens (words, operators, redirections)",
    type: "process",
    category: "parsing",
    module: "src/lexer/",
    file: "lexer.c",
    inputData: "char *line",
    outputData: "t_token *tokens (linked list)",
    dataStructures: [
      {
        name: "t_token",
        description: "Token node",
        fields: ["type (WORD, PIPE, REDIR_IN, REDIR_OUT, etc.)", "value (char*)", "next (t_token*)"]
      }
    ],
    memoryOperations: [
      {
        type: "malloc",
        description: "Allocate each token node"
      },
      {
        type: "malloc",
        description: "Duplicate token value string"
      }
    ],
    errorHandling: [
      {
        condition: "malloc fails",
        action: "Free partial token list, return NULL"
      }
    ],
    edgeCases: [
      "Multiple spaces between tokens",
      "Tabs and mixed whitespace",
      "Special characters ($, *, ?, etc.)",
      "Operators without spaces (cat<file.txt)"
    ],
    relatedFunctions: ["tokenize", "create_token", "add_token"]
  },
  {
    id: 11,
    title: "validate_syntax()",
    description: "Check for syntax errors (invalid operators, unclosed quotes)",
    type: "decision",
    category: "parsing",
    module: "src/parser/",
    file: "parser_syntax.c",
    inputData: "t_token *tokens",
    outputData: "1 (valid), 0 (syntax error)",
    dataStructures: [],
    memoryOperations: [],
    errorHandling: [
      {
        condition: "Starts with semicolon",
        action: "Print 'syntax error near unexpected token `;''"
      },
      {
        condition: "Pipe at start/end",
        action: "Print 'syntax error near unexpected token `|''"
      },
      {
        condition: "Redirection without target",
        action: "Print 'syntax error near unexpected token `newline''"
      },
      {
        condition: "Double operators (|| or &&)",
        action: "Print syntax error"
      }
    ],
    edgeCases: [
      "Empty command before/after pipe",
      "Multiple redirections (< file1 < file2)",
      "Redirection to empty string"
    ],
    relatedFunctions: ["check_syntax_errors", "ft_putendl_fd"]
  },
  {
    id: 12,
    title: "parser()",
    description: "Build pipeline structure from token list",
    type: "process",
    category: "parsing",
    module: "src/parser/",
    file: "parser.c",
    inputData: "t_token *tokens",
    outputData: "t_pipeline *pipeline",
    dataStructures: [
      {
        name: "t_pipeline",
        description: "Pipeline structure",
        fields: ["commands (t_cmd**)", "cmd_count (int)", "has_pipe (int)"]
      },
      {
        name: "t_cmd",
        description: "Command structure",
        fields: ["argv (char**)", "argc (int)", "redirections (t_redir*)", "next (t_cmd*)"]
      },
      {
        name: "t_redir",
        description: "Redirection structure",
        fields: ["type (<, >, >>, <<)", "file (char*)", "next (t_redir*)"]
      }
    ],
    memoryOperations: [
      {
        type: "malloc",
        description: "Allocate pipeline structure"
      },
      {
        type: "malloc",
        description: "Allocate command structures"
      },
      {
        type: "malloc",
        description: "Allocate argv arrays"
      }
    ],
    errorHandling: [
      {
        condition: "malloc fails",
        action: "Free partial structures, return NULL"
      }
    ],
    edgeCases: [
      "Command with no arguments",
      "Only redirections, no command",
      "Multiple pipes (cmd1 | cmd2 | cmd3)"
    ],
    relatedFunctions: ["build_pipeline", "create_command", "add_redirection"]
  },
  {
    id: 13,
    title: "expander()",
    description: "Expand variables ($VAR, $?), remove quotes, handle wildcards",
    type: "process",
    category: "execution",
    module: "src/expander/",
    file: "expander.c",
    inputData: "t_pipeline *pipeline, char **env",
    outputData: "Expanded pipeline (variables replaced, quotes removed)",
    dataStructures: [
      {
        name: "char *expanded",
        description: "Expanded string for each argument"
      }
    ],
    memoryOperations: [
      {
        type: "malloc",
        description: "Allocate expanded strings"
      },
      {
        type: "free",
        description: "Free original strings"
      }
    ],
    errorHandling: [
      {
        condition: "Variable not found",
        action: "Replace with empty string"
      },
      {
        condition: "malloc fails",
        action: "Return with partial expansion"
      }
    ],
    edgeCases: [
      "$? (exit status)",
      "$$ (process ID - not implemented)",
      "$VAR inside single quotes (no expansion)",
      "$VAR inside double quotes (expand)",
      "Undefined variable",
      "Empty variable value",
      "Wildcard * with no matches"
    ],
    relatedFunctions: ["expand_variables", "expand_wildcards", "remove_quotes", "getenv"]
  },
  {
    id: 14,
    title: "executor()",
    description: "Execute pipeline: setup pipes, fork processes, run commands",
    type: "process",
    category: "execution",
    module: "src/executor/",
    file: "executor.c",
    inputData: "t_pipeline *pipeline, t_shell *shell",
    outputData: "Commands executed, exit_status updated",
    dataStructures: [
      {
        name: "int pipe_fds[2]",
        description: "Pipe file descriptors for inter-process communication"
      },
      {
        name: "pid_t pids[]",
        description: "Array of child process IDs"
      }
    ],
    memoryOperations: [
      {
        type: "malloc",
        description: "Allocate pids array"
      }
    ],
    errorHandling: [
      {
        condition: "pipe() fails",
        action: "Print error, skip command"
      },
      {
        condition: "fork() fails",
        action: "Print error, exit"
      }
    ],
    edgeCases: [
      "Single command (no pipes)",
      "Multiple pipes (cmd1 | cmd2 | cmd3)",
      "Builtin in pipeline (must fork)",
      "Failed command in middle of pipeline"
    ],
    relatedFunctions: ["setup_pipeline", "execute_pipeline", "cleanup_pipeline"]
  },
  {
    id: 15,
    title: "Is built-in?",
    description: "Check if command is a shell built-in",
    type: "decision",
    category: "execution",
    module: "src/executor/",
    file: "executor_commands.c",
    inputData: "char *cmd",
    outputData: "1 (builtin), 0 (external)",
    dataStructures: [],
    memoryOperations: [],
    errorHandling: [],
    edgeCases: [
      "Case sensitivity (CD vs cd)",
      "Builtin with path (/bin/echo)",
      "Empty command name"
    ],
    relatedFunctions: ["is_builtin", "ft_strcmp"]
  },
  {
    id: 16,
    title: "execute_builtin()",
    description: "Execute built-in command in parent process",
    type: "process",
    category: "execution",
    module: "src/builtins/",
    file: "builtins.c",
    inputData: "t_cmd *cmd, t_shell *shell",
    outputData: "Exit status from builtin",
    dataStructures: [],
    memoryOperations: [
      {
        type: "malloc",
        description: "cd: allocate new PWD value"
      },
      {
        type: "malloc",
        description: "export: allocate new env variable"
      },
      {
        type: "free",
        description: "unset: free removed env variable"
      }
    ],
    errorHandling: [
      {
        condition: "cd: directory not found",
        action: "Print error, return 1"
      },
      {
        condition: "export: invalid identifier",
        action: "Print error, return 1"
      },
      {
        condition: "exit: numeric overflow",
        action: "Print 'numeric argument required', exit 255"
      },
      {
        condition: "exit: too many arguments",
        action: "Print 'too many arguments', return 1 (don't exit)"
      }
    ],
    edgeCases: [
      "cd with no arguments (go to HOME)",
      "cd - (go to OLDPWD)",
      "export without arguments (print all)",
      "exit with overflow (999999999999999999)",
      "exit with multiple args (exit 1 2 3)",
      "echo -n (no newline)",
      "unset PATH (remove critical variable)"
    ],
    relatedFunctions: ["builtin_cd", "builtin_echo", "builtin_export", "builtin_unset", "builtin_env", "builtin_exit", "builtin_pwd"]
  },
  {
    id: 17,
    title: "execute_external()",
    description: "Fork child process and execute external command via execve()",
    type: "process",
    category: "execution",
    module: "src/executor/",
    file: "executor_external.c",
    inputData: "t_cmd *cmd, t_shell *shell",
    outputData: "Child process created and executed",
    dataStructures: [
      {
        name: "pid_t pid",
        description: "Child process ID"
      },
      {
        name: "char *path",
        description: "Full path to executable"
      }
    ],
    memoryOperations: [
      {
        type: "malloc",
        description: "Allocate path string"
      }
    ],
    errorHandling: [
      {
        condition: "fork() fails",
        action: "Print error, return"
      },
      {
        condition: "Command not found",
        action: "Print 'command not found', exit 127"
      },
      {
        condition: "execve() fails",
        action: "Print error, exit 126 (permission denied)"
      }
    ],
    edgeCases: [
      "Command with absolute path (/bin/ls)",
      "Command with relative path (./script.sh)",
      "Command not in PATH",
      "Non-executable file",
      "Binary file without execute permission"
    ],
    relatedFunctions: ["fork", "execve", "find_command_path", "access"]
  },
  {
    id: 18,
    title: "wait_pipeline()",
    description: "Wait for all child processes to complete",
    type: "process",
    category: "cleanup",
    module: "src/executor/",
    file: "executor_pipeline.c",
    inputData: "t_pipeline *pipeline, t_shell *shell",
    outputData: "Exit status from last command",
    dataStructures: [
      {
        name: "int status",
        description: "Wait status from waitpid()"
      }
    ],
    memoryOperations: [],
    errorHandling: [
      {
        condition: "Child terminated by signal",
        action: "Set exit_status = 128 + signal_number"
      },
      {
        condition: "Ctrl+C during execution",
        action: "Set exit_status = 130"
      }
    ],
    edgeCases: [
      "Child process killed by SIGKILL",
      "Child process stopped (SIGSTOP)",
      "Multiple children exit with different statuses"
    ],
    relatedFunctions: ["wait", "waitpid", "WIFEXITED", "WEXITSTATUS", "WIFSIGNALED", "WTERMSIG"]
  },
  {
    id: 19,
    title: "free_pipeline()",
    description: "Free all allocated memory for pipeline structure",
    type: "process",
    category: "cleanup",
    module: "src/parser/",
    file: "parser_free.c",
    inputData: "t_pipeline *pipeline",
    outputData: "All memory freed",
    dataStructures: [],
    memoryOperations: [
      {
        type: "free",
        description: "Free command argv arrays"
      },
      {
        type: "free",
        description: "Free redirection structures"
      },
      {
        type: "free",
        description: "Free command structures"
      },
      {
        type: "free",
        description: "Free pipeline structure"
      }
    ],
    errorHandling: [],
    edgeCases: [
      "NULL pipeline",
      "Partially allocated pipeline (malloc failed mid-way)"
    ],
    relatedFunctions: ["free_commands", "free_redirections", "free"]
  },
  {
    id: 20,
    title: "LOOP BACK",
    description: "Return to shell_loop() for next command",
    type: "end",
    category: "control",
    module: "src/core/",
    file: "shell_loop.c",
    inputData: "None",
    outputData: "Ready for next command",
    dataStructures: [],
    memoryOperations: [],
    errorHandling: [],
    edgeCases: [
      "Exit command (should_exit = 1)",
      "EOF (Ctrl+D)",
      "Fatal error (exit immediately)"
    ],
    relatedFunctions: ["shell_loop"]
  }
];
