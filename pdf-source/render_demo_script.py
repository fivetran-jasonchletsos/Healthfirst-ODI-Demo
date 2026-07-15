#!/usr/bin/env python3
"""Renders demo-script.html to a US Letter PDF via headless Chromium.

Uses format="Letter" (NOT width=/height=) -- Playwright/Chromium interprets
bare "612px"/"792px" as 96dpi CSS pixels, not PDF points, which silently
undersizes the page. format="Letter" is the correct, portfolio-wide fix.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright

SRC = Path(__file__).resolve().parent / "demo-script.html"
OUT = Path.home() / "Downloads" / "Healthfirst-ODI-Demo-Script.pdf"

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto(SRC.as_uri())
    page.pdf(path=str(OUT), format="Letter", print_background=True)
    browser.close()

print(f"wrote {OUT}")
