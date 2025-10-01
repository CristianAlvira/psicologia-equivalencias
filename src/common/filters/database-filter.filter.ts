import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { DatabaseError } from 'pg';
import { QueryFailedError } from 'typeorm';

@Catch(QueryFailedError)
export class DatabaseErrorHandler implements ExceptionFilter {
  private readonly logger = new Logger('DatabaseExceptionFilter');

  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const pgError = exception.driverError as DatabaseError;
    const code = pgError?.code || '';
    const detail = pgError?.detail || '';
    const constraint = pgError?.constraint || '';

    this.logger.error(
      `Database error in ${request.method} ${request.url}: Code ${code} - ${detail}`,
    );

    const { status, message } = this.mapDatabaseError(code, detail, constraint);

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      error: 'Database Error',
    });
  }

  private mapDatabaseError(
    code: string,
    detail: string,
    constraint: string,
  ): { status: number; message: string } {
    switch (code) {
      case '23505': // unique_violation
        return {
          status: HttpStatus.CONFLICT,
          message: this.formatUniqueViolationMessage(detail, constraint),
        };

      case '23503': // foreign_key_violation
        return {
          status: HttpStatus.BAD_REQUEST,
          message: `Foreign key constraint violation: ${detail || 'Referenced resource does not exist'}`,
        };

      case '23514': // check_violation
        return {
          status: HttpStatus.BAD_REQUEST,
          message: `Check constraint violation: ${detail || 'Invalid data provided'}`,
        };

      case '23502': // not_null_violation
        return {
          status: HttpStatus.BAD_REQUEST,
          message: `Required field missing: ${detail || 'Null value not allowed'}`,
        };

      case '42P01': // undefined_table
      case '42703': // undefined_column
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Database configuration error',
        };

      default:
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'An unexpected database error occurred',
        };
    }
  }

  private formatUniqueViolationMessage(
    detail: string,
    constraint: string,
  ): string {
    if (constraint) {
      // Ejemplo: "products_name_unique" -> "Name already exists"
      const field = constraint.split('_').slice(1, -1).join('_');
      if (field) {
        return `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
      }
    }

    return `Duplicate entry: ${detail || 'Resource already exists'}`;
  }
}
