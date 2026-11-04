import { IsEmail, IsString, Length, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ example: 'customer@ayo.food' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '482916' })
  @IsString()
  @Length(6, 6)
  otp: string;

  @ApiProperty({ example: 'NewSecurePass123', minLength: 6 })
  @IsString()
  @MinLength(6)
  newPassword: string;
}
