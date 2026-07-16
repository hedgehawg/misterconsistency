"""Download CREC daily-package zips from govinfo (keyless) for a year range.

Enumerates issue dates from govinfo per-year sitemaps, downloads each package
zip to DATA_DIR, then strips it to htm + mods.xml only (drops the PDFs, ~90%
of the bytes) to keep disk usage sane.

Usage: python crec_download.py 2025 [2026] [--limit N]
"""
import io
import os
import re
import sys
import time
import zipfile
import urllib.request

DATA_DIR = r'D:\decoherence-data\crec'
SITEMAP = 'https://www.govinfo.gov/sitemap/CREC_{year}_sitemap.xml'
PKG = 'https://www.govinfo.gov/content/pkg/{pkg}.zip'
UA = {'User-Agent': 'decoherence-pipeline/1.0 (research; contact: site owner)'}


def issue_dates(year):
    req = urllib.request.Request(SITEMAP.format(year=year), headers=UA)
    xml = urllib.request.urlopen(req, timeout=60).read().decode()
    return sorted(set(re.findall(r'CREC-(\d{4}-\d{2}-\d{2})', xml)))


def slim_zip(raw_bytes, dest_path):
    """Rewrite package zip keeping only htm + mods.xml."""
    src = zipfile.ZipFile(io.BytesIO(raw_bytes))
    with zipfile.ZipFile(dest_path, 'w', zipfile.ZIP_DEFLATED) as out:
        for n in src.namelist():
            if n.endswith('.htm') or n.endswith('mods.xml'):
                out.writestr(n, src.read(n))


def fetch(date, retries=4):
    pkg = f'CREC-{date}'
    dest = os.path.join(DATA_DIR, pkg + '.zip')
    if os.path.exists(dest):
        return 'cached'
    for attempt in range(retries):
        try:
            req = urllib.request.Request(PKG.format(pkg=pkg), headers=UA)
            raw = urllib.request.urlopen(req, timeout=300).read()
            slim_zip(raw, dest)
            return f'{len(raw)/1e6:.0f}MB -> {os.path.getsize(dest)/1e6:.0f}MB'
        except Exception as e:
            if attempt == retries - 1:
                return f'FAILED: {e}'
            time.sleep(10 * (attempt + 1))


if __name__ == '__main__':
    import argparse
    ap = argparse.ArgumentParser()
    ap.add_argument('years', type=int, nargs='+')
    ap.add_argument('--limit', type=int, default=None)
    ns = ap.parse_args()
    years, limit = ns.years, ns.limit
    os.makedirs(DATA_DIR, exist_ok=True)
    for year in years:
        dates = issue_dates(year)
        if limit:
            dates = dates[:limit]
        print(f'{year}: {len(dates)} issues')
        for i, d in enumerate(dates):
            status = fetch(d)
            print(f'  [{i+1}/{len(dates)}] {d}: {status}', flush=True)
            if status != 'cached':
                time.sleep(2)   # be polite to govinfo
