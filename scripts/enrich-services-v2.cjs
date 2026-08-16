/**
 * scripts/enrich-services-v2.cjs
 *
 * Phase-2 enrichment pass:
 *   - Visits each service's malaysia.gov.my detail page (serviceUrl)
 *   - Extracts the actual "Access the Service" portal link → directUrl
 *   - Extracts the "Learn More" link                      → learnMoreUrl
 *   - Extracts info grid (Target Audience, Method of Service,
 *     Duration, Charge & Payment, Payment Method)
 *   - Updates Firestore documents
 *
 * Usage:
 *   node scripts/enrich-services-v2.cjs
 *   node scripts/enrich-services-v2.cjs --force    <- re-enriches all docs
 *   node scripts/enrich-services-v2.cjs --limit 20 <- process only first N
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

// ── Extract the info grid (Target Audience, etc.) ─────────────────────────────
async function extractInfoGrid(page) {
  try {
    const result = await page.evaluate(() => {
      const data = {};
      
      // Look for the grid containers that have 5 columns or similar structures
      const gridItems = Array.from(document.querySelectorAll('.grid > div'));
      
      for (const item of gridItems) {
        // Typically has two spans inside, one for label and one for value
        const spans = Array.from(item.querySelectorAll('span'));
        if (spans.length >= 2) {
          const label = spans[spans.length - 2].innerText.trim().toLowerCase();
          const value = spans[spans.length - 1].innerText.trim();
          
          if (label.includes('target audience')) {
            data.targetAudience = value;
          } else if (label.includes('method of service')) {
            data.methodOfService = value;
          } else if (label.includes('duration')) {
            data.duration = value;
          } else if (label.includes('charge')) {
            data.chargePayment = value;
          } else if (label.includes('payment method')) {
            data.paymentMethod = value;
          }
        }
      }
      return data;
    });
    return result;
  } catch (err) {
    console.log("    Warning infoGrid: " + err.message);
    return {};
  }
}

// ── Extract the direct "Access the Service" portal URL (static) ───────────────
async function extractDirectUrl(page) {
  try {
    const result = await page.evaluate(() => {
      const labels = [
        "access this service",
        "access the service",
        "access service",
        "akses perkhidmatan",
        "apply now",
        "apply online",
        "proceed",
        "go to service",
      ];
      
      // Look for <button> inside <a> or just <a>
      const elements = Array.from(document.querySelectorAll("a, button"));
      for (const el of elements) {
        const text = (el.innerText || el.textContent || "").toLowerCase().trim();
        if (labels.some((l) => text.includes(l))) {
          let href = "";
          if (el.tagName === "A") {
            href = el.href;
          } else if (el.tagName === "BUTTON") {
            const parent = el.closest("a[href]");
            if (parent) href = parent.href;
          }
          
          if (
            href &&
            !href.startsWith("mailto:") &&
            !href.startsWith("tel:") &&
            !href.startsWith("#") &&
            !href.includes("malaysia.gov.my/en/digital-services")
          ) {
            return href;
          }
        }
      }
      return null;
    });
    return result;
  } catch (err) {
    console.log("    Warning directUrl: " + err.message);
    return null;
  }
}

// ── Extract "Learn More" link ──────────────────────────────────────────────────
async function extractLearnMoreUrl(page) {
  try {
    const result = await page.evaluate(() => {
      const labels = ["learn more", "ketahui lebih lanjut", "more info", "more information"];
      const anchors = Array.from(document.querySelectorAll("a[href]"));
      for (const a of anchors) {
        const text = (a.innerText || a.textContent || "").toLowerCase().trim();
        if (labels.some((l) => text === l || text.startsWith(l))) {
          const href = a.href || "";
          if (href && !href.startsWith("#") && !href.startsWith("mailto:")) {
            return href;
          }
        }
      }
      return null;
    });
    return result;
  } catch {
    return null;
  }
}

// ── Main ───────────────────────────────────────────────────────────────────────
async function main() {
  console.log("Fetching services from Firestore...");
  const snapshot    = await db.collection("services").get();
  const allServices = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

  const pending = allServices.filter((s) => {
    if (!s.serviceUrl || !s.serviceUrl.includes("malaysia.gov.my")) return false;
    if (FORCE) return true;
    return !s.enrichedV2At;
  });

  const toProcess = Number.isFinite(LIMIT) ? pending.slice(0, LIMIT) : pending;

  console.log("Total services : " + allServices.length);
  console.log("To enrich (v2) : " + toProcess.length + (Number.isFinite(LIMIT) ? " (limit: " + LIMIT + ")" : ""));

  if (toProcess.length === 0) {
    console.log("All services already v2-enriched! Use --force to re-run.");
    return;
  }

  const browser = await chromium.launch({ headless: true });
  const context  = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36",
  });
  const page = await context.newPage();

  let count = 0;

  for (const service of toProcess) {
    count++;
    console.log("\n[" + count + "/" + toProcess.length + "] " + service.name);
    console.log("  URL: " + service.serviceUrl);

    try {
      await page.goto(service.serviceUrl, {
        waitUntil: "networkidle",
        timeout: 45000,
      });

      // 1. Direct access URL
      const directUrl = await extractDirectUrl(page);
      console.log("  directUrl: " + (directUrl || "(not found)"));

      // 2. Learn More URL
      const learnMoreUrl = await extractLearnMoreUrl(page);
      console.log("  learnMoreUrl: " + (learnMoreUrl || "(not found)"));

      // 3. Info grid (Target Audience, etc.)
      const infoData = await extractInfoGrid(page);
      for (const [key, val] of Object.entries(infoData)) {
         console.log(`  [OK] ${key}: ${val}`);
      }

      // 4. Build update object
      const updateData = { enrichedV2At: new Date().toISOString() };
      if (directUrl) updateData.directUrl = directUrl;
      if (learnMoreUrl) updateData.learnMoreUrl = learnMoreUrl;
      if (infoData.targetAudience)  updateData.targetAudience  = infoData.targetAudience;
      if (infoData.methodOfService) updateData.methodOfService = infoData.methodOfService;
      if (infoData.duration)        updateData.duration        = infoData.duration;
      if (infoData.chargePayment)   updateData.chargePayment   = infoData.chargePayment;
      if (infoData.paymentMethod)   updateData.paymentMethod   = infoData.paymentMethod;

      await db.collection("services").doc(service.id).update(updateData);
      console.log("  Firestore updated.");

    } catch (err) {
      console.log("  FAILED: " + err.message);
      await db.collection("services").doc(service.id).update({
        enrichedV2At:    new Date().toISOString(),
        enrichedV2Error: err.message,
      }).catch(() => {});
    }
  }

  console.log("\nV2 enrichment complete!");
  await browser.close();
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
