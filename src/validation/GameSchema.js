import * as yup from 'yup';

/**
 * Validation schema for the Game Settings form.
 * Utilizes `yup` to enforce data types, constraints, and complex conditional requirements.
 * This schema ensures that board dimensions are within technical limits and that 
 * specific configurations (like bot difficulty or online nicknames) are provided 
 * only when the relevant game mode is selected.
 * * @constant
 * @type {yup.ObjectSchema}
 */
export const gameSchema = yup.object({
  /**
   * Defines the primary game mode. 
   * Must be either 'bot' (Local) or 'online' (SignalR).
   */
  mode: yup
    .string()
    .required('Оберіть режим гри')
    .oneOf(['bot', 'online'], 'Невірний режим гри'),

  /**
   * Bot difficulty level. Required only if 'mode' is set to 'bot'.
   */
  LevelBot: yup.string().when('mode', {
    is: 'bot',
    then: (schema) => schema.required('Оберіть рівень бота'),
    otherwise: (schema) => schema.notRequired(), 
  }),

  /**
   * Determines who makes the first move. Required only if 'mode' is set to 'bot'.
   */
  firstPlayer: yup.string().when('mode', {
    is: 'bot',
    then: (schema) => schema.required('Оберіть першого гравця'),
    otherwise: (schema) => schema.notRequired(),
  }),

  /**
   * Visual color for the human player's pieces. Required only if 'mode' is set to 'bot'.
   */
  playerColor: yup.string().when('mode', {
    is: 'bot',
    then: (schema) => schema.required('Оберіть колір ваших фішок'),
    otherwise: (schema) => schema.notRequired(),
  }),

  /**
   * Visual color for the AI bot's pieces. Required only if 'mode' is set to 'bot'.
   */
  botColor: yup.string().when('mode', {
    is: 'bot',
    then: (schema) => schema.required('Оберіть колір фішок бота'),
    otherwise: (schema) => schema.notRequired(),
  }),

  /**
   * Number of rows in the game grid. Range: 4 to 10.
   */
  rows: yup
    .number()
    .typeError('Має бути число')
    .required('Введіть кількість рядків')
    .min(4, 'Мінімум 4 рядки')
    .max(10, 'Максимум 10 рядків')
    .integer('Має бути ціле число'),

  /**
   * Number of columns in the game grid. Range: 4 to 10.
   */
  columns: yup
    .number()
    .typeError('Має бути число')
    .required('Введіть кількість колонок')
    .min(4, 'Мінімум 4 колонки')
    .max(10, 'Максимум 10 колонки')
    .integer('Має бути ціле число'),

  /**
   * Optional time limit for a single turn in seconds. 
   * Range: 5 to 120 seconds. Empty strings are transformed to null.
   */
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

  /**
   * User nickname for online identity. 
   * Required only if 'mode' is 'online' and the GDPR consent for nickname usage ($canUseNickname) is granted.
   */
  nickname: yup.string().when(['mode', '$canUseNickname'], ([mode, canUseNickname], schema) => {
    if (mode === 'online' && canUseNickname) {
      return schema.required('Введіть нікнейм');
    }
    return schema.notRequired();
  }),

  /**
   * Code to join a specific multiplayer room. Optional during creation, required contextually.
   */
  roomCode: yup.string().when('mode', {
    is: 'online',
    then: (schema) => schema,
    otherwise: (schema) => schema.notRequired(),
  }),
});