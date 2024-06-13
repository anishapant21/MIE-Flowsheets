interface FieldItems {
    string: string,
    choice: string,
    date: string
}

type FieldItemType = keyof FieldItems;

type Props = {
    type: FieldItemType
}

const GetDisplayItems = (props: Props) => {
    const { type } = props;

    if (type === "string") {
        return <input placeholder="Enter a value" disabled />;
    } else if (type === "choice") {
        return (
            <select value={"select one"} disabled>
                <option label="Select a value" />
            </select>
        );
    } else if (type === "date") {
        return (
            <select value={"select one"} disabled>
                <option label="Select the date" />
            </select>
        );
    } else {
        return <input placeholder="URL Link" disabled />;
    }
}

export default GetDisplayItems;
