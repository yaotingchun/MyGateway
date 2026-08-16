import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../firebase";

/**
 * Fetch all services, optionally filtered by category and/or search term.
 * @param {{ category?: string, search?: string }} opts
 * @returns {Promise<Array>}
 */
export async function getServices({ category = null, search = "" } = {}) {
  const snapshot = await getDocs(collection(db, "services"));
  let results = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  if (category && category !== "All") {
    results = results.filter(
      (s) => (s.category || "").toLowerCase() === category.toLowerCase()
    );
  }

  if (search.trim()) {
    const q = search.trim().toLowerCase();
    results = results.filter(
      (s) =>
        (s.name || "").toLowerCase().includes(q) ||
        (s.agency || "").toLowerCase().includes(q) ||
        (s.description || "").toLowerCase().includes(q)
    );
  }

  return results;
}

export async function getServiceById(id) {
  const snapshot = await getDocs(collection(db, "services"));
  const doc = snapshot.docs.find((d) => d.id === id);
  return doc ? { id: doc.id, ...doc.data() } : null;
}
