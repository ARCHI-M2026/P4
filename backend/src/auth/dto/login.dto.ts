import { IsEmail, IsString, MinLength, IsNotEmpty } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class LoginDto {
    @ApiProperty({ example: "utilisateur@example.com" })
    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @ApiProperty({ example: "password123", minLength: 8 })
    @IsString()
    @MinLength(8)
    password!: string;
}
