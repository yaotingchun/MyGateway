/**
 * scripts/enrich-services.cjs
 *
 * Reads services from Firestore that haven't been enriched yet,
 * visits their detail page, extracts Requirements, Steps, and Contacts,
 * and updates the Firestore document.
 */

const { chromium } = require("playwright");
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

// ── Firebase Admin ────────────────────────────────────────────────────────────
const serviceAccount = require("../credentials/firebase.json");

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

// ── Extraction Helper ─────────────────────────────────────────────────────────
async function extractTabContent(page, tabName) {
  try {
    // Look for the tab button by text (case insensitive)
    const tabBtn = page.getByText(tabName, { exact: true }).first();
    const visible = await tabBtn.isVisible().catch(() => false);
    
    if (visible) {
      await tabBtn.click();
      await page.waitForTimeout(1000); // Wait for animation/render
      
      const content = await page.evaluate(() => {
        // Find the active tab panel
        const panels = document.querySelectorAll('[role="tabpanel"][data-state="active"], .tab-content.active, [class*="tab-panel"]');
        if (panels.length > 0) {
          // Find the one that's actually visible/active. Often it's the first one matching data-state="active"
          const activePanel = Array.from(panels).find(p => p.getAttribute('data-state') === 'active' || p.style.display !== 'none');
          
          if (activePanel) {
            // Convert links into "Text (URL)" format so we don't just get "Click here"
            const links = activePanel.querySelectorAll('a');
            links.forEach(a => {
              if (a.href && !a.innerText.includes(a.href)) {
                // Check if it's already a URL to avoid duplication
                if (!a.innerText.startsWith('http')) {
                  a.innerText = `${a.innerText} (${a.href})`;
                }
              }
            });
            return activePanel.innerText.trim();
          } else {
            return Array.from(panels).map(p => p.innerText.trim()).join("\n---\n");
          }
        }
        return "";
      });
      return content;
    }
  } catch (err) {
    console.log(`    ⚠️ Error extracting ${tabName}:`, err.message);
  }
  return null;
}

// ── Main Enrichment Loop ──────────────────────────────────────────────────────
async function main() {
  console.log("🔥 Fetching services from Firestore...");
  
  // Get all services
  const snapshot = await db.collection("services").get();
  const allServices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  // Filter for services that need enrichment
  // We'll use 'enrichedAt' as the flag
  const pendingServices = allServices.filter(s => !s.enrichedAt && s.serviceUrl && s.serviceUrl.includes("malaysia.gov.my"));
  
  console.log(`📊 Found ${allServices.length} total services.`);
  console.log(`⏳ ${pendingServices.length} services need enrichment.`);
  
  if (pendingServices.length === 0) {
    console.log("✅ All services are already enriched!");
    return;
  }

  // Launch browser
  const browser = await chromium.launch({ headless: true }); // Run headless for speed
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36",
  });
  const page = await context.newPage();

  let count = 0;
  
  // Process sequentially to not overwhelm the server or browser
  for (const service of pendingServices) {
    count++;
    console.log(`\n[${count}/${pendingServices.length}] 🌐 Visiting: ${service.name}`);
    console.log(`    URL: ${service.serviceUrl}`);
    
    try {
      await page.goto(service.serviceUrl, { waitUntil: "networkidle", timeout: 45000 });
      
      const requirements = await extractTabContent(page, "REQUIREMENTS");
      const steps = await extractTabContent(page, "STEPS");
      const contacts = await extractTabContent(page, "CONTACTS");
      
      const updateData = {
        enrichedAt: new Date().toISOString(),
      };
      
      if (requirements) updateData.requirements = requirements;
      if (steps) updateData.steps = steps;
      if (contacts) updateData.contacts = contacts;
      
      // Save to Firestore
      await db.collection("services").doc(service.id).update(updateData);
      
      console.log(`    ✅ Updated Firestore. (Reqs: ${!!requirements}, Steps: ${!!steps}, Contacts: ${!!contacts})`);
      
    } catch (err) {
      console.log(`    ❌ Failed to process ${service.name}:`, err.message);
      // Mark as enriched anyway but maybe with an error flag so it doesn't get stuck in a loop if the URL is bad
      await db.collection("services").doc(service.id).update({
        enrichedAt: new Date().toISOString(),
        enrichmentError: err.message
      });
    }
  }

  console.log("\n🎉 Enrichment complete!");
  await browser.close();
}

main().catch((err) => {
  console.error("❌ Fatal Error:", err);
  process.exit(1);
});
