/**
 * scripts/inspect-detail-page.cjs
 *
 * Dumps the HTML of a single service detail page so we can discover
 * the selectors for Requirements, Steps, and Contacts tabs.
 */

const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

async function main() {
  const browser = await chromium.launch({ headless: false, slowMo: 50 });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36",
  });
  const page = await context.newPage();

  // Pick a known service detail page
  const url = "https://www.malaysia.gov.my/en/digital-services/licensed-umrah-agency-search";
  console.log("🌐 Navigating to detail page:", url);
  await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
  console.log("📄 Page title:", await page.title());

  // Save full body HTML
  const html = await page.locator("body").innerHTML();
  const outPath = path.resolve(__dirname, "../detail-page-dump.html");
  fs.writeFileSync(outPath, html, "utf8");
  console.log(`✅ HTML saved → ${outPath} (${(html.length / 1024).toFixed(1)} KB)`);

  // Also try to click each tab and capture content
  const tabs = ["REQUIREMENTS", "STEPS", "CONTACTS"];
  for (const tabName of tabs) {
    try {
      const tabBtn = page.getByText(tabName, { exact: true }).first();
      const visible = await tabBtn.isVisible().catch(() => false);
      if (visible) {
        await tabBtn.click();
        await page.waitForTimeout(1000);
        console.log(`\n📋 Tab: ${tabName}`);
        
        // Try to get the content that appeared after clicking
        const content = await page.evaluate(() => {
          // Look for the active tab content panel
          const panels = document.querySelectorAll('[role="tabpanel"], [data-state="active"], .tab-content, [class*="tab-panel"]');
          if (panels.length > 0) {
            return Array.from(panels).map(p => p.innerText).join("\n---\n");
          }
          // Fallback: get text from the main content area
          const main = document.querySelector("main, [class*='content'], article");
          return main ? main.innerText : "";
        });
        console.log(content.slice(0, 500));
      } else {
        console.log(`⚠️  Tab "${tabName}" not visible`);
      }
    } catch (err) {
      console.log(`⚠️  Error clicking "${tabName}":`, err.message);
    }
  }

  // Save final state HTML (after clicking tabs)
  const html2 = await page.locator("body").innerHTML();
  fs.writeFileSync(
    path.resolve(__dirname, "../detail-page-dump-after-tabs.html"),
    html2,
    "utf8"
  );
  console.log("\n✅ Post-tab HTML saved → detail-page-dump-after-tabs.html");

  await browser.close();
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
