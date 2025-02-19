export type UploaderUtils = ReturnType<typeof uploaderUtils>;

export const uploaderUtils = () => {
    /**
     * Arguments for the drag over action.
     *
     * @property event - The event object associated with the drag over action.
     * @property isDragging - The current dragging state.
     * @property isInternalDragging - Indicates if there is internal dragging activity, therefore should not trigger showing the drop hint.
     * @property isUploadDisabled - Indicates if the upload functionality is disabled.
     */
    type DragOverActionArgs = {
        event: Event;
        isDragging: boolean;
        isInternalDragging: boolean;
        isUploadDisabled: boolean;
    };

    let canCloseBackboard = false;

    function dragOverAction(overActionArgs: DragOverActionArgs) {
        const { event, isDragging, isInternalDragging, isUploadDisabled } =
            overActionArgs;

        event.preventDefault();
        event.stopImmediatePropagation();

        if (isInternalDragging || isUploadDisabled) {
            return { showDropUploadBoard: false };
        }

        if (isDragging) {
            canCloseBackboard = false;
            return { showDropUploadBoard: true };
        } else {
            if (!canCloseBackboard) {
                canCloseBackboard = true;
                return { showDropUploadBoard: true };
            }
            return { showDropUploadBoard: false };
        }
    }

    function extractDroppedFiles(event: DragEvent, isUploadDisabled: boolean) {
        event.preventDefault();
        event.stopImmediatePropagation();

        if (!event.dataTransfer?.items || isUploadDisabled) {
            return { files: [], folders: [] };
        }

        const files: FileSystemFileEntry[] = [];
        const folders: FileSystemDirectoryEntry[] = [];

        Array.from(event.dataTransfer.items).forEach((item) => {
            if (item.kind !== "file") return;
            const entry = item.webkitGetAsEntry();
            if (!entry) throw new Error("Failed to get entry");

            if (entry.isFile) {
                files.push(entry as FileSystemFileEntry);
            } else if (entry.isDirectory) {
                folders.push(entry as FileSystemDirectoryEntry);
            }
        });

        return { files, folders };
    }

    return { dragOverAction, extractDroppedFiles };
};
