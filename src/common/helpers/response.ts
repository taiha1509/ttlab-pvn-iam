import { Injectable } from '@nestjs/common';
import ConfigKey from '../config/config-key';
import * as dotenv from 'dotenv';
import { HttpStatus } from '../constants';
dotenv.config();

const DEFAULT_SUCCESS_MESSAGE = 'success';
const version = process.env[ConfigKey.VERSION];

export interface IErrorResponse {
    key: string;
    errorCode: number;
    message: string;
}

export class SuccessResponse {
    constructor(data = {}) {
        return {
            code: HttpStatus.OK,
            message: DEFAULT_SUCCESS_MESSAGE,
            data,
            version,
        };
    }
}
export class ErrorResponse {
    constructor(
        code = HttpStatus.INTERNAL_SERVER_ERROR,
        message = '',
        errors: IErrorResponse[] = [],
    ) {
        return {
            code,
            message,
            errors,
            version,
        };
    }
}

@Injectable()
export class ApiResponse<T> {
    public code: number;

    public message: string;

    public data: T;

    public errors: IErrorResponse[];
}

export class CommonListResponse<T> {
    items: T[];
    totalItems?: number;
}
