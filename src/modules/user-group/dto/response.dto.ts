export class GroupDetailReponseDto {
    id: number;
    name: string;
    level: number;
    parentId: number | null;
    children: GroupDetailReponseDto[];
}
