(function () {
  const buttons = document
    .querySelectorAll(".fullscreen-cmd");
  buttons.forEach(function (fullscreenBtn) {
    fullscreenBtn?.addEventListener("click", (ev) => {
      ev.preventDefault();
      const element = ev.target;
      if (element.getAttribute("data-fullscreen") === "false") {
        document.querySelector("body").classList.add("fullscreen");
        buttons.forEach(function (button) {
          button.setAttribute("data-fullscreen", "true");
          button.innerText = "Exit fullscreen";
        });
        document.querySelector(".general-info").open = false;
      } else {
        document.querySelector("body").classList.remove("fullscreen");
        buttons.forEach(function (button) {
          button.setAttribute("data-fullscreen", "false");
          button.innerText = "Fullscreen";
        });
        document.querySelector(".general-info").open = true;
      }
    });
  });
})();
