"""Pytest fixtures that isolate each API test in its own SQLite database."""

import os

import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def client(tmp_path, monkeypatch):
    """Create a clean, fully seeded API client for one test."""
    monkeypatch.setenv("PARAKH_DB", str(tmp_path / "parakh.db"))
    from app.main import app

    with TestClient(app) as test_client:
        yield test_client
