import { Injectable, UnauthorizedException } from "@nestjs/common"
import { LoginDto } from "./dto/login.dto"
import { RegisterDto } from "./dto/register.dto"

import { PrismaService } from "../_prisma/prisma.service"
import { JwtService } from "@nestjs/jwt"
import * as bcrypt from "bcrypt"

import { User } from "../_generated/prisma/client"

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma : PrismaService
  ) {}

  async login(dto: LoginDto): Promise<{access_token: string}> {
    
    const user = await this.prisma.user.findUnique({ where: {email: dto.email} })
    if(!user) throw new UnauthorizedException('Bad Credentials')

    const valid = await bcrypt.compare(dto.password, user.passwordHash)
    if(!valid) throw new UnauthorizedException('Bad Credentials')

    const token = this.jwtService.sign({ id: user.id })
    return { access_token: token }
  }

  async register(dto: RegisterDto): Promise<User> {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new UnauthorizedException('User already exists');
    
    const hashedPassword = await bcrypt.hash(dto.password, parseInt(process.env.BCRYPT_SALT_ROUND ?? '10'));
    
    return await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash: hashedPassword
      }
    });
  }
}
