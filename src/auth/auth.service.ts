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

@Injectable({})
export class AuthService {
  constructor(private prisma: PrismaService) {}

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

    return { msg: 'Logged in succesfully' };
  }

  async register({ email, password }: RegisterDto) {
    const NUMBER_OF_HASH_ROUNDS = 10;

    try {
      const hashedPassword = await bcrypt.hash(password, NUMBER_OF_HASH_ROUNDS);

      const user = await this.prisma.user.create({
        data: { email, password: hashedPassword },
        select: { email: true, createdAt: true },
      });

      return user;
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
}
