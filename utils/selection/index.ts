export type SelectionActions = "append" | "add-multi" | "toggle";

export type UpdateIdSelection = (params: {
    action: SelectionActions;
    id: string;
    allIds: string[];
    selectedIds: Set<string>;
}) => Set<string>;
