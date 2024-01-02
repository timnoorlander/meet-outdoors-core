import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';

@Injectable({})
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordVerified = await bcrypt.compare(
      dto.password,
      user.password,
    );

    if (!isPasswordVerified) {
      throw new UnauthorizedException('Password incorrect');
    }

    return this.signToken(user.id, user.email);
  }

  async register({ email, password }: RegisterDto) {
    const NUMBER_OF_HASH_ROUNDS = 10;

    try {
      const hashedPassword = await bcrypt.hash(password, NUMBER_OF_HASH_ROUNDS);

      const user = await this.prisma.user.create({
        data: { email, password: hashedPassword },
      });

      return this.signToken(user.id, user.email);
    } catch (error) {
      const duplicateEntryErrorCode = 'P2002';

      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === duplicateEntryErrorCode
      ) {
        throw new ForbiddenException('Credentials taken');
      }

      throw error;
    }
  }

  async signToken(
    userId: string,
    email: string,
  ): Promise<{ accessToken: string }> {
    const payload = {
      sub: userId,
      email: email,
    };

    const accessToken = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: process.env.JWT_SECRET,
    });

    return { accessToken };
  }
}
