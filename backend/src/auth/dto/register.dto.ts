import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"


export class RegisterDto {
    @ApiProperty({ example: "utilisateur@example.com" })
    @IsEmail({}, { message: "Invalid email format" })
    @IsNotEmpty({ message: "Email is required" })
    email!: string;

    @ApiProperty({ example: "password123", minLength: 8 })
    @IsString()
    @MinLength(8, { message: "Password must be at least 8 characters long" })
    password!: string;
}
