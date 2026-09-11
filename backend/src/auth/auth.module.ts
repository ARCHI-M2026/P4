import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtAuthGuard } from "./jwt-guard";
import { JwtModule } from "@nestjs/jwt";
import type { StringValue } from "ms";


@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard],
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: (process.env.JWT_DURING ?? '1h') as StringValue }
    })
  ],
  exports: [JwtAuthGuard, JwtModule]
})
export class AuthModule {}
