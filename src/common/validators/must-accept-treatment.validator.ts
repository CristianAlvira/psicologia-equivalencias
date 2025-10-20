import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'mustAcceptTreatment', async: false })
export class MustAcceptTreatmentConstraint
  implements ValidatorConstraintInterface
{
  validate(value: any) {
    return value === true;
  }

  defaultMessage() {
    return 'Debe aceptar las políticas de tratamiento de datos para continuar';
  }
}

export function MustAcceptTreatment(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: MustAcceptTreatmentConstraint,
    });
  };
}
