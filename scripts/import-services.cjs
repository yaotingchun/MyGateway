/**
 * scripts/import-services.js
 *
 * Phase 1 (--dump): Opens malaysia.gov.my/en/digital-services, saves raw HTML so
 *   you can inspect the real DOM selectors.
 *
 * Phase 2 (default): Paginates all pages, extracts service cards, cleans /
 *   deduplicates them, assigns categories, then batch-uploads to Firestore.
 *
 * Usage:
 *   node scripts/import-services.js --dump   ← save HTML only
 *   node scripts/import-services.js           ← full scrape + upload
 */

const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore }        = require("firebase-admin/firestore");

// ── Firebase Admin ────────────────────────────────────────────────────────────
const serviceAccount = require("../credentials/firebase.json");

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

// ── Category keyword map ──────────────────────────────────────────────────────
const CATEGORY_MAP = [
  { category: "Transport",            keywords: ["vehicle", "driving", "licence", "road", "jpj", "transport", "lkm", "motor", "car", "bus", "train", "highway", "toll"] },
  { category: "Housing",              keywords: ["housing", "home", "property", "rumah", "pr1ma", "epf housing", "land", "title", "strata"] },
  { category: "Education",            keywords: ["education", "school", "university", "student", "scholarship", "exam", "result", "stpm", "spm", "upsr", "ptptn", "kpm"] },
  { category: "Employment",           keywords: ["job", "employment", "work", "socso", "perkeso", "hrdf", "hrdc", "career", "labour", "worker", "employer"] },
  { category: "Family",               keywords: ["birth", "death", "marriage", "divorce", "child", "family", "baby", "adopt", "guardian", "welfare", "jabatan pendaftaran"] },
  { category: "Financial Assistance", keywords: ["aid", "assistance", "subsidy", "grant", "loan", "fund", "bantuan", "zakat", "poor", "b40", "lhdn", "tax", "relief", "rebate"] },
  { category: "Healthcare",           keywords: ["health", "hospital", "clinic", "medical", "vaccine", "medicine", "pharmacy", "kkm", "kkiap", "moh"] },
  { category: "Business",             keywords: ["business", "company", "ssm", "miti", "permit", "license", "entrepreneur", "sme", "enterprise", "trade", "import", "export", "custom"] },
  { category: "Utilities",            keywords: ["electric", "water", "tnb", "syabas", "gas", "utility", "sewerage", "internet", "broadband"] },
];

function assignCategory(service) {
  const text = `${service.name} ${service.agency} ${service.description}`.toLowerCase();
  for (const { category, keywords } of CATEGORY_MAP) {
    if (keywords.some((kw) => text.includes(kw))) return category;
  }
  return "General";
}

// ── Text helpers ──────────────────────────────────────────────────────────────
function cleanText(text) {
  if (!text) return "";
  return text.replace(/\s+/g, " ").trim();
}

