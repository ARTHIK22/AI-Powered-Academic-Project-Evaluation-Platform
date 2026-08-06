"""
ProjectSense AI - Code Analyzer
Extracts and analyzes source code from ZIP archives.
Supports: Python, JavaScript/TypeScript, Java, C/C++
"""
import ast
import os
import zipfile
import logging
import subprocess
import shutil
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)

SUPPORTED_EXTENSIONS = {".py", ".js", ".ts", ".java", ".c", ".cpp", ".cs", ".go", ".rb", ".php"}
MAX_FILES_TO_SCAN = 30
MAX_LINES_PER_FILE = 300


def extract_zip(zip_path: str, extract_to: str) -> list[str]:
    """Extract a ZIP and return list of extracted file paths."""
    extracted = []
    with zipfile.ZipFile(zip_path, "r") as z:
        z.extractall(extract_to)
        extracted = [
            os.path.join(extract_to, name)
            for name in z.namelist()
            if not name.endswith("/")
        ]
    return extracted


def get_folder_structure(base_dir: str) -> list[str]:
    """Get directory tree as a list of relative paths."""
    structure = []
    for root, dirs, files in os.walk(base_dir):
        # Skip hidden dirs and common noise
        dirs[:] = [d for d in dirs if not d.startswith(".") and d not in {"node_modules", "__pycache__", "venv", ".git"}]
        level = root.replace(base_dir, "").count(os.sep)
        indent = "  " * level
        folder_name = os.path.basename(root)
        structure.append(f"{indent}{folder_name}/")
        for file in files:
            structure.append(f"{indent}  {file}")
    return structure[:50]  # Limit output


def collect_code_files(base_dir: str) -> list[tuple[str, str]]:
    """Collect source code files (path, content) up to MAX_FILES_TO_SCAN."""
    collected = []
    for root, dirs, files in os.walk(base_dir):
        dirs[:] = [d for d in dirs if d not in {"node_modules", "__pycache__", "venv", ".git", "dist", "build"}]
        for fname in files:
            ext = Path(fname).suffix.lower()
            if ext in SUPPORTED_EXTENSIONS and len(collected) < MAX_FILES_TO_SCAN:
                fpath = os.path.join(root, fname)
                try:
                    with open(fpath, "r", encoding="utf-8", errors="ignore") as f:
                        content = "".join(f.readlines()[:MAX_LINES_PER_FILE])
                    collected.append((fpath, content))
                except Exception:
                    pass
    return collected


def count_lines(content: str) -> int:
    return len([l for l in content.splitlines() if l.strip()])


def analyze_python_ast(content: str) -> dict:
    """Basic AST analysis for Python files."""
    try:
        tree = ast.parse(content)
        functions = [node.name for node in ast.walk(tree) if isinstance(node, ast.FunctionDef)]
        classes = [node.name for node in ast.walk(tree) if isinstance(node, ast.ClassDef)]
        has_docstrings = any(
            isinstance(ast.get_docstring(node), str)
            for node in ast.walk(tree)
            if isinstance(node, (ast.FunctionDef, ast.ClassDef, ast.Module))
        )
        return {"functions": functions, "classes": classes, "has_docstrings": has_docstrings}
    except SyntaxError:
        return {"functions": [], "classes": [], "has_docstrings": False}


def run_pylint(file_path: str) -> dict:
    """Run pylint on a Python file and return score + issues."""
    try:
        result = subprocess.run(
            ["pylint", "--output-format=text", "--score=yes", file_path],
            capture_output=True, text=True, timeout=30
        )
        output = result.stdout + result.stderr
        score_line = [l for l in output.splitlines() if "Your code has been rated" in l]
        score = 7.0  # Default
        if score_line:
            import re
            m = re.search(r"([\d.]+)/10", score_line[0])
            if m:
                score = float(m.group(1))

        issues = [l for l in output.splitlines() if l and not l.startswith("*") and ".py:" in l]
        return {"score": score * 10, "issues": issues[:10]}
    except Exception:
        return {"score": 70.0, "issues": []}


def build_code_summary(zip_path: str, extract_dir: str) -> dict[str, Any]:
    """
    Main entry point: extract ZIP, analyze code, return summary dict.
    """
    try:
        files = extract_zip(zip_path, extract_dir)
    except zipfile.BadZipFile:
        return {"error": "Invalid ZIP file"}

    folder_structure = get_folder_structure(extract_dir)
    code_files = collect_code_files(extract_dir)

    total_lines = 0
    has_readme = any("readme" in f[0].lower() for f in code_files)
    has_tests = any("test" in f[0].lower() for f in code_files)
    file_types: dict[str, int] = {}
    all_content_snippets = []

    pylint_result = {"score": 75.0, "issues": []}

    for fpath, content in code_files:
        ext = Path(fpath).suffix.lower()
        file_types[ext] = file_types.get(ext, 0) + 1
        total_lines += count_lines(content)
        all_content_snippets.append(f"# File: {os.path.basename(fpath)}\n{content[:500]}")

        # Run pylint on first Python file found
        if ext == ".py" and pylint_result["score"] == 75.0:
            pylint_result = run_pylint(fpath)

    return {
        "total_files": len(code_files),
        "total_lines": total_lines,
        "file_types": file_types,
        "has_readme": has_readme,
        "has_tests": has_tests,
        "folder_structure": folder_structure,
        "pylint_score": pylint_result["score"],
        "pylint_issues": pylint_result["issues"],
        "code_snippets": "\n\n".join(all_content_snippets[:5]),  # First 5 files for AI
    }
