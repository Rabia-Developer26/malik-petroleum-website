// WHATSAPP_NUMBER comes from config.js (do not redeclare it here).

const form = document.getElementById("orderForm");
const locationBtn = document.getElementById("locationBtn");
const locationLabel = locationBtn?.querySelector("span");
const locationField = document.getElementById("locationField");
const coordinates = document.getElementById("coordinates");

// Keep every WhatsApp link in sync with config.js
document.querySelectorAll("[data-wa]").forEach((a) => {
  a.href = `https://wa.me/${WHATSAPP_NUMBER}`;
});

const setLabel = (t) => { if (locationLabel) locationLabel.textContent = t; };

locationBtn?.addEventListener("click", () => {
  if (!navigator.geolocation) {
    alert("Your browser does not support location access. Please enter the address manually.");
    return;
  }
  setLabel("Getting location...");
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const lat = pos.coords.latitude.toFixed(6);
      const lng = pos.coords.longitude.toFixed(6);
      coordinates.value = `${lat}, ${lng}`;
      setLabel("Location Added ✓");

      // Best effort: turn coordinates into a readable address
      try {
        const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
        const d = await r.json();
        if (d.display_name && !locationField.value.trim()) locationField.value = d.display_name;
      } catch (e) { /* GPS link is still attached to the order */ }
      if (!locationField.value.trim()) locationField.value = `GPS location: ${lat}, ${lng}`;
    },
    (err) => {
      setLabel("Use My Current Location");
      const msg = {
        1: "Location permission was denied. Please allow location access in your browser settings, or type the address manually.",
        2: "Your location could not be determined. Please type the address manually.",
        3: "Getting your location timed out. Please try again or type the address manually.",
      }[err.code] || "Could not get your location. Please type the address manually.";
      alert(msg);
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
  );
});

form?.addEventListener("submit", (e) => {
  e.preventDefault();

  const data = new FormData(form);
  const coords = data.get("coordinates");
  const maps = coords ? `https://www.google.com/maps?q=${encodeURIComponent(coords)}` : "Not provided";

  const message =
`🚚 *NEW DIESEL DELIVERY REQUEST — MALIK PETROLEUM*

*Client Name:* ${data.get("name")}
*Phone:* ${data.get("phone")}

*Delivery Location:*
${data.get("location")}

*GPS Location:* ${maps}

*Diesel Quantity:* ${data.get("liters")} Liters

*Delivery Date:* ${data.get("date")}
*Delivery Time:* ${data.get("time")}

*Additional Details:*
${data.get("details") || "None"}

Please confirm availability, current price and delivery details.`;

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
});


// ---------- Mobile menu ----------
const menuBtn = document.querySelector(".menu-btn");
const siteNav = document.getElementById("site-nav");

const setMenu = (open) => {
  if (!menuBtn || !siteNav) return;
  siteNav.classList.toggle("open", open);
  menuBtn.setAttribute("aria-expanded", String(open));
  menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  menuBtn.textContent = open ? "\u2715" : "\u2630";
};

menuBtn?.addEventListener("click", () => setMenu(!siteNav.classList.contains("open")));
siteNav?.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
document.addEventListener("click", (e) => {
  if (siteNav?.classList.contains("open") && !e.target.closest(".site-header")) setMenu(false);
});
window.matchMedia("(min-width: 901px)").addEventListener("change", (m) => { if (m.matches) setMenu(false); });
