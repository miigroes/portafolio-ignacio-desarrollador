from playwright.sync_api import sync_playwright

URLS = [
    ("index.html", "artifacts/home-firefox.png"),
    ("casos.html", "artifacts/casos-firefox.png"),
]


def main() -> None:
    with sync_playwright() as p:
        # Chromium can crash in some container images; Firefox is more stable here.
        browser = p.firefox.launch()
        page = browser.new_page(viewport={"width": 1366, "height": 900})

        for route, target in URLS:
            page.goto(f"http://127.0.0.1:4173/{route}", wait_until="networkidle")
            page.screenshot(path=target, full_page=True)

        browser.close()


if __name__ == "__main__":
    main()
