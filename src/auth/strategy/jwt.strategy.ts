import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma/prisma.service';

type UserId = string;
type JwtPayload = {
  email: string;
  sub: UserId;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate({ sub }: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: sub,
      },
    });

    delete user.password;

    return user;
  }
}