function createId(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

// ── Firestore upload ──────────────────────────────────────────────────────────
async function uploadServices(services) {
  const BATCH_SIZE = 400; // Firestore limit is 500 per batch
  let uploaded = 0;

  for (let i = 0; i < services.length; i += BATCH_SIZE) {
    const chunk = services.slice(i, i + BATCH_SIZE);
    const batch = db.batch();

    for (const service of chunk) {
      const id = createId(service.name);
      if (!id) continue;
      const ref = db.collection("services").doc(id);
      batch.set(ref, service, { merge: true });
    }

    await batch.commit();
    uploaded += chunk.length;
    console.log(`  ↑ Uploaded ${uploaded}/${services.length}`);
  }

  console.log(`✅ Done — ${uploaded} services uploaded to Firestore`);
}

// ── Card extractor (runs inside browser context) ──────────────────────────────
// Selectors confirmed from DOM dump of malaysia.gov.my/en/digital-services
function extractCards() {
  // Each service card is an <a> that links to /en/digital-services/<slug>
  // and contains data-slot elements for title, description (agency) and content.
  const cardLinks = Array.from(
    document.querySelectorAll('a[href*="/en/digital-services/"]')
  ).filter((a) => {
    // Exclude nav / breadcrumb links — real cards contain a card-title slot
    return a.querySelector('[data-slot="card-title"]') !== null;
  });

  return cardLinks.map((card) => {
    const titleEl   = card.querySelector('[data-slot="card-title"]');
    const agencyEl  = card.querySelector('[data-slot="card-description"]');
    const contentEl = card.querySelector('[data-slot="card-content"]');

    // Build absolute URL (href may be relative)
    let url = card.href || "";
    if (url.startsWith("/")) url = "https://www.malaysia.gov.my" + url;

    return {
      name:        titleEl?.innerText   || titleEl?.textContent   || "",
      agency:      agencyEl?.innerText  || agencyEl?.textContent  || "",
      description: contentEl?.innerText || contentEl?.textContent || "",
      url,
    };
  });
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const isDump = process.argv.includes("--dump");

  const browser = await chromium.launch({ headless: false, slowMo: 50 });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36",
  });
  const page = await context.newPage();

  console.log("🌐 Navigating to Malaysia Digital Services…");
  await page.goto("https://www.malaysia.gov.my/en/digital-services", {
    waitUntil: "networkidle",
    timeout: 60000,
  });

  console.log("📄 Page title:", await page.title());

  // ── Phase 1: DOM dump ───────────────────────────────────────────────────────
  if (isDump) {
    const html = await page.locator("body").innerHTML();
    const outPath = path.resolve(__dirname, "../malaysia-services.html");
    fs.writeFileSync(outPath, html, "utf8");
    console.log(`✅ DOM saved → ${outPath}`);
    await browser.close();
    return;
  }

  // ── Phase 2: Full scrape ────────────────────────────────────────────────────
  const allServices = [];
  let pageNum = 1;

  while (true) {
    console.log(`\n📖 Scraping page ${pageNum}…`);

    // Wait for at least one service-like element to appear
    await page.waitForTimeout(1500);

    const raw = await page.evaluate(extractCards);
    console.log(`   Found ${raw.length} raw cards`);

    if (raw.length === 0 && pageNum === 1) {
      // If page 1 yields nothing, dump HTML for debugging and bail
      const html = await page.locator("body").innerHTML();
      fs.writeFileSync("malaysia-services-debug.html", html, "utf8");
      console.warn("⚠️  No cards found on page 1 — HTML saved to malaysia-services-debug.html for inspection");
      break;
    }

    if (raw.length === 0) break;

    const cleaned = raw
      .map((s) => ({
        name: cleanText(s.name),
        agency: cleanText(s.agency),
        description: cleanText(s.description),
        serviceUrl: s.url,
        sourceUrl: "https://www.malaysia.gov.my/en/digital-services",
        language: "en",
        active: true,
        lastVerified: new Date().toISOString(),
      }))
      .filter((s) => s.name && s.serviceUrl);

    // Assign category to every service
    for (const s of cleaned) {
      s.category = assignCategory(s);
    }

    allServices.push(...cleaned);
    console.log(`   Kept ${cleaned.length} valid services (total so far: ${allServices.length})`);

    // ── Click the next page number using real pagination selectors ───────────
    // Confirmed from DOM dump: data-slot="pagination-link" on each page anchor.
    // The next page number is pageNum + 1.
    let navigated = false;
    try {
      // First try: find the link whose text is the next page number
      const nextPageSel = `[data-slot="pagination-link"]:text-is("${pageNum + 1}")`;
      const nextPageEl = page.locator(nextPageSel).first();
      const vis1 = await nextPageEl.isVisible().catch(() => false);
      if (vis1) {
        await nextPageEl.click();
        await page.waitForLoadState("networkidle", { timeout: 30000 });
        navigated = true;
      }
    } catch { /* fall through */ }

    // Second try: any pagination link that is NOT currently active
    if (!navigated) {
      try {
        const allLinks = page.locator('[data-slot="pagination-link"]:not([data-active="true"])');
        const count = await allLinks.count();
        for (let i = 0; i < count; i++) {
          const txt = (await allLinks.nth(i).innerText().catch(() => "")).trim();
          if (txt === String(pageNum + 1)) {
            await allLinks.nth(i).click();
            await page.waitForLoadState("networkidle", { timeout: 30000 });
            navigated = true;
            break;
          }
        }
      } catch { /* fall through */ }
    }

    // Last resort: look for SVG chevron-right ("next" arrow) in pagination
    if (!navigated) {
      try {
        const chevron = page.locator('[data-slot="pagination-next"], [aria-label="Go to next page"], [aria-label="Next page"]').first();
        const vis2 = await chevron.isVisible().catch(() => false);
        if (vis2) {
          await chevron.click();
          await page.waitForLoadState("networkidle", { timeout: 30000 });
          navigated = true;
        }
      } catch { /* fall through */ }
    }

    if (!navigated) {
      console.log("   No 'next page' found — reached last page.");
      break;
    }

    pageNum++;

    // Safety cap — remove or increase if portal has more pages
    if (pageNum > 50) {
      console.warn("⚠️  Reached page cap (50). Stopping.");
      break;
    }
  }

  // ── Deduplicate by serviceUrl ───────────────────────────────────────────────
  const unique = [
    ...new Map(allServices.map((s) => [s.serviceUrl, s])).values(),
  ];

  console.log(`\n📊 Total unique services: ${unique.length}`);

  // ── Screenshot ────────────────────────────────────────────────────────────
  await page.goto("https://www.malaysia.gov.my/en/digital-services", {
    waitUntil: "networkidle",
  });
  await page.screenshot({ path: "digital-services.png", fullPage: true });
  console.log("📸 Screenshot saved → digital-services.png");

  await browser.close();

  // ── Upload to Firestore ───────────────────────────────────────────────────
  if (unique.length > 0) {
    console.log("\n🔥 Uploading to Firestore…");
    await uploadServices(unique);
  } else {
    console.warn("⚠️  Nothing to upload.");
  }
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});