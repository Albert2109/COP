import * as yup from 'yup';

export const gameSchema = yup.object({
  mode: yup
    .string()
    .required('Оберіть режим гри')
    .oneOf(['bot', 'online'], 'Невірний режим гри'),

  LevelBot: yup.string().when('mode', {
    is: 'bot',
    then: (schema) => schema.required('Оберіть рівень бота'),
    otherwise: (schema) => schema.notRequired(), 
  }),

  firstPlayer: yup.string().when('mode', {
    is: 'bot',
    then: (schema) => schema.required('Оберіть першого гравця'),
    otherwise: (schema) => schema.notRequired(),
  }),

  playerColor: yup.string().when('mode', {
    is: 'bot',
    then: (schema) => schema.required('Оберіть колір ваших фішок'),
    otherwise: (schema) => schema.notRequired(),
  }),

  botColor: yup.string().when('mode', {
    is: 'bot',
    then: (schema) => schema.required('Оберіть колір фішок бота'),
    otherwise: (schema) => schema.notRequired(),
  }),

  rows: yup
    .number()
    .typeError('Має бути число')
    .required('Введіть кількість рядків')
    .min(4, 'Мінімум 4 рядки')
    .max(10, 'Максимум 10 рядків')
    .integer('Має бути ціле число'),

  columns: yup
    .number()
    .typeError('Має бути число')
    .required('Введіть кількість колонок')
    .min(4, 'Мінімум 4 колонки')
    .max(10, 'Максимум 10 колонок')
    .integer('Має бути ціле число'),

  moveTimeLimit: yup
    .number()
    .nullable()
    .transform((value, originalValue) =>
      String(originalValue).trim() === '' ? null : value
    )
    .typeError('Має бути число')
    .min(5, 'Мінімум 5 секунд')
    .max(120, 'Максимум 120 секунд')
    .integer('Має бути ціле число'),

  nickname: yup.string().when('mode', {
    is: 'online',
    then: (schema) => schema.required('Введіть нікнейм'),
    otherwise: (schema) => schema.notRequired(),
  }),

  roomCode: yup.string().when('mode', {
    is: 'online',
    then: (schema) => schema,
    otherwise: (schema) => schema.notRequired(),
  }),
});