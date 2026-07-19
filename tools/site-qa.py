# -*- coding: utf-8 -*-
"""
site-qa.py — smoke suite for misterconsistency.com.

Run after every deploy (and nightly):
    python tools/site-qa.py                 # checks the live site
    python tools/site-qa.py --base http://localhost:8762   # or a local serve
    python tools/site-qa.py --skip-browser  # HTTP/structural checks only

Layers:
  A. every page fetches clean (200, no mojibake, no stray merge markers)
  B. every locally-referenced asset resolves (no 404s, non-trivial size)
  C. structural invariants (nav<->section ids, unique ids, entry counts)
  D. headless-Chrome runtime checks, desktop + phone viewport:
     zero console errors / uncaught exceptions from our own pages,
     key elements present, no horizontal overflow on mobile.

Exit code 0 = all green; 1 = failures (each printed with FAIL).
Requires: pip install websocket-client; Chrome at the standard path.
"""
import argparse, json, os, re, subprocess, sys, tempfile, time, urllib.request, urllib.parse

CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
PAGES = ["/", "/iconic-wall-guide.html", "/alaska-trip.html", "/alaska-full.html",
         "/decoherence-z-axis.html"]
UA = {"User-Agent": "Mozilla/5.0 (site-qa)"}
MERGE_MARKERS = ["<<<<<<< ", ">>>>>>> "]

# Mojibake = UTF-8 bytes decoded as cp1252/latin-1 and re-saved as UTF-8. Detect it
# by reversing the corruption rather than matching a list of known-mangled strings:
# a fixed list only finds the glyphs someone thought to enumerate, so a page whose
# only damage was psi or an emoji would pass clean. Any run of high characters that
# round-trips back to shorter, valid UTF-8 was mojibake.
#
# cp1252 leaves 0x81/0x8D/0x8F/0x90/0x9D undefined and the corrupting tool falls
# through to latin-1 for those, so one run can mix both encodings -- the choice has
# to be made per character, not per run.
def _enc(s):
    out = bytearray()
    for ch in s:
        try:
            out += ch.encode("cp1252")
        except UnicodeEncodeError:
            out += ch.encode("latin-1")   # raises above U+00FF, which is correct
    return bytes(out)

def find_mojibake(text):
    """Return [(mangled, should_be), ...] for every mojibake run in text."""
    hits, i, n = [], 0, len(text)
    while i < n:
        # escapes, not literals: this file must stay diagnostic even if it is
        # itself run through a bad re-encode one day
        if "\u00c2" <= text[i] <= "\u00f4":   # a UTF-8 lead byte, reinterpreted
            j = i
            while j < n and ord(text[j]) > 0x7F:
                try:
                    _enc(text[j])
                except UnicodeEncodeError:
                    break
                j += 1
            for end in range(j - i, 0, -1):      # longest plausible run first
                try:
                    dec = _enc(text[i:i + end]).decode("utf-8")
                except (UnicodeEncodeError, UnicodeDecodeError):
                    continue
                if len(dec) < end:               # mojibake always expands
                    hits.append((text[i:i + end], dec))
                    i += end
                    break
            else:
                i += 1
            continue
        i += 1
    return hits

def mojibake_detail(hits):
    """ASCII-safe summary, e.g. '113x U+2014, 22x U+2013'. Never emits the broken
    bytes themselves -- this runs in consoles whose encoding may be the problem."""
    agg = {}
    for _, fixed in hits:
        key = " ".join("U+%04X" % ord(c) for c in fixed)
        agg[key] = agg.get(key, 0) + 1
    top = sorted(agg.items(), key=lambda kv: -kv[1])
    out = ", ".join("%dx %s" % (n, k) for k, n in top[:5])
    if len(top) > 5:
        out += " (+%d more kinds)" % (len(top) - 5)
    return out

results = []
def check(ok, label, detail=""):
    results.append((ok, label, detail))
    print(("PASS  " if ok else "FAIL  ") + label + ((" — " + detail) if detail and not ok else ""))

def fetch(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=45) as r:
        return r.status, r.read()

