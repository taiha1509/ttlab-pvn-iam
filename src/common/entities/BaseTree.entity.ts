export class BaseTree<T extends BaseTree<T>> {
    id: number;
    name: string;
    children: T[];
    parentId: number | null;
}
