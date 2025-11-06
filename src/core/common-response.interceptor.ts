import { BadRequestException, CallHandler, ConflictException, ExecutionContext, Injectable, InternalServerErrorException, Logger, NestInterceptor, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { catchError, Observable } from 'rxjs'
import { EntityNotFoundError } from 'typeorm'
@Injectable()
export class CommonResponseInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CommonResponseInterceptor.name)
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle()
      .pipe(catchError(error => {
        this.logger.error(error)

        switch (error.constructor) {
          case EntityNotFoundError: // Response Code: 404
            throw new NotFoundException()
          case NotFoundException: // Response Code: 404
            throw error
          case BadRequestException: // Response Code: 400
            throw error
          case UnauthorizedException: // Response Code: 401
            throw error
          case ConflictException: // Response Code: 409
            throw error
        }

        switch (error.status) {
          case 404: // Response Code: 404
            throw error
          case 400: // Response Code: 400
            throw error
          case 401: // Response Code: 401
            throw error
          case 403: // Response Code: 403
            throw error
          case 413: // Response Code: 403
            throw error
          case 409: // Response Code: 409
            throw error
          default: // Response Code: 500
            throw new InternalServerErrorException(error?.message ?? 'Internal Server Error')
        }
      }))
  }
}