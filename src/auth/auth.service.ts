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

  async getAccessToken(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    const unauthorizedException = new UnauthorizedException(
      'E-mail address or password incorrect.',
    );

    if (!user) {
      throw unauthorizedException;
    }

    const isPasswordVerified = await bcrypt.compare(
      dto.password,
      user.password,
    );

    if (!isPasswordVerified) {
      throw unauthorizedException;
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

  signToken(userId: string, email: string): Promise<string> {
    const payload = {
      sub: userId,
      email: email,
    };

    return this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: process.env.JWT_SECRET,
    });
  }
}
