/**
 * scripts/enrich-services-bm.cjs
 *
 * BM (Bahasa Melayu) enrichment pass:
 *   - Derives BM URL by replacing /en/ with /my/ in serviceUrl
 *   - Extracts BM service name    → nameBM
 *   - Extracts BM agency          → agencyBM
 *   - Extracts BM description     → descriptionBM
 *   - Extracts BM tabs:
 *       SYARAT    → requirementsBM
 *       LANGKAH   → stepsBM
 *       HUBUNGI   → contactsBM
 *   - Extracts BM info grid:
 *       Penonton Sasaran / Kumpulan Sasaran → targetAudienceBM
 *       Kaedah Perkhidmatan                → methodOfServiceBM
 *       Tempoh                              → durationBM
 *       Bayaran / Caj & Bayaran             → chargePaymentBM
 *       Kaedah Pembayaran                   → paymentMethodBM
 *   - Updates Firestore documents
 *
 * Usage:
 *   node scripts/enrich-services-bm.cjs
 *   node scripts/enrich-services-bm.cjs --force    <- re-enriches all docs
 *   node scripts/enrich-services-bm.cjs --limit 20 <- process only first N
 */

const { chromium }            = require("playwright");
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore }        = require("firebase-admin/firestore");

// ── Firebase Admin ─────────────────────────────────────────────────────────────
const serviceAccount = require("../credentials/firebase.json");
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

// ── CLI flags ──────────────────────────────────────────────────────────────────
const args     = process.argv.slice(2);
const FORCE    = args.includes("--force");
const limitIdx = args.indexOf("--limit");
const LIMIT    = limitIdx !== -1 ? parseInt(args[limitIdx + 1], 10) : Infinity;

// ── BM tab names on malaysia.gov.my/my/ ───────────────────────────────────────
const BM_TABS = [
  { key: "requirementsBM", label: "SYARAT"   },
  { key: "stepsBM",        label: "LANGKAH"  },
  { key: "contactsBM",     label: "HUBUNGI"  },
  { key: "supportBM",      label: "SOKONGAN" },
];

// ── BM info grid label keywords ───────────────────────────────────────────────
const BM_GRID_KEYS = [
  { key: "targetAudienceBM",  words: ["penonton sasaran", "kumpulan sasaran", "sasar"] },
  { key: "methodOfServiceBM", words: ["kaedah perkhidmatan", "kaedah"]                },
  { key: "durationBM",        words: ["tempoh"]                                        },
  { key: "chargePaymentBM",   words: ["bayaran", "caj", "fi"]                         },
  { key: "paymentMethodBM",   words: ["kaedah pembayaran"]                             },
];

// ── Get BM URL (replace /en/ with /my/) ───────────────────────────────────────
function getBmUrl(serviceUrl) {
  if (!serviceUrl) return null;
  return serviceUrl.replace("/en/digital-services/", "/my/digital-services/");
}

// ── Extract main card fields (title, agency, description) ─────────────────────
async function extractCardFields(page) {
  try {
    return await page.evaluate(() => {
      const titleEl   = document.querySelector('[data-slot="card-title"]');
      const agencyEl  = document.querySelector('[data-slot="card-description"]');
      const contentEl = document.querySelector('[data-slot="card-content"]');
      return {
        name:        (titleEl?.innerText   || titleEl?.textContent   || "").replace(/\s+/g, " ").trim(),
        agency:      (agencyEl?.innerText  || agencyEl?.textContent  || "").replace(/\s+/g, " ").trim(),
        description: (contentEl?.innerText || contentEl?.textContent || "").replace(/\s+/g, " ").trim(),
      };
    });
  } catch (err) {
    console.log("    Warning card fields: " + err.message);
    return { name: "", agency: "", description: "" };
  }
}

// ── Extract a single tab content ──────────────────────────────────────────────
async function extractTab(page, tabLabel) {
  try {
    let tabBtn = page.getByText(tabLabel, { exact: true }).first();
    let visible = await tabBtn.isVisible().catch(() => false);

    if (!visible) {
      tabBtn = page.getByText(tabLabel, { exact: false }).first();
      visible = await tabBtn.isVisible().catch(() => false);
    }
    if (!visible) return null;

    await tabBtn.click();
    await page.waitForTimeout(900);

    const content = await page.evaluate(() => {
      const active = Array.from(
        document.querySelectorAll('[role="tabpanel"][data-state="active"]')
      ).find((p) => p.getAttribute("data-state") === "active");
      if (!active) return "";
      // Convert links: "Text (URL)"
      active.querySelectorAll("a[href]").forEach((a) => {
        if (a.href && !a.innerText.startsWith("http")) {
          a.innerText = a.innerText.trim() + " (" + a.href + ")";
        }
      });
      return active.innerText.trim();
    });
    return content || null;
  } catch (err) {
    console.log('    Warning tab "' + tabLabel + '": ' + err.message);
    return null;
  }
}

