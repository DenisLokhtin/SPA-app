import {Module, NestModule, MiddlewareConsumer, RequestMethod,} from '@nestjs/common';
import {TypeOrmModule} from "@nestjs/typeorm";
import {ConfigModule} from "@nestjs/config";
import {dataSourceOptions} from "../db/data-source";
import {CommentModule} from './comment/comment.module';
import { AuthMiddleware } from './user/middleware/auth.middleware';
import {UserModule} from "./user/user.module";

@Module({
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRoot(dataSourceOptions),
        CommentModule,
        UserModule,
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(AuthMiddleware)
            .exclude(
                {path: '/user/register', method: RequestMethod.ALL},
                {path: '/user/login', method: RequestMethod.ALL},
            )
            .forRoutes({
                path: '*',
                method: RequestMethod.ALL,
            });
    }
}
