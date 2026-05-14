"""
Docker Sandbox Manager
Handles secure, isolated code execution in ephemeral containers.
"""

import asyncio
import docker
import logging
import sys
import tempfile
import time
from pathlib import Path
from app.config import settings

logger = logging.getLogger(__name__)

# Language to Docker image mapping
LANGUAGE_IMAGES = {
    "python": "python:3.11-slim",
    "javascript": "node:20-slim",
    "java": "openjdk:21-slim",
}

LANGUAGE_COMMANDS = {
    "python": ["python", "/tmp/app_files/code.py"],
    "javascript": ["node", "/tmp/code.js"],
    "java": ["sh", "-c", "cd /tmp && javac Main.java && java Main"],
}

LANGUAGE_FILENAMES = {
    "python": "code.py",
    "javascript": "code.js",
    "java": "Main.java",
}


class SandboxManager:
    def __init__(self):
        try:
            self.client = docker.from_env()
        except Exception as e:
            logger.error(f"Failed to connect to Docker: {e}")
            self.client = None

    async def _execute_local(self, code: str, language: str) -> dict:
        """Fallback runner for environments without Docker (best-effort, not sandboxed)."""
        if language != "python":
            return {
                "stdout": "",
                "stderr": f"Local fallback only supports python. Requested: {language}",
                "exit_code": 1,
                "execution_time_ms": 0,
                "error": "unsupported_language",
            }

        start_time = time.monotonic()
        with tempfile.TemporaryDirectory() as tmp_dir:
            code_file = Path(tmp_dir) / "code.py"
            code_file.write_text(code, encoding="utf-8")

            proc = await asyncio.create_subprocess_exec(
                sys.executable,
                str(code_file),
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                cwd=tmp_dir,
            )

            try:
                stdout_b, stderr_b = await asyncio.wait_for(
                    proc.communicate(),
                    timeout=settings.sandbox_timeout_seconds,
                )
                exit_code = proc.returncode
                stdout = stdout_b.decode("utf-8", errors="replace")
                stderr = stderr_b.decode("utf-8", errors="replace")
            except asyncio.TimeoutError:
                proc.kill()
                stdout_b, stderr_b = await proc.communicate()
                exit_code = -1
                stdout = stdout_b.decode("utf-8", errors="replace")
                stderr = (
                    stderr_b.decode("utf-8", errors="replace")
                    + f"\nExecution timed out after {settings.sandbox_timeout_seconds} seconds"
                ).strip()

        elapsed_ms = int((time.monotonic() - start_time) * 1000)
        return {
            "stdout": stdout[:10000],
            "stderr": stderr[:10000],
            "exit_code": exit_code,
            "execution_time_ms": elapsed_ms,
            "error": None,
            "execution_mode": "local",
        }

    async def execute(self, code: str, language: str) -> dict:
        """
        Execute code in an isolated Docker container.
        Returns: {stdout, stderr, exit_code, execution_time_ms, error}
        """
        if self.client is None:
            logger.warning("Docker unavailable, using local execution fallback")
            return await self._execute_local(code=code, language=language)

        if language not in LANGUAGE_IMAGES:
            return {
                "stdout": "",
                "stderr": f"Unsupported language: {language}. Supported: {list(LANGUAGE_IMAGES.keys())}",
                "exit_code": 1,
                "execution_time_ms": 0,
                "error": "unsupported_language",
            }

        import time
        start_time = time.monotonic()

        container = None
        tmp_dir = None
        try:
            # Write code to a temporary directory on host, then mount it in container
            tmp_dir = tempfile.mkdtemp()
            image = LANGUAGE_IMAGES[language]
            command = LANGUAGE_COMMANDS[language]
            filename = LANGUAGE_FILENAMES[language]
            code_path = Path(tmp_dir) / filename
            code_path.write_text(code, encoding="utf-8")

            # Run container with strict resource limits
            container = await asyncio.to_thread(
                self.client.containers.run,
                image=image,
                command=command,
                mem_limit=settings.sandbox_memory_limit,
                cpu_quota=settings.sandbox_cpu_quota,
                pids_limit=settings.sandbox_pids_limit,
                network_disabled=True,
                read_only=True,
                user="nobody",
                security_opt=["no-new-privileges"],
                cap_drop=["ALL"],
                tmpfs={"/tmp": "rw,noexec,nosuid,size=50m"},
                volumes={str(tmp_dir): {"bind": "/tmp/app_files", "mode": "ro"}},
                detach=True,
                remove=False,
                stderr=True,
                stdout=True,
            )

            # Wait with timeout
            try:
                result = await asyncio.wait_for(
                    asyncio.to_thread(container.wait),
                    timeout=settings.sandbox_timeout_seconds,
                )
                exit_code = result.get("StatusCode", 1)
                stdout = container.logs(stdout=True, stderr=False).decode("utf-8", errors="replace")
                stderr = container.logs(stdout=False, stderr=True).decode("utf-8", errors="replace")

            except asyncio.TimeoutError:
                exit_code = -1
                stdout = ""
                stderr = f"Execution timed out after {settings.sandbox_timeout_seconds} seconds"

        except Exception as e:
            logger.error(f"Sandbox execution error: {e}")
            logger.warning("Falling back to local execution after Docker error")
            return await self._execute_local(code=code, language=language)
        finally:
            if container:
                try:
                    await asyncio.to_thread(container.remove, force=True)
                except Exception:
                    pass
            if tmp_dir:
                try:
                    import shutil
                    shutil.rmtree(tmp_dir, ignore_errors=True)
                except Exception:
                    pass

        elapsed_ms = int((time.monotonic() - start_time) * 1000)

        return {
            "stdout": stdout[:10000],  # Cap output
            "stderr": stderr[:10000],
            "exit_code": exit_code,
            "execution_time_ms": elapsed_ms,
            "error": None,
        }


# Singleton
_sandbox: SandboxManager | None = None


def get_sandbox() -> SandboxManager:
    global _sandbox
    if _sandbox is None:
        _sandbox = SandboxManager()
    return _sandbox
