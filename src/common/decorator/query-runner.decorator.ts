import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const QueryRunnerDecorator = createParamDecorator(
  (data, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    if (!request.queryRunner) {
      throw new Error(
        'QueryRunnerDecorator decorator is not used within a TransactionInterceptor.',
      );
    }

    return request.queryRunner;
  },
);
