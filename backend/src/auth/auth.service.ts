import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from '../schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { EmailService } from './email.service';

const OTP_TTL_MINUTES = 10;

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  // ── Register ──────────────────────────────────────────────────────────────
  async register(dto: RegisterDto) {
    const exists = await this.userModel.findOne({ email: dto.email.toLowerCase() });
    if (exists) throw new ConflictException('An account with this email already exists');

    const hashed = await bcrypt.hash(dto.password, 12);
    const user = await this.userModel.create({
      name: dto.name,
      email: dto.email.toLowerCase(),
      password: hashed,
      phone: dto.phone || '',
      role: (dto.role || 'customer') as any,
    });

    return { message: 'Account created successfully', token: this.signToken(user), user: this.sanitize(user) };
  }

  // ── Login ─────────────────────────────────────────────────────────────────
  async login(dto: LoginDto) {
    const user = await this.userModel.findOne({ email: dto.email.toLowerCase() });
    if (!user) throw new UnauthorizedException('Invalid email or password');
    if (user.status === 'Suspended') throw new UnauthorizedException('This account has been suspended');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid email or password');

    return { message: 'Login successful', token: this.signToken(user), user: this.sanitize(user) };
  }

  // ── Get profile ───────────────────────────────────────────────────────────
  async getProfile(userId: string) {
    const user = await this.userModel.findById(userId).select('-password').lean();
    if (!user) throw new UnauthorizedException('User not found');
    return user;
  }

  // ── Step 1: Request OTP ───────────────────────────────────────────────────
  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userModel.findOne({ email: dto.email.toLowerCase() });

    // Always return success to prevent email enumeration
    if (!user) {
      return { message: 'If an account with that email exists, a reset code has been sent.' };
    }

    // Generate a cryptographically random 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expiry = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

    // Save hashed OTP + expiry to user document
    await this.userModel.findByIdAndUpdate(user._id, {
      resetOtp: hashedOtp,
      resetOtpExpiry: expiry,
    });

    // Send email with plain OTP
    await this.emailService.sendOtpEmail(user.email, user.name, otp);

    return { message: 'If an account with that email exists, a reset code has been sent.' };
  }

  // ── Step 2: Verify OTP (without resetting yet) ────────────────────────────
  async verifyOtp(dto: VerifyOtpDto) {
    const user = await this.userModel.findOne({ email: dto.email.toLowerCase() });
    if (!user || !user.resetOtp || !user.resetOtpExpiry) {
      throw new BadRequestException('Invalid or expired reset code.');
    }

    if (new Date() > user.resetOtpExpiry) {
      throw new BadRequestException('This reset code has expired. Please request a new one.');
    }

    const valid = await bcrypt.compare(dto.otp, user.resetOtp);
    if (!valid) {
      throw new BadRequestException('Incorrect reset code. Please check your email and try again.');
    }

    return { message: 'Code verified. You may now set a new password.' };
  }

  // ── Step 3: Reset password (OTP re-verified server-side) ──────────────────
  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.userModel.findOne({ email: dto.email.toLowerCase() });
    if (!user || !user.resetOtp || !user.resetOtpExpiry) {
      throw new BadRequestException('Invalid or expired reset code.');
    }

    if (new Date() > user.resetOtpExpiry) {
      throw new BadRequestException('This reset code has expired. Please request a new one.');
    }

    const valid = await bcrypt.compare(dto.otp, user.resetOtp);
    if (!valid) {
      throw new BadRequestException('Incorrect reset code.');
    }

    // Hash new password and clear OTP fields
    const hashed = await bcrypt.hash(dto.newPassword, 12);
    await this.userModel.findByIdAndUpdate(user._id, {
      password: hashed,
      $unset: { resetOtp: '', resetOtpExpiry: '' },
    });

    return { message: 'Password updated successfully. You can now sign in.' };
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  private signToken(user: UserDocument) {
    return this.jwtService.sign({ sub: user._id.toString(), email: user.email, role: user.role });
  }

  private sanitize(user: UserDocument) {
    const obj = user.toObject();
    delete obj.password;
    delete obj.resetOtp;
    delete obj.resetOtpExpiry;
    return obj;
  }
}
