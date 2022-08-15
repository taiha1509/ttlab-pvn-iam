import { AxiosResponse } from 'axios';

export interface IResponseError {
    key: string;
    errorCode: number;
    message: string;
    rule?: string;
    path?: string;
}

// Interfaces for general response of all apis
export interface IBodyResponse<T> extends AxiosResponse {
    success: boolean;
    isRequestError?: boolean;
    code: number;
    message: string;
    data: T;
    errors?: IResponseError[];
}

export interface IDataList<T> {
    items: T[];
    totalItems: number;
}

export type QueryType =
    | string
    | number
    | number[]
    | string[]
    | Record<string, string | number>
    | Record<string, string | number>[];

export type BodyType = QueryType & Date;

export interface IDeleteResponseDto {
    id: number;
}
