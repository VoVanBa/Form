import { CreateBusinessDto } from 'src/business/dtos/business.dto';

export interface IBusinessRepository {
  getAllBusinesses();
  deleteById(id: string);
  create(business: CreateBusinessDto);
  // updateBusiness(id: string, business: Business): Promise<Business | null>;
  // deleteBusiness(id: string): Promise<boolean>;
}
