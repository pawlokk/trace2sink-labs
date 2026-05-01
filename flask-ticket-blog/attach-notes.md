# Remote Debug Attach Notes (Flask)

1. Ensure remote app is running (`docker compose up -d --build`).
2. Open SSH tunnel:
```bash
ssh -L 5678:127.0.0.1:5678 pawlok@192.168.18.126
```
3. In VS Code run: `Attach Python (Remote Docker)`.

Suggested first breakpoints:
- `app/main.py` at `require_auth` decorator
- `app/main.py` at `/posts` search branch (`unsafe_raw_search`)
- `app/main.py` at `/imports/upload` file save
- `app/main.py` at `/admin` render branch
