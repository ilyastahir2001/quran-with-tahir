import os
import json
from datetime import datetime

def run_health_check():
    report_path = os.path.join(".tmp", "health_check_report.json")
    results = {
        "status": "pass",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "checks": [],
        "message": ""
    }
    
    # Check 1: Environment Variables in .env
    env_vars_check = {"name": "environment_variables", "status": "pass", "details": ""}
    required_vars = ["VITE_SUPABASE_URL", "VITE_SUPABASE_PUBLISHABLE_KEY", "VITE_SUPABASE_PROJECT_ID"]
    
    if not os.path.exists(".env"):
        env_vars_check["status"] = "fail"
        env_vars_check["details"] = ".env file missing"
    else:
        with open(".env", "r") as f:
            env_content = f.read()
            missing = [var for var in required_vars if var not in env_content]
            if missing:
                env_vars_check["status"] = "fail"
                env_vars_check["details"] = f"Missing variables: {', '.join(missing)}"
    
    results["checks"].append(env_vars_check)
    if env_vars_check["status"] == "fail":
        results["status"] = "fail"

    # Check 2: .tmp Directory Writable
    tmp_dir_check = {"name": "tmp_directory_writable", "status": "pass", "details": ""}
    tmp_dir = ".tmp"
    
    if not os.path.exists(tmp_dir):
        try:
            os.makedirs(tmp_dir)
            tmp_dir_check["details"] = ".tmp directory created"
        except Exception as e:
            tmp_dir_check["status"] = "fail"
            tmp_dir_check["details"] = f"Could not create .tmp directory: {str(e)}"
    
    if tmp_dir_check["status"] == "pass":
        test_file = os.path.join(tmp_dir, "test_write.txt")
        try:
            with open(test_file, "w") as f:
                f.write("test")
            os.remove(test_file)
            tmp_dir_check["details"] = ".tmp directory is writable"
        except Exception as e:
            tmp_dir_check["status"] = "fail"
            tmp_dir_check["details"] = f"Could not write to .tmp directory: {str(e)}"
            
    results["checks"].append(tmp_dir_check)
    if tmp_dir_check["status"] == "fail":
        results["status"] = "fail"

    # Final Message
    if results["status"] == "pass":
        results["message"] = "All system health checks passed."
    else:
        results["message"] = "Some system health checks failed. See checks for details."

    # Write Report
    try:
        with open(report_path, "w") as f:
            json.dump(results, f, indent=2)
    except Exception as e:
        print(f"FAILED_TO_WRITE_REPORT: {str(e)}")
        # If we can't write the report, we still output failure to stdout
        results["status"] = "fail"
        results["message"] = f"Critical failure: Could not write report: {str(e)}"
        print(json.dumps(results))
        return

    print(f"Health check complete. Status: {results['status']}")

if __name__ == "__main__":
    run_health_check()
