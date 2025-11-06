import { CredsDto } from './dtos/creds.dto'
import { Body, Controller, Post, SetMetadata, UsePipes, ValidationPipe } from '@nestjs/common'
import { ApiBadRequestResponse, ApiCreatedResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger'
import { AuthService } from './auth.service'
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  @SetMetadata('no-auth', true)
  @ApiUnauthorizedResponse()
  @ApiBadRequestResponse()
  @ApiCreatedResponse()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async login(@Body() credsDto: CredsDto) {
    return await this.authService.authenticateUser(credsDto)
  }
}