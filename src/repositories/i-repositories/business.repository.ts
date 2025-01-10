import { CreateBusinessDto } from 'src/business/dtos/business.dto';

export interface IBusinessRepository {
  deleteById(id: number);
  create(data: CreateBusinessDto, userId: number);
  // updateBusiness(id: string, business: Business): Promise<Business | null>;
  // deleteBusiness(id: string): Promise<boolean>;
  getbusinessbyId(businesId: number);
}
