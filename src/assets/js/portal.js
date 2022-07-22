(function () {
  const fullscreenBtn = document.querySelector(".fullscreen-cmd");
  fullscreenBtn?.addEventListener("click", (ev) => {
    ev.preventDefault();
    const btn = ev.target;
    if (btn.getAttribute("data-fullscreen") === "false") {
      document.querySelector("body").classList.add("fullscreen");
      btn.setAttribute("data-fullscreen", "true");
      btn.innerText = "Exit fullscreen";
    } else {
      document.querySelector("body").classList.remove("fullscreen");
      btn.setAttribute("data-fullscreen", "false");
      btn.innerText = "Fullscreen";
    }
  });
})();
