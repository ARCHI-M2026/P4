import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { Request } from 'express'
import { JwtPayload } from "./interface/jwt-payload.interface";

@Injectable()
export class JwtAuthGuard implements CanActivate {

    constructor(private readonly jwtService: JwtService){}

    // Isole le token si format ok Header.Authorization: Bearer <token>
    private extractToken(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? []
        return type === 'Bearer' ? token : undefined
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>()

        // Vérifier la présence token
        const token = this.extractToken(request)
        if(!token) throw new UnauthorizedException('Invalid session')

        try{
            // Check et décode token
            const payload = await this.jwtService.verifyAsync<JwtPayload>(token)

            // Inject le payload user pour les controllers
            request['user'] = payload
            return true

        }catch{
            throw new UnauthorizedException('Invalid or expired token')
        }
    }
}