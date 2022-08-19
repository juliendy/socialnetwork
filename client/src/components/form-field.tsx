import React from "react";
// --------------------------------------------------------------------------------------defining types
interface FormFieldProps {
    name: string;
    label: string;
    type: "text" | "email" | "password";
    id: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

// ---------------------------------------------------------------------------------------defining my component using our defined Formfieldprops from above

const FormField = (props: FormFieldProps) => {
    return (
        <div className="form-field">
            {/* htmlFor has to be pointing at an id */}
            <label className="form-label" htmlFor={props.id}>
                {props.label}
            </label>
            <input
                type={props.type}
                name={props.name}
                id={props.id}
                value={props.value}
                onChange={props.onChange}
            />
        </div>
    );
};

// ----------------------------------------------------------------------------------------------------------exporting my component
export default FormField;
