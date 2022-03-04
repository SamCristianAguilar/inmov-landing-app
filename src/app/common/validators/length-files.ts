import { AbstractControl } from "@angular/forms";

export function LenghtArrayFiles(control: AbstractControl) {
    const selection: any = control.value;
    if(selection){
        if (selection.length < 4) {
            return { incorrect: true };
        }
    }

    return null;
}