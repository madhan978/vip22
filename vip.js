/* ==========================================================================
   VIP Software Developers & Co. – site scripts
   ========================================================================== */
(function () {
  "use strict";

  /* ---------- Settings: edit these two lines ---------- */
  // Option A (recommended): paste a Formspree / Web3Forms / your own backend URL.
  //   e.g. "https://formspree.io/f/xxxxxxxx"
  const FORM_ENDPOINT = "";
  // Option B (used when FORM_ENDPOINT is empty): enquiries open in the visitor's email app.
  const CONTACT_EMAIL = "softwaresvip60@gmail.com"; // TODO: replace with your real email

  /* ---------- Mobile menu ---------- */
  const navbar = document.getElementById("navbar");
  const menuBtn = document.querySelector(".menu-btn");

  function setMenu(open) {
    navbar.classList.toggle("show", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.textContent = open ? "✕" : "☰";
  }

  menuBtn.addEventListener("click", function () {
    setMenu(!navbar.classList.contains("show"));
  });

  // Close after choosing a link
  navbar.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () { setMenu(false); });
  });

  // Close with Escape (and return focus to the button)
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && navbar.classList.contains("show")) {
      setMenu(false);
      menuBtn.focus();
    }
  });

  // Close when tapping outside the header
  document.addEventListener("click", function (event) {
    if (navbar.classList.contains("show") && !event.target.closest("header")) {
      setMenu(false);
    }
  });

  // Reset when the viewport grows to desktop size
  window.matchMedia("(min-width: 901px)").addEventListener("change", function (e) {
    if (e.matches) setMenu(false);
  });

  /* ---------- Contact form ---------- */
  const form = document.getElementById("contactForm");
  const status = document.getElementById("formMessage");
  const submitBtn = form.querySelector('button[type="submit"]');

  function showStatus(text, type) {
    status.textContent = text;        // textContent keeps user input from being parsed as HTML
    status.className = type || "";
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const data = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      subject: form.subject.value.trim(),
      message: form.message.value.trim()
    };

    // Honeypot: real visitors never fill this hidden field
    if (form.website && form.website.value) return;

    if (!data.name || !data.email || !data.subject || !data.message) {
      showStatus("Please fill in all fields.", "error");
      return;
    }

    // Option B: no backend configured – open the visitor's email app
    if (!FORM_ENDPOINT) {
      const body = "Name: " + data.name + "\nEmail: " + data.email + "\n\n" + data.message;
      window.location.href =
        "mailto:" + CONTACT_EMAIL +
        "?subject=" + encodeURIComponent(data.subject) +
        "&body=" + encodeURIComponent(body);
      showStatus("Opening your email app. Press send there to reach us.", "success");
      return;
    }

    // Option A: send to a backend / form service
    submitBtn.disabled = true;
    showStatus("Sending…", "");

    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Request failed: " + response.status);

      showStatus("Thank you, " + data.name + "! We received your enquiry and will reply soon.", "success");
      form.reset();
    } catch (error) {
      showStatus("Sorry, your message could not be sent. Please try again or email " + CONTACT_EMAIL + ".", "error");
    } finally {
      submitBtn.disabled = false;
    }
  });

  /* ---------- Cursor glow (desktop mouse only) ---------- */
  const cursor = document.querySelector(".cursor-shadow");
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (cursor && canHover && !reduceMotion) {
    let x = 0, y = 0, queued = false;

    document.addEventListener("mousemove", function (event) {
      x = event.clientX;
      y = event.clientY;
      cursor.classList.add("active");

      if (!queued) {                       // at most one paint per frame
        queued = true;
        requestAnimationFrame(function () {
          cursor.style.transform = "translate(" + x + "px, " + y + "px) translate(-50%, -50%)";
          queued = false;
        });
      }
    });

    document.addEventListener("mouseleave", function () {
      cursor.classList.remove("active");
    });
  } else if (cursor) {
    cursor.remove();
  }
})();