// ── Extract BM info grid ───────────────────────────────────────────────────────
async function extractBmInfoGrid(page) {
  try {
    return await page.evaluate((bmKeys) => {
      const data = {};
      const gridItems = Array.from(document.querySelectorAll(".grid > div"));
      for (const item of gridItems) {
        const spans = Array.from(item.querySelectorAll("span"));
        if (spans.length >= 2) {
          const label = spans[spans.length - 2].innerText.trim().toLowerCase();
          const value = spans[spans.length - 1].innerText.trim();
          for (const { key, words } of bmKeys) {
            if (words.some((w) => label.includes(w))) {
              data[key] = value;
              break;
            }
          }
        }
      }
      return data;
    }, BM_GRID_KEYS);
  } catch (err) {
    console.log("    Warning BM grid: " + err.message);
    return {};
  }
}

// ── Main ───────────────────────────────────────────────────────────────────────
async function main() {
  console.log("Fetching services from Firestore...");
  const snapshot    = await db.collection("services").get();
  const allServices = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

  const pending = allServices.filter((s) => {
    if (!s.serviceUrl || !s.serviceUrl.includes("malaysia.gov.my/en/")) return false;
    if (FORCE) return true;
    return !s.enrichedBmAt;
  });

  const toProcess = Number.isFinite(LIMIT) ? pending.slice(0, LIMIT) : pending;

  console.log("Total services    : " + allServices.length);
  console.log("To enrich (BM)    : " + toProcess.length + (Number.isFinite(LIMIT) ? " (limit: " + LIMIT + ")" : ""));

  if (toProcess.length === 0) {
    console.log("All services already BM-enriched! Use --force to re-run.");
    return;
  }

  const browser = await chromium.launch({ headless: true });
  const context  = await browser.newContext({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36",
  });
  const page = await context.newPage();

  let count = 0;

  for (const service of toProcess) {
    count++;
    const bmUrl = getBmUrl(service.serviceUrl);
    console.log("\n[" + count + "/" + toProcess.length + "] " + service.name);
    console.log("  BM URL: " + bmUrl);

    try {
      await page.goto(bmUrl, { waitUntil: "networkidle", timeout: 45000 });

      // 1. Card fields (title, agency, description)
      const fields = await extractCardFields(page);
      if (fields.name)        console.log("  nameBM:        " + fields.name);
      if (fields.agency)      console.log("  agencyBM:      " + fields.agency);
      if (fields.description) console.log("  descriptionBM: " + fields.description.slice(0, 80) + "...");

      // 2. Info grid (Target Audience etc. in BM)
      const grid = await extractBmInfoGrid(page);
      for (const [key, val] of Object.entries(grid)) {
        console.log("  [GRID] " + key + ": " + val);
      }

      // 3. Tabs (SYARAT, LANGKAH, HUBUNGI)
      const tabData = {};
      for (const tab of BM_TABS) {
        const content = await extractTab(page, tab.label);
        if (content) {
          tabData[tab.key] = content;
          console.log("  [TAB] " + tab.label + ": " + content.slice(0, 60).replace(/\n/g, " ") + "...");
        }
      }

      // 4. Build Firestore update
      const updateData = { enrichedBmAt: new Date().toISOString() };
      if (fields.name)               updateData.nameBM          = fields.name;
      if (fields.agency)             updateData.agencyBM        = fields.agency;
      if (fields.description)        updateData.descriptionBM   = fields.description;
      if (tabData.requirementsBM)    updateData.requirementsBM  = tabData.requirementsBM;
      if (tabData.stepsBM)           updateData.stepsBM         = tabData.stepsBM;
      if (tabData.contactsBM)        updateData.contactsBM      = tabData.contactsBM;
      if (tabData.supportBM)         updateData.supportBM       = tabData.supportBM;
      if (grid.targetAudienceBM)     updateData.targetAudienceBM  = grid.targetAudienceBM;
      if (grid.methodOfServiceBM)    updateData.methodOfServiceBM = grid.methodOfServiceBM;
      if (grid.durationBM)           updateData.durationBM        = grid.durationBM;
      if (grid.chargePaymentBM)      updateData.chargePaymentBM   = grid.chargePaymentBM;
      if (grid.paymentMethodBM)      updateData.paymentMethodBM   = grid.paymentMethodBM;

      await db.collection("services").doc(service.id).update(updateData);
      console.log("  Firestore updated.");

    } catch (err) {
      console.log("  FAILED: " + err.message);
      await db.collection("services").doc(service.id).update({
        enrichedBmAt:    new Date().toISOString(),
        enrichedBmError: err.message,
      }).catch(() => {});
    }
  }

  console.log("\nBM enrichment complete!");
  await browser.close();
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
