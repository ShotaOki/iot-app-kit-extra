export interface FontDataParameter {
    fontFamily?: string;
    fontTexture?: string;
}
export declare class FontData {
    private _fontFamily;
    private _fontTexture;
    constructor(parameter: FontDataParameter);
    get familiy(): string;
    get texture(): string;
    static default(): FontData;
}
