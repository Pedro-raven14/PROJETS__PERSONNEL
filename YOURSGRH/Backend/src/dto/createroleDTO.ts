import { IsNotEmpty, IsString } from "class-validator";

export class createroleDTO {
  @IsNotEmpty() @IsString()
  nom!: string;
}
