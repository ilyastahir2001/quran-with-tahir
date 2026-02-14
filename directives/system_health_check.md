# Directive: System Health Check

## Goal

Validate that the 3-layer architecture (Directives, Orchestration, Execution)
works end-to-end. This workflow ensures that directives can trigger
orchestration, which in turn successfully executes deterministic scripts and
produces expected outputs.

## Execution Tool

- **Script**: `execution/system_health_check.py`
- **Purpose**: A lightweight Python script that confirms environment readiness,
  checks for essential API keys in `.env`, and validates write access to the
  `.tmp/` directory.

## Expected Output

- **File**: `.tmp/health_check_report.json`
- **Format**: JSON object containing:
  - `status`: "pass" or "fail"
  - `timestamp`: ISO 8601 string
  - `checks`: A list of individual check results (e.g., "env_variables",
    "tmp_directory_writable").
  - `message`: A brief summary of the results.

## Orchestration Logic (Layer 2)

1. Read this directive to understand the requirements.
2. Ensure `execution/system_health_check.py` exists (or create a boilerplate if
   missing for testing).
3. Run the script using the Python executor.
4. Parse the resulting `.tmp/health_check_report.json`.
5. If `status` is "pass", report success to the user.
6. If `status` is "fail", analyze the `checks` list and propose fixes.

## Edge Case Handling

- **Missing Script**: If the execution script is missing, the Orchestrator
  should flag this as an execution layer failure.
- **Environment Failure**: If `.env` is missing critical keys, the script should
  return a "fail" status with details.
- **Write Permission Error**: If the script cannot write to `.tmp/`, it must log
  the error to stdout for the Orchestrator to capture.
