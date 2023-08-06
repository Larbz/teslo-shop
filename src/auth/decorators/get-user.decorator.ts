import {
  ExecutionContext,
  InternalServerErrorException,
  createParamDecorator,
} from '@nestjs/common';

export const GetUser = createParamDecorator((data, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  const user = req.user;
  if (!user) throw new InternalServerErrorException('User not found (request)');
  if (!data) return user;
  if (Array.isArray(data)) {
    return data.reduce((prev, current) => {
      prev[current] = user[current];
      return prev;
    }, {});
  }
  return user[data];
});
