import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class autDTO {
  @IsEmail()
  email!: string;

  @IsNotEmpty() @IsString()
  password!: string;
}
