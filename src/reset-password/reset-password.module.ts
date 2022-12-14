import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ResetPasswordService } from './reset-password.service';
import { ResetPasswordController } from './reset-password.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResetPassword } from './entities/reset-password.entity';
import { MailerModule } from '@nestjs-modules/mailer';
import { UsersModule } from 'src/users/users.module';
import { mailerAsyncConfig } from 'src/config/mailer.config';
import { ForgotPasswordMiddleware } from 'src/middlewares/forgot-password.middleware';
import { ResetPasswordMiddleware } from 'src/middlewares/reset-password.middleware';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([ResetPassword]),
    MailerModule.forRootAsync(mailerAsyncConfig),
  ],
  controllers: [ResetPasswordController],
  providers: [ResetPasswordService],
})
export class ResetPasswordModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ForgotPasswordMiddleware)
      .forRoutes({ path: 'reset-password/email', method: RequestMethod.POST });

    consumer
      .apply(ResetPasswordMiddleware)
      .forRoutes({ path: 'reset-password', method: RequestMethod.POST });
  }
}
