interface FieldItems {
    string: string,
    choice: string,
    date: string
}

type FieldItemType = keyof FieldItems;

type Props = {
    type: any
}

const GetDisplayIcons = (props: Props) => {
    const { type } = props
    if (type === "string") {
        return <i className="bi bi-input-cursor-text element-icon"></i>;
    } else if (type === "choice") {
        return (
            <i className="bi bi-menu-button-wide element-icon"></i>
        );
    } else if (type === "date") {
        return (
            <i className="bi bi-calendar2 element-icon"></i>
        );
    } else {
        return <i className="bi bi-link element-icon"></i>;
    }
}

export default GetDisplayIcons