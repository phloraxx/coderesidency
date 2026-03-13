"""
Docker Sandbox Manager
Handles secure, isolated code execution in ephemeral containers.
"""

import asyncio
import docker
import logging
import uuid
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
    "python": ["python", "/tmp/code.py"],
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

    async def execute(self, code: str, language: str) -> dict:
        """
        Execute code in an isolated Docker container.
        Returns: {stdout, stderr, exit_code, execution_time_ms, error}
        """
        if self.client is None:
            return {
                "stdout": "",
                "stderr": "Docker is not available",
                "exit_code": -1,
                "execution_time_ms": 0,
                "error": "docker_unavailable",
            }

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
        try:
            image = LANGUAGE_IMAGES[language]
            command = LANGUAGE_COMMANDS[language]
            filename = LANGUAGE_FILENAMES[language]

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
                files={f"/tmp/{filename}": code.encode()},
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
            exit_code = -1
            stdout = ""
            stderr = str(e)
        finally:
            if container:
                try:
                    await asyncio.to_thread(container.remove, force=True)
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
