# PARAKH Backend

Deterministic FastAPI + SQLite demo API for the PARAKH UPI fraud-risk engine.
It mirrors the frontend mock contract: evidence-rich alerts, a consented-call
verdict, citizen confirmation, analyst resolution, and a replayable ticker.

## Run

```powershell
cd back-end
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

Open `http://127.0.0.1:8000/docs` for the interactive routes. The API creates
`parakh.db` and loads its deterministic data on its first start. During that
seed step, `app/forest.py` trains a fixed-seed Isolation Forest once and saves
the resulting scores in SQLite; requests only read those cached scores.

```powershell
python -m pytest
python scripts/stream.py --no-sleep
```

`PARAKH_DB` can point at a different SQLite file for tests. Set
`PARAKH_ENGINE=stub` to serve the authored seed alerts as the demo fallback;
the default `live` mode reads the seeded SQLite data. The replay assets live in
`seed/display.json` and `seed/transactions.json`.
