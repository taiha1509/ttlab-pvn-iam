import { Controller, Get } from '@nestjs/common';
import { ROUTE_PREFIX_APP } from './common/constants';

@Controller(`${ROUTE_PREFIX_APP}`)
export class AppController {
    @Get('/ping')
    pingAlive() {
        return 'pong';
    }
}
