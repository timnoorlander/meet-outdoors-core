import { ForbiddenException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable({})
export class AuthService {
  constructor(private prisma: PrismaService) {}

  login(loginDto: LoginDto) {
    return 'sucessfully signed up.';
  }

  async register(registerDto: RegisterDto) {
    const { email, password } = registerDto;
    const numberOfHashRounds = 10;

    try {
      const hashedPassword = await bcrypt.hash(password, numberOfHashRounds);

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
