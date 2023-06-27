export type DOMProps = {
    className?: string[];
    id?: string;
    style?: Partial<CSSStyleDeclaration>;
    [props: string]: any;
};

export interface Node {
    id: string;
    el: HTMLElement;
}