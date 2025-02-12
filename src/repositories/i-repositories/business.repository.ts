import { CreateBusinessDto } from 'src/business/dtos/business.dto';
import { Business } from 'src/models/Business';

export interface IBusinessRepository {
  deleteById(id: number);
  create(data: CreateBusinessDto, userId: number): Promise<Partial<Business>>;
  getbusinessbyId(businesId: number);
}
