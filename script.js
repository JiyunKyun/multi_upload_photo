document.getElementById("add-photo").addEventListener("click", function () {
  document.getElementById("photo-input").click();
});

document.getElementById("photo-input").addEventListener("change", handleFiles);

document
  .getElementById("drop-area")
  .addEventListener("dragover", function (event) {
    event.preventDefault();
    event.stopPropagation();
    this.classList.add("dragover");
  });

document.getElementById("drop-area").addEventListener("dragleave", function () {
  this.classList.remove("dragover");
});

document.getElementById("drop-area").addEventListener("drop", function (event) {
  event.preventDefault();
  event.stopPropagation();
  this.classList.remove("dragover");

  let files = event.dataTransfer.files;
  handleFiles({ target: { files: files } });
});

let fileDetails = {};

function handleFiles(event) {
  let files = event.target.files;
  let container = document.getElementById("photo-upload-container");
  let dropArea = document.getElementById("drop-area");

  if (files.length > 0) {
    dropArea.style.opacity = "0"; // Hide the drop area
  }

  for (let i = 0; i < files.length; i++) {
    let file = files[i];
    let fileId = Date.now() + "_" + i; // Unique identifier for each file
    let div = document.createElement("div");
    div.classList.add("photo-box", "m-2");
    div.style.position = "relative";
    div.dataset.fileId = fileId;

    if (file.type.startsWith("image/")) {
      let reader = new FileReader();
      reader.onload = function (e) {
        div.innerHTML = `
                    <img src="${e.target.result}" alt="${file.name}" />
                    <input type="hidden" name="photos[]" value="${file.name}">
                    <button type="button" class="btn btn-warning btn-sm add-detail" style="position: absolute; bottom: 5px; left: 5px;">
                        Add Detail
                    </button>
                    <button type="button" class="btn btn-danger btn-sm remove-photo" style="position: absolute; top: 5px; right: 5px;">
                        &times;
                    </button>
                  `;
        container.appendChild(div);
      };
      reader.readAsDataURL(file);
    } else if (file.type === "application/pdf") {
      div.classList.add("pdf-box", "m-2");
      div.innerHTML = `
                  <div class="pdf-box-content">
                    <iframe src="${URL.createObjectURL(
                      file
                    )}" style="width: 100%; height: 100%; border: none;"></iframe>
                    <input type="hidden" name="photos[]" value="${file.name}">
                    <button type="button" class="btn btn-warning btn-sm add-detail" style="position: absolute; bottom: 5px; left: 5px;">
                        Add Detail
                    </button>
                    <button type="button" class="btn btn-danger btn-sm remove-photo" style="position: absolute; top: 5px; right: 5px;">
                        &times;
                    </button>
                  </div>
                `;
      container.appendChild(div);
    }

    // Initialize file details with empty values
    fileDetails[fileId] = {
      name: "",
      grade: "",
      institution: "",
      majors: "",
      score: "",
      description: "",
    };
  }
}

document.addEventListener("click", function (event) {
  if (event.target.matches(".remove-photo")) {
    let elementToRemove = event.target.closest(".photo-box, .pdf-box"); // Improved selector
    if (elementToRemove) {
      let fileId = elementToRemove.dataset.fileId;
      elementToRemove.remove(); // Remove the element
      delete fileDetails[fileId]; // Remove file details from the object

      if (document.querySelectorAll(".photo-box, .pdf-box").length === 0) {
        document.getElementById("drop-area").style.opacity = "1"; // Show drop area if no photos or PDFs
      }
    }
  } else if (event.target.matches(".add-detail")) {
    let parentDiv = event.target.closest(".photo-box, .pdf-box");
    let fileId = parentDiv.dataset.fileId;
    let imgSrc = parentDiv.querySelector("img");
    let pdfSrc = parentDiv.querySelector("iframe");

    if (imgSrc) {
      document.getElementById("modal-image-preview").src = imgSrc.src;
      document.getElementById("modal-image-preview").style.display = "block";
      document.getElementById("modal-pdf-preview").style.display = "none";
    } else if (pdfSrc) {
      document.getElementById("modal-pdf-preview").src = pdfSrc.src;
      document.getElementById("modal-image-preview").style.display = "none";
      document.getElementById("modal-pdf-preview").style.display = "block";
    } else {
      document.getElementById("modal-image-preview").style.display = "none";
      document.getElementById("modal-pdf-preview").style.display = "none";
    }

    // Populate modal with details
    document.getElementById("modal-employee-name").value =
      fileDetails[fileId].name;
    document.getElementById("modal-grade").value = fileDetails[fileId].grade;
    document.getElementById("modal-institution").value =
      fileDetails[fileId].institution;
    document.getElementById("modal-majors").value = fileDetails[fileId].majors;
    document.getElementById("modal-score").value = fileDetails[fileId].score;
    document.getElementById("modal-description").value =
      fileDetails[fileId].description;

    // Store the current fileId in the modal for reference
    document
      .getElementById("certificateDetailModal")
      .setAttribute("data-current-file-id", fileId);

    let modal = new bootstrap.Modal(
      document.getElementById("certificateDetailModal")
    );
    modal.show();
  }
});

document.getElementById("save-details").addEventListener("click", function () {
  let modal = bootstrap.Modal.getInstance(
    document.getElementById("certificateDetailModal")
  );
  let fileId = document
    .getElementById("certificateDetailModal")
    .getAttribute("data-current-file-id");

  // Save the current values in the modal to the fileDetails object
  fileDetails[fileId] = {
    name: document.getElementById("modal-employee-name").value,
    grade: document.getElementById("modal-grade").value,
    institution: document.getElementById("modal-institution").value,
    majors: document.getElementById("modal-majors").value,
    score: document.getElementById("modal-score").value,
    description: document.getElementById("modal-description").value,
  };

  modal.hide();
});
