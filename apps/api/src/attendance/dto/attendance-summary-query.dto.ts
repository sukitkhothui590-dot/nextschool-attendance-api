import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, Validate } from 'class-validator';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { isValidDateOnly } from '../../common/time/bangkok-time';

@ValidatorConstraint({ name: 'isStrictDateOnly', async: false })
export class IsStrictDateOnlyConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    return typeof value === 'string' && isValidDateOnly(value);
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must be a valid YYYY-MM-DD calendar date.`;
  }
}

export class AttendanceSummaryQueryDto {
  @ApiPropertyOptional({ example: '2026-07-31' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @Validate(IsStrictDateOnlyConstraint)
  date?: string;
}
