"""Replay the deterministic demo ticker and optionally submit its star payment."""

from __future__ import annotations

import argparse
import json
import time
from pathlib import Path
from urllib.error import URLError
from urllib.request import Request, urlopen

import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
from app.seed import TICKER

ACCEL = 10
LIVE_INDEX = 4
STAR_TRANSACTION = {"txnId": "T-1421", "userId": "C-4421", "payee": "safeguard-account@okaxis", "payeeName": "S. Chaudhary", "amount": 49500, "channel": "PhonePe", "device": "OnePlus 12 · new today", "hour": "14:06"}


def _minutes(value: str) -> int:
    """Convert a fixed HH:MM demo timestamp to minutes after midnight."""
    hour, minute = value.split(":")
    return int(hour) * 60 + int(minute)


def _post_star() -> None:
    """Submit the star payment without making a backend outage fatal to replay."""
    request = Request("http://127.0.0.1:8000/ingest", data=json.dumps(STAR_TRANSACTION).encode(), headers={"Content-Type": "application/json"}, method="POST")
    try:
        with urlopen(request, timeout=2) as response:
            payload = json.loads(response.read())
            print(f"  ingest score={payload['score']} tier={payload['tier']}")
    except (URLError, TimeoutError, OSError):
        print("  backend unreachable — continue")


def main(no_sleep: bool) -> None:
    """Print all ten events in order, sleeping only when interactive replay is requested."""
    previous = _minutes(TICKER[0]["time"])
    for index, event in enumerate(TICKER):
        current = _minutes(event["time"])
        if index and not no_sleep:
            time.sleep((current - previous) * 6)
        print(f"{event['time']}  {event['text']}  ({event['tier']})")
        if index == LIVE_INDEX:
            _post_star()
        previous = current


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Replay PARAKH's deterministic ticker")
    parser.add_argument("--no-sleep", action="store_true", help="print the entire replay immediately")
    main(parser.parse_args().no_sleep)