# ---------------- A + B: pages and assets ----------------
def http_checks(base):
    seen_assets = {}
    for path in PAGES:
        url = base + path
        try:
            status, body = fetch(url)
        except Exception as e:
            check(False, f"GET {path}", str(e)); continue
        text = body.decode("utf-8", "replace")
        check(status == 200, f"GET {path} -> 200", str(status))
        moji = find_mojibake(text)
        check(not moji, f"{path}: no mojibake", mojibake_detail(moji))
        check("\ufffd" not in text, f"{path}: no replacement chars",
              "%d U+FFFD" % text.count("\ufffd"))
        marks = [m for m in MERGE_MARKERS if m in text]
        check(not marks, f"{path}: no merge markers", ",".join(marks))

        # collect local asset refs
        refs = set()
        for m in re.finditer(r'(?:src|href|poster)="([^"]+)"', text):
            u = m.group(1)
            if u.startswith(("http", "//", "#", "mailto:", "data:")):
                continue
            # skip refs assembled in inline JS (quotes/concat land in the match)
            if not re.fullmatch(r"[\w ./?=&%-]+", u):
                continue
            refs.add(u.split("#")[0])
        for u in sorted(refs):
            if not u or u.endswith((".html", "/")) and u in ("index.html",):
                continue
            full = urllib.parse.urljoin(base + path, u)
            if full in seen_assets:
                continue
            try:
                req = urllib.request.Request(full, headers=UA, method="HEAD")
                with urllib.request.urlopen(req, timeout=45) as r:
                    ok = r.status == 200
                    size = int(r.headers.get("Content-Length") or 0)
                seen_assets[full] = (ok, size)
            except Exception as e:
                seen_assets[full] = (False, str(e))
        bad = [u for u, (ok, _) in seen_assets.items() if not ok]
    check(not bad, f"assets resolve ({len(seen_assets)} checked)",
          "; ".join(u.replace(base, "") + ":" + str(seen_assets[u][1]) for u in bad[:5]))
    return

# ---------------- C: structural invariants ----------------
def structural_checks(base):
    _, body = fetch(base + "/")
    idx = body.decode("utf-8", "replace")
    nav = re.findall(r'<a href="#([\w-]+)">', idx)
    secs = re.findall(r'<section id="([\w-]+)">', idx)
    missing = [n for n in set(nav) - {"top"} if n not in secs]
    check(not missing, "index: every nav anchor has a section", ",".join(missing))
    ids = re.findall(r'id="([\w-]+)"', idx)
    dupes = sorted({i for i in ids if ids.count(i) > 1})
    check(not dupes, "index: element ids unique", ",".join(dupes))
    for el in ["wall-interactive", "bracket-frame", "gattman-map", "song-grid", "hero-player"]:
        check(f'id="{el}"' in idx, f"index: #{el} present")

    _, body = fetch(base + "/iconic-wall-guide.html")
    guide = body.decode("utf-8", "replace")
    n = len(re.findall(r"<article id=", guide))
    check(n == 34, "guide: 34 entries", str(n))

    _, body = fetch(base + "/alaska-trip.html")
    trip = body.decode("utf-8", "replace")
    for el in ["brief-frame", "brief-fs", "gate-form"]:
        check(f'id="{el}"' in trip, f"alaska-trip: #{el} present")
    check("suppressRailOnTouch" in trip, "alaska-trip: mobile rail suppression present")

