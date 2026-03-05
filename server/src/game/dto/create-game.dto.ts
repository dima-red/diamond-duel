import { IsInt, IsPositive, Max, Min } from 'class-validator';

export class CreateGameDto {
  @IsInt()
  @Min(2)
  @Max(6)
  size!: number;

  @IsInt()
  @IsPositive()
  diamondsCount!: number;
}

