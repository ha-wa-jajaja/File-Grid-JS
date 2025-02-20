import { FileGridFileUploader, FileGridContainer } from "../dist/index.mjs";

const allIds = Array.from({ length: 100 }, (_, i) => i + 1);

// const fileUploader = new FileGridFileUploader("#uploader");

const container = document.querySelector("#file-grid");
allIds.forEach((id) => {
    const file = document.createElement("div");
    file.classList.add("file");
    file.draggable = true;
    file.innerHTML = `
        <div class="file__thumbnail" >
            <img src="https://placehold.co/400x400?text=File+${id}" alt="File ${id}">
        </div>
    `;
    container.appendChild(file);
});

document.addEventListener("DOMContentLoaded", () => {
    const fileGridContainer = new FileGridContainer("#file-grid", {
        itemClassName: "file",
        uploader: "#uploader",
        multiBoard: ".multi-board",
        allIds,
    });

    console.log(fileGridContainer);
});
