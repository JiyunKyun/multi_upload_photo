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

// Modify handleFiles function to use nested arrays
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
                    <input type="hidden" name="photos[${fileId}][file_name]" value="${file.name}">
                    <input type="hidden" name="photos[${fileId}][jenis_dokumen]" value="">
                    <input type="hidden" name="photos[${fileId}][tanggal_dokumen]" value="">
                    <input type="hidden" name="photos[${fileId}][description]" value="">
                    <input type="hidden" name="photos[${fileId}][seumur_hidup]" value="">
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
                    <input type="hidden" name="photos[${fileId}][file_name]" value="${
                file.name
            }">
                    <input type="hidden" name="photos[${fileId}][jenis_dokumen]" value="">
                    <input type="hidden" name="photos[${fileId}][tanggal_dokumen]" value="">
                    <input type="hidden" name="photos[${fileId}][description]" value="">
                    <input type="hidden" name="photos[${fileId}][seumur_hidup]" value="">
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
            file_name: file.name,
            jenis_dokumen: "",
            tanggal: "",
            description: "",
            seumur_hidup: false,
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

            if (
                document.querySelectorAll(".photo-box, .pdf-box").length === 0
            ) {
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
            document.getElementById("modal-image-preview").style.display =
                "block";
            document.getElementById("modal-pdf-preview").style.display = "none";
        } else if (pdfSrc) {
            document.getElementById("modal-pdf-preview").src = pdfSrc.src;
            document.getElementById("modal-image-preview").style.display =
                "none";
            document.getElementById("modal-pdf-preview").style.display =
                "block";
        } else {
            document.getElementById("modal-image-preview").style.display =
                "none";
            document.getElementById("modal-pdf-preview").style.display = "none";
        }

        // Populate modal with details
        document.getElementById("jenis-dokumen").value =
            fileDetails[fileId].jenis_dokumen;
        document.getElementById("tanggal-dokumen").value =
            fileDetails[fileId].tanggal;
        document.getElementById("deskripsi-dokumen").value =
            fileDetails[fileId].description;
        document.getElementById("seumur-hidup").checked =
            fileDetails[fileId].seumur_hidup;

        // Disable tanggal input if seumur hidup is checked
        if (fileDetails[fileId].seumur_hidup) {
            document.getElementById("tanggal-dokumen").disabled = true;
            document.getElementById("tanggal-dokumen").value = "";
        } else {
            document.getElementById("tanggal-dokumen").disabled = false;
        }

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

document.getElementById("seumur-hidup").addEventListener("change", function () {
    let isChecked = this.checked;
    document.getElementById("tanggal-dokumen").disabled = isChecked;
    if (isChecked) {
        document.getElementById("tanggal-dokumen").value = ""; // Clear tanggal if seumur hidup is checked
    }
});

// When saving details in the modal
document.getElementById("save-details").addEventListener("click", function () {
    let modal = bootstrap.Modal.getInstance(
        document.getElementById("certificateDetailModal")
    );

    let fileId = document
        .getElementById("certificateDetailModal")
        .getAttribute("data-current-file-id");

    console.log("Saving details for fileId:", fileId);

    // Simpan nilai saat ini dari modal ke dalam objek fileDetails
    fileDetails[fileId] = {
        jenis_dokumen: document.getElementById("jenis-dokumen").value,
        tanggal: document.getElementById("tanggal-dokumen").value,
        description: document.getElementById("deskripsi-dokumen").value,
        seumur_hidup: document.getElementById("seumur-hidup").checked,
    };

    console.log("Updated fileDetails:", fileDetails);

    // Perbarui input tersembunyi di kotak foto/pdf yang sesuai
    let parentDiv = document.querySelector(`[data-file-id='${fileId}']`);
    if (parentDiv) {
        parentDiv.querySelector(
            `[name="photos[${fileId}][jenis_dokumen]"]`
        ).value = fileDetails[fileId].jenis_dokumen;
        parentDiv.querySelector(
            `[name="photos[${fileId}][tanggal_dokumen]"]`
        ).value = fileDetails[fileId].tanggal;
        parentDiv.querySelector(
            `[name="photos[${fileId}][description]"]`
        ).value = fileDetails[fileId].description;
        parentDiv.querySelector(
            `[name="photos[${fileId}][seumur_hidup]"]`
        ).value = fileDetails[fileId].seumur_hidup;
    }

    modal.hide();
});
