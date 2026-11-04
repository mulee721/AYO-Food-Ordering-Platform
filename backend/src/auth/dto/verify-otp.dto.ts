import { IsEmail, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpDto {
  @ApiProperty({ example: 'customer@ayo.food' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '482916' })
  @IsString()
  @Length(6, 6)
  otp: string;
}
