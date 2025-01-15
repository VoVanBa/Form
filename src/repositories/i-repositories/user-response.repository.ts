export interface IUserResponseRepository {
  create(formId: number, guest: any, userId: number);
  findAllByFormId(formId: number);
  getUserResponse(formId: number);
}
