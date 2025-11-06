import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class AuthObject {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  authType: string
}