# ---------------- D: headless Chrome runtime ----------------
def cdp_page_check(base, path, width, height, mobile, expect_js, label):
    prof = tempfile.mkdtemp(prefix="qa-chrome-")
    port_file = os.path.join(prof, "DevToolsActivePort")
    proc = subprocess.Popen([
        CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars",
        "--remote-debugging-port=0", "--remote-allow-origins=*", f"--user-data-dir={prof}",
        f"--window-size={width},{height}", "about:blank",
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        for _ in range(80):
            if os.path.exists(port_file):
                break
            time.sleep(0.25)
        else:
            check(False, label, "devtools port never appeared"); return
        port = int(open(port_file).read().splitlines()[0])
        targets = json.loads(fetch(f"http://127.0.0.1:{port}/json")[1])
        page = next(t for t in targets if t["type"] == "page")

        import websocket
        ws = websocket.create_connection(page["webSocketDebuggerUrl"], timeout=30)
        mid = [0]
        def send(method, params=None):
            mid[0] += 1
            ws.send(json.dumps({"id": mid[0], "method": method, "params": params or {}}))
            return mid[0]
        errors = []
        def drain(seconds):
            end = time.time() + seconds
            replies = {}
            while time.time() < end:
                ws.settimeout(max(0.2, end - time.time()))
                try:
                    msg = json.loads(ws.recv())
                except Exception:
                    break
                if "id" in msg:
                    replies[msg["id"]] = msg
                m = msg.get("method")
                if m == "Runtime.exceptionThrown":
                    d = msg["params"]["exceptionDetails"]
                    errors.append((d.get("text", "exception"), str(d.get("exception", {}).get("description", ""))[:200]))
                elif m == "Runtime.consoleAPICalled" and msg["params"].get("type") == "error":
                    args = msg["params"].get("args", [])
                    errors.append(("console.error", " ".join(str(a.get("value", a.get("description", "")))[:120] for a in args)))
            return replies
        send("Runtime.enable")
        if mobile:
            send("Emulation.setDeviceMetricsOverride",
                 {"width": width, "height": height, "deviceScaleFactor": 3, "mobile": True})
            send("Emulation.setTouchEmulationEnabled", {"enabled": True, "maxTouchPoints": 5})
        send("Page.enable")
        send("Page.navigate", {"url": base + path})
        drain(16)
        eid = send("Runtime.evaluate", {"expression": expect_js, "returnByValue": True})
        replies = drain(6)
        val = None
        r = replies.get(eid)
        if r and "result" in r:
            val = r["result"].get("result", {}).get("value")
        ws.close()

        own_errors = [e for e in errors if "favicon" not in e[1]]
        check(not own_errors, f"{label}: no console errors/exceptions",
              "; ".join(a + " " + b for a, b in own_errors[:3]))
        check(val is True, f"{label}: runtime expectations", json.dumps(val)[:200] if val is not True else "")
    finally:
        proc.kill()

def browser_checks(base):
    idx_expect = """(function(){
      const songs = document.querySelectorAll('#song-grid .song').length > 10;
      const wall = !!document.getElementById('wall-interactive');
      const bracket = !!document.getElementById('bracket-frame');
      const legendHs = document.querySelectorAll('#wall-legend .hs').length === 34;
      const origShapes = document.querySelectorAll('#orig-wall svg .ow').length === 33;
      const origKeyHs = document.querySelectorAll('#orig-key .hs').length === 32;
      const overflow = document.documentElement.scrollWidth <= window.innerWidth + 2;
      return songs && wall && bracket && legendHs && origShapes && origKeyHs && overflow;
    })()"""
    guide_expect = """(function(){
      const arts = document.querySelectorAll('article').length === 34;
      const overflow = document.documentElement.scrollWidth <= window.innerWidth + 2;
      return arts && overflow;
    })()"""
    trip_expect = """(function(){
      const gate = document.getElementById('gate');
      const visible = gate && getComputedStyle(gate).display !== 'none';
      return !!visible;
    })()"""
    full_expect = """(function(){
      return !!document.getElementById('deck') && !!document.getElementById('veil');
    })()"""
    zaxis_expect = """(function(){
      return !!document.querySelector('main') && !!document.querySelector('h1');
    })()"""
    plans = [
        ("/", idx_expect), ("/iconic-wall-guide.html", guide_expect),
        ("/alaska-trip.html", trip_expect), ("/alaska-full.html", full_expect),
        ("/decoherence-z-axis.html", zaxis_expect),
    ]
    for path, expect in plans:
        cdp_page_check(base, path, 1280, 900, False, expect, f"desktop {path}")
        cdp_page_check(base, path, 390, 844, True, expect, f"mobile {path}")

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--base", default="https://misterconsistency.com")
    ap.add_argument("--skip-browser", action="store_true")
    args = ap.parse_args()
    base = args.base.rstrip("/")
    print(f"site-qa against {base}\n" + "=" * 60)
    http_checks(base)
    structural_checks(base)
    if not args.skip_browser:
        browser_checks(base)
    fails = [r for r in results if not r[0]]
    print("=" * 60)
    print(f"{len(results) - len(fails)} passed, {len(fails)} failed")
    sys.exit(1 if fails else 0)
