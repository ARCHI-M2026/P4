import { Controller, Post, Body } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiOkResponse, ApiCreatedResponse, ApiUnauthorizedResponse, ApiBadRequestResponse } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  @ApiOperation({ summary: "Se connecter et obtenir un token JWT" })
  @ApiOkResponse({
    description: "Connexion réussie",
    schema: {
      properties: {
        access_token: { type: "string", description: "Token JWT" },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: "Email ou mot de passe incorrect" })
  login(@Body() dto: LoginDto): Promise<{ access_token: string }> {
    return this.authService.login(dto);
  }

  @Post('register')
  @ApiOperation({ summary: "Créer un compte utilisateur" })
  @ApiCreatedResponse({ description: "Compte créé avec succès" })
  @ApiUnauthorizedResponse({ description: "Un compte existe déjà avec cet email" })
  @ApiBadRequestResponse({ description: "Email invalide ou mot de passe trop court" })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }
}
