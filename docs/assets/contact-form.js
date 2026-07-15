(() => {
  const form = document.querySelector("[data-contact-form]");
  if (!form) return;

  const status = form.querySelector("[data-form-status]");

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = new FormData(form);
    const senderEmail = String(data.get("email") || "").trim();
    const subject = String(data.get("subject") || "").trim();
    const message = String(data.get("message") || "").trim();
    const body = [
      "Sender email: " + senderEmail,
      "",
      "Message:",
      message,
    ].join("\n");
    const mailto =
      "mailto:dambrosioa@usf.edu?subject=" +
      encodeURIComponent(subject) +
      "&body=" +
      encodeURIComponent(body);

    if (status) status.textContent = "Opening your email application with the prepared message...";
    window.location.href = mailto;
  });
})();